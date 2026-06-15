using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VenU.Api.Data;
using VenU.Api.DTOs;
using VenU.Api.Models;

namespace VenU.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class EventsController : ControllerBase
    {
        private readonly VenUDbContext _context;

        public EventsController(VenUDbContext context)
        {
            _context = context;
        }

        [HttpPost]
        [Authorize(Roles = "Organizer")]
        public async Task<IActionResult> CreateEvent([FromBody] CreateEventDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // Extract OrganizerId from claims
            var userIdClaim = User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out Guid organizerId))
            {
                return Unauthorized(new { message = "Invalid user token." });
            }

            var newEvent = new Event
            {
                Title = dto.Title,
                Description = dto.Description,
                Category = dto.Category,
                BannerUrl = dto.BannerUrl,
                StartDateTime = dto.StartDateTime,
                EndDateTime = dto.EndDateTime,
                TicketSalesStart = dto.TicketSalesStart,
                TicketSalesEnd = dto.TicketSalesEnd,
                StreetAddress = dto.StreetAddress,
                Barangay = dto.Barangay,
                City = dto.City,
                Province = dto.Province,
                Region = dto.Region,
                ZipCode = dto.ZipCode,
                Latitude = dto.Latitude,
                Longitude = dto.Longitude,
                AccessType = dto.AccessType,
                VerificationCode = dto.VerificationCode,
                MaxCapacity = dto.MaxCapacity,
                OrganizerId = organizerId,
                TicketTiers = dto.TicketTiers.Select(t => new EventTicketTier
                {
                    TierName = t.TierName,
                    AllocatedSlots = t.AllocatedSlots,
                    Price = t.Price,
                    ValidityScope = t.ValidityScope
                }).ToList()
            };

            _context.Events.Add(newEvent);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetEvent), new { id = newEvent.Id }, newEvent);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetEvent(Guid id)
        {
            var evt = await _context.Events
                .Include(e => e.TicketTiers)
                .Include(e => e.Organizer)
                .FirstOrDefaultAsync(e => e.Id == id);

            if (evt == null)
            {
                return NotFound();
            }

            return Ok(evt);
        }

        [HttpGet]
        [Authorize(Roles = "Organizer")]
        public async Task<IActionResult> GetOrganizerEvents()
        {
            var userIdClaim = User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out Guid organizerId))
            {
                return Unauthorized(new { message = "Invalid user token." });
            }

            var events = await _context.Events
                .Include(e => e.TicketTiers)
                .Where(e => e.OrganizerId == organizerId)
                .OrderByDescending(e => e.CreatedAt)
                .ToListAsync();

            return Ok(events);
        }
    }
}
