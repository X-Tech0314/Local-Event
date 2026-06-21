using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VenU.Api.Data;

namespace VenU.Api.Controllers
{
    [Route("api/admin/venues")]
    [ApiController]
    public class AdminVenuesController : ControllerBase
    {
        private readonly VenUDbContext _context;

        public AdminVenuesController(VenUDbContext context)
        {
            _context = context;
        }

        [HttpGet("pending")]
        [Authorize(Roles = "Admin,Superadmin,admin,superadmin")]
        public async Task<IActionResult> GetPendingVenues()
        {
            var pendingVenues = await _context.Venues
                .Where(v => !v.IsVerified)
                .Select(v => new
                {
                    v.Id,
                    v.Name,
                    v.Type,
                    Location = $"{v.StreetAddress}, {v.City}, {v.Province}",
                    v.RepresentativeName,
                    v.Email,
                    v.MobileNumber,
                    v.FsicNumber,
                    v.BusinessPermitNumber,
                    v.FloorPlanUrl,
                    v.LegalPermitsUrl,
                    v.CreatedAt
                })
                .OrderBy(v => v.CreatedAt)
                .ToListAsync();

            return Ok(pendingVenues);
        }

        [HttpPut("{id}/verify")]
        [Authorize(Roles = "Admin,Superadmin,admin,superadmin")]
        public async Task<IActionResult> VerifyVenue(Guid id)
        {
            var venue = await _context.Venues.FindAsync(id);
            if (venue == null) return NotFound(new { message = "Venue not found." });

            venue.IsVerified = true;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Venue verified successfully." });
        }

        [HttpDelete("{id}/reject")]
        [Authorize(Roles = "Admin,Superadmin,admin,superadmin")]
        public async Task<IActionResult> RejectVenue(Guid id)
        {
            var venue = await _context.Venues.FindAsync(id);
            if (venue == null) return NotFound(new { message = "Venue not found." });

            _context.Venues.Remove(venue);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Venue rejected and removed successfully." });
        }
    }
}
