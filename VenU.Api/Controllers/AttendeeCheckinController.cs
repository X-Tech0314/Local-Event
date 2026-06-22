using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using VenU.Api.Data;
using VenU.Api.DTOs;

namespace VenU.Api.Controllers
{
    [Route("api/checkin")]
    [ApiController]
    [Authorize]
    public class AttendeeCheckinController : ControllerBase
    {
        private readonly VenUDbContext _context;

        public AttendeeCheckinController(VenUDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// POST /api/checkin/scan
        /// Validates a scanned QR token (EventAttendee.Id) and marks the attendee as present.
        /// The token must correspond to an event owned by the authenticated organizer.
        /// </summary>
        [HttpPost("scan")]
        public async Task<IActionResult> ScanQRCode([FromBody] ScanQrDto dto)
        {
            // Resolve organizer from JWT
            var userIdClaim = User.Claims.FirstOrDefault(c =>
                c.Type == JwtRegisteredClaimNames.Sub ||
                c.Type == ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out Guid organizerId))
                return Unauthorized(new { success = false, message = "Invalid token." });

            // The QR payload is the EventAttendee.Id (GUID) or optionally "VENU-{guid}"
            var rawToken = dto.Token?.Trim() ?? string.Empty;
            if (rawToken.StartsWith("VENU-", StringComparison.OrdinalIgnoreCase))
                rawToken = rawToken[5..];

            if (!Guid.TryParse(rawToken, out Guid attendeeRecordId))
            {
                return NotFound(new
                {
                    success = false,
                    message = "Invalid QR code. This ticket was not recognized."
                });
            }

            // Fetch the EventAttendee and its parent Event
            var attendee = await _context.EventAttendees
                .Include(a => a.Event)
                .FirstOrDefaultAsync(a => a.Id == attendeeRecordId);

            if (attendee == null)
            {
                return NotFound(new
                {
                    success = false,
                    message = "Ticket not found. Access Denied."
                });
            }

            // Verify organizer owns this event — prevent cross-event scanning
            if (attendee.Event.OrganizerId != organizerId)
            {
                return StatusCode(403, new
                {
                    success = false,
                    message = "You are not authorized to check in attendees for this event."
                });
            }

            // Duplicate check-in guard
            if (attendee.IsPresent)
            {
                return Conflict(new
                {
                    success = false,
                    alreadyCheckedIn = true,
                    message = $"Already checked in at {attendee.ArrivalTime:hh:mm tt} UTC",
                    attendeeName = attendee.AttendeeName,
                    ticketType = attendee.TicketType ?? "Standard",
                    eventTitle = attendee.Event.Title,
                    arrivalTime = attendee.ArrivalTime
                });
            }

            // Mark attendance
            attendee.IsPresent = true;
            attendee.ArrivalTime = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return Ok(new
            {
                success = true,
                message = "Access Granted! Welcome to the event.",
                attendeeName = attendee.AttendeeName,
                ticketType = attendee.TicketType ?? "Standard",
                eventTitle = attendee.Event.Title,
                arrivalTime = attendee.ArrivalTime
            });
        }

        /// <summary>
        /// GET /api/checkin/event/{eventId}/status
        /// Returns real-time check-in counts for a specific event (for live dashboard refresh).
        /// </summary>
        [HttpGet("event/{eventId}/status")]
        public async Task<IActionResult> GetCheckinStatus(Guid eventId)
        {
            var userIdClaim = User.Claims.FirstOrDefault(c =>
                c.Type == JwtRegisteredClaimNames.Sub ||
                c.Type == ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out Guid organizerId))
                return Unauthorized(new { message = "Invalid token." });

            var evt = await _context.Events
                .FirstOrDefaultAsync(e => e.Id == eventId && e.OrganizerId == organizerId);

            if (evt == null)
                return NotFound(new { message = "Event not found." });

            var attendees = await _context.EventAttendees
                .Where(a => a.EventId == eventId)
                .ToListAsync();

            return Ok(new
            {
                eventId = eventId,
                eventTitle = evt.Title,
                totalRegistered = attendees.Count,
                checkedIn = attendees.Count(a => a.IsPresent),
                pending = attendees.Count(a => !a.IsPresent),
                maxCapacity = evt.MaxCapacity
            });
        }
    }
}
