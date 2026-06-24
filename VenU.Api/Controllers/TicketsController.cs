using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using VenU.Api.Data;
using VenU.Api.Models;
using VenU.Api.Services;

namespace VenU.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class TicketsController : ControllerBase
    {
        private readonly VenUDbContext _context;
        private readonly INotificationService _notificationService;

        public TicketsController(VenUDbContext context, INotificationService notificationService)
        {
            _context = context;
            _notificationService = notificationService;
        }

        [HttpPost("purchase")]
        public async Task<IActionResult> PurchaseTickets([FromBody] PurchaseTicketDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            if (dto.Quantity <= 0)
                return BadRequest("Quantity must be at least 1.");

            // Resolve attendee from JWT token
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdStr) || !Guid.TryParse(userIdStr, out Guid userId))
                return Unauthorized(new { message = "Invalid token." });

            var user = await _context.Users.FindAsync(userId);
            if (user == null)
                return NotFound("User not found.");

            // Fetch the event
            var evt = await _context.Events
                .Include(e => e.TicketTiers)
                .Include(e => e.Organizer)
                .FirstOrDefaultAsync(e => e.Id == dto.EventId);

            if (evt == null)
                return NotFound("Event not found.");

            // Verify event is published
            if (evt.Status != "Published")
                return BadRequest("This event is not open for ticket registration.");

            // Check if user already owns a ticket for this event to prevent duplication
            var alreadyHasTicket = await _context.Tickets.AnyAsync(t => t.EventId == dto.EventId && t.AttendeeId == userId);
            if (alreadyHasTicket)
                return Conflict("You already have a pass for this event.");

            // Resolve price and validity scope
            var tier = evt.TicketTiers.FirstOrDefault(t => t.TierName.Equals(dto.TierName, StringComparison.OrdinalIgnoreCase));
            decimal price = tier?.Price ?? 0.00M;

            // Generate booking transaction reference
            var bookingRef = "VNU-" + Guid.NewGuid().ToString("N").Substring(0, 8).ToUpper() + "-" + DateTimeOffset.UtcNow.ToUnixTimeMilliseconds().ToString().Substring(9);

            // Save Tickets and EventAttendees in Db
            for (int i = 0; i < dto.Quantity; i++)
            {
                var uniqueCode = (dto.Quantity > 1) ? $"{bookingRef}-{i + 1}" : bookingRef;

                // Create EventAttendee for Gate check-in scan
                var attendeeRecord = new EventAttendee
                {
                    Id = Guid.NewGuid(), // Will be encoded in QR code
                    EventId = evt.Id,
                    AttendeeName = $"{user.FirstName} {user.LastName}".Trim(),
                    AttendeeEmail = user.Email,
                    TicketType = dto.TierName,
                    IsPresent = false,
                    CreatedAt = DateTime.UtcNow
                };
                _context.EventAttendees.Add(attendeeRecord);

                // Create Ticket record
                var ticket = new Ticket
                {
                    Id = Guid.NewGuid(),
                    EventId = evt.Id,
                    AttendeeId = userId,
                    TicketCode = attendeeRecord.Id.ToString(), // Check-in scanner decodes this GUID
                    Status = "Valid",
                    CreatedAt = DateTime.UtcNow
                };
                _context.Tickets.Add(ticket);
            }

            await _context.SaveChangesAsync();

            // Trigger Notifications & Emails
            // 1. Notify Attendee
            var attendeeTitle = "🎫 Ticket Confirmed";
            var attendeeMsg = $"Successfully purchased {dto.Quantity} pass{(dto.Quantity > 1 ? "es" : "")} for \"{evt.Title}\". Your ticket wallet is updated.";
            await _notificationService.SendNotificationAsync(userId, attendeeTitle, attendeeMsg, sendEmail: true);

            // 2. Notify Organizer
            var organizerTitle = "🎟️ Ticket Registered";
            var organizerMsg = $"{user.FirstName} {user.LastName} has registered {dto.Quantity} ticket{(dto.Quantity > 1 ? "s" : "")} for your event \"{evt.Title}\".";
            await _notificationService.SendNotificationAsync(evt.OrganizerId, organizerTitle, organizerMsg, sendEmail: true);

            return Ok(new
            {
                success = true,
                message = "Tickets purchased successfully.",
                bookingReference = bookingRef
            });
        }

        [HttpGet("my-tickets")]
        public async Task<IActionResult> GetMyTickets()
        {
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdStr) || !Guid.TryParse(userIdStr, out Guid userId))
                return Unauthorized(new { message = "Invalid token." });

            var user = await _context.Users.FindAsync(userId);
            if (user == null)
                return NotFound("User not found.");

            // Fetch attendee tickets
            var tickets = await _context.Tickets
                .Include(t => t.Event)
                .ThenInclude(e => e.Organizer)
                .Where(t => t.AttendeeId == userId)
                .OrderByDescending(t => t.CreatedAt)
                .ToListAsync();

            // Fetch corresponding event attendees to map the tier name
            var attendees = await _context.EventAttendees
                .Where(a => a.AttendeeEmail == user.Email)
                .ToListAsync();

            var result = tickets.Select(t => {
                var attendeeRecord = attendees.FirstOrDefault(a => a.EventId == t.EventId);
                return new
                {
                    ticketId = t.TicketCode, // Guid representing EventAttendee.Id for scanner QR code
                    @event = new
                    {
                        id = t.Event.Id,
                        title = t.Event.Title,
                        category = t.Event.Category,
                        barangay = t.Event.Barangay,
                        city = t.Event.City,
                        date = t.Event.StartDateTime.ToString("MMMM dd, yyyy"),
                        time = t.Event.StartDateTime.ToString("h:mm tt"),
                        image = string.IsNullOrEmpty(t.Event.BannerUrl) ? "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&q=80" : t.Event.BannerUrl,
                        color = "from-purple-500 to-indigo-600"
                    },
                    tier = attendeeRecord?.TicketType ?? "General Admission",
                    quantity = 1,
                    paymentMethod = "GCash",
                    accountNumber = "09********",
                    claimedAt = t.CreatedAt.ToString("g"),
                    isDeleted = false // Added default state for wallet views
                };
            });

            return Ok(result);
        }
    }

    public class PurchaseTicketDto
    {
        public Guid EventId { get; set; }
        public string TierName { get; set; } = "General Admission";
        public int Quantity { get; set; } = 1;
        public string? PaymentMethod { get; set; }
        public string? AccountNumber { get; set; }
    }
}
