using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using VenU.Api.Data;
using VenU.Api.DTOs;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace VenU.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AnalyticsController : ControllerBase
    {
        private readonly VenUDbContext _context;

        public AnalyticsController(VenUDbContext context)
        {
            _context = context;
        }

        [HttpGet("overview")]
        [Authorize]
        public async Task<IActionResult> GetAnalyticsOverview([FromQuery] string range, [FromQuery] DateTime? start, [FromQuery] DateTime? end)
        {
            var userIdClaim = User.Claims.FirstOrDefault(c =>
                c.Type == JwtRegisteredClaimNames.Sub ||
                c.Type == ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out Guid organizerId))
            {
                return Unauthorized(new { message = "Invalid user token." });
            }

            // Resolve date window — default to all-time if not supplied
            DateTime startDate = start.HasValue ? start.Value.ToUniversalTime() : DateTime.MinValue;
            DateTime endDate   = end.HasValue   ? end.Value.ToUniversalTime()   : DateTime.MaxValue;

            // Fetch all organizer events with their ticket tiers
            var allOrganizerEvents = await _context.Events
                .Where(e => e.OrganizerId == organizerId)
                .Include(e => e.TicketTiers)
                .ToListAsync();

            var allEventIds = allOrganizerEvents.Select(e => e.Id).ToList();

            // Fetch attendees scoped to the date window
            var attendees = await _context.EventAttendees
                .Where(a => allEventIds.Contains(a.EventId)
                         && a.CreatedAt >= startDate
                         && a.CreatedAt <= endDate)
                .ToListAsync();

            // Events tracked = only events that had at least one attendee in this window
            var activeEventIds = attendees.Select(a => a.EventId).Distinct().ToHashSet();
            var activeEvents   = allOrganizerEvents.Where(e => activeEventIds.Contains(e.Id)).ToList();
            int totalEventsTracked = activeEvents.Count;

            // Registrant & ticket counts — all registrations count (free + paid)
            int totalRegistrants = attendees.Count;
            int totalTicketsSold = totalRegistrants;

            // Gross Sales: match TicketType name → EventTicketTier.Price
            var tierLookup = allOrganizerEvents
                .SelectMany(e => e.TicketTiers.Select(t => new { e.Id, t.TierName, t.Price }))
                .ToList();

            decimal grossSales = 0m;
            foreach (var attendee in attendees)
            {
                var tier = tierLookup.FirstOrDefault(t =>
                    t.Id == attendee.EventId &&
                    string.Equals(t.TierName, attendee.TicketType, StringComparison.OrdinalIgnoreCase));
                if (tier != null)
                    grossSales += tier.Price;
            }

            // Ticket Conversion = tickets sold / total capacity of active events * 100
            int totalCapacity = activeEvents.Sum(e => e.MaxCapacity);
            decimal ticketConversion = totalCapacity > 0
                ? Math.Round((decimal)totalTicketsSold / totalCapacity * 100, 1)
                : 0m;

            // Page Engagements placeholder: registrants * 3 + events * 15
            // (until a real traffic tracking system is built)
            int pageEngagements = (totalRegistrants * 3) + (totalEventsTracked * 15);

            var result = new AnalyticsOverviewDto
            {
                GrossSales         = grossSales,
                TicketConversion   = ticketConversion,
                PageEngagements    = pageEngagements,
                TotalTicketsSold   = totalTicketsSold,
                TotalRegistrants   = totalRegistrants,
                TotalEventsTracked = totalEventsTracked
            };

            return Ok(result);
        }
    }
}
