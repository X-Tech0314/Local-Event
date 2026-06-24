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
                .Where(v => !v.IsVerified && !v.IsDeleted)
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
                    v.CreatedAt,
                    Images = v.Images.Select(img => img.CloudinaryUrl).ToList()
                })
                .OrderBy(v => v.CreatedAt)
                .ToListAsync();

            return Ok(pendingVenues);
        }

        [HttpGet]
        [Authorize(Roles = "Admin,Superadmin,admin,superadmin")]
        public async Task<IActionResult> GetAllVenues([FromQuery] bool deleted = false)
        {
            var venues = await _context.Venues
                .Where(v => v.IsDeleted == deleted)
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
                    v.IsVerified,
                    v.IsHidden,
                    v.IsDeleted,
                    v.CreatedAt,
                    Images = v.Images.Select(img => img.CloudinaryUrl).ToList()
                })
                .OrderByDescending(v => v.CreatedAt)
                .ToListAsync();

            return Ok(venues);
        }

        [HttpPut("{id}/toggle-visibility")]
        [Authorize(Roles = "Admin,Superadmin,admin,superadmin")]
        public async Task<IActionResult> ToggleVenueVisibility(Guid id)
        {
            var venue = await _context.Venues.FindAsync(id);
            if (venue == null) return NotFound(new { message = "Venue not found." });

            venue.IsHidden = !venue.IsHidden;
            await _context.SaveChangesAsync();

            return Ok(new { message = $"Venue visibility toggled successfully. IsHidden is now {venue.IsHidden}.", isHidden = venue.IsHidden });
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

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin,Superadmin,admin,superadmin")]
        public async Task<IActionResult> DeleteVenue(Guid id)
        {
            var venue = await _context.Venues.FindAsync(id);
            if (venue == null) return NotFound(new { message = "Venue not found." });

            venue.IsDeleted = true;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Venue moved to Recycle Bin." });
        }

        [HttpPut("{id}/restore")]
        [Authorize(Roles = "Admin,Superadmin,admin,superadmin")]
        public async Task<IActionResult> RestoreVenue(Guid id)
        {
            var venue = await _context.Venues.FindAsync(id);
            if (venue == null) return NotFound(new { message = "Venue not found." });

            venue.IsDeleted = false;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Venue restored successfully." });
        }

        [HttpDelete("{id}/permanent")]
        [Authorize(Roles = "Admin,Superadmin,admin,superadmin")]
        public async Task<IActionResult> PermanentDeleteVenue(Guid id)
        {
            var venue = await _context.Venues.FindAsync(id);
            if (venue == null) return NotFound(new { message = "Venue not found." });

            // Explicitly delete related VenueImages
            var images = _context.VenueImages.Where(vi => vi.VenueId == id);
            _context.VenueImages.RemoveRange(images);

            // Nullify linked events
            var linkedEvents = await _context.Events.Where(e => e.VenueId == id).ToListAsync();
            foreach (var ev in linkedEvents)
            {
                ev.VenueId = null;
            }

            _context.Venues.Remove(venue);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Venue permanently deleted from database." });
        }
    }
}
