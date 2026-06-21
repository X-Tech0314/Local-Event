using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VenU.Api.Data;
using VenU.Api.Services;

namespace VenU.Api.Controllers
{
    [Route("api/admin/moderate-image")]
    [ApiController]
    public class AdminModerationController : ControllerBase
    {
        private readonly VenUDbContext _context;
        private readonly IImageModerationService _imageModerationService;

        public AdminModerationController(VenUDbContext context, IImageModerationService imageModerationService)
        {
            _context = context;
            _imageModerationService = imageModerationService;
        }

        public class ModerateImageRequest
        {
            public int ImageId { get; set; }
            public string Action { get; set; } = string.Empty; // "APPROVED" or "REJECTED"
        }

        [HttpGet("pending")]
        [Authorize(Roles = "Admin,Superadmin,admin,superadmin")]
        public async Task<IActionResult> GetPendingImages()
        {
            var pendingImages = await _context.VenueImages
                .Include(vi => vi.Venue) // Include Venue to get Venue Name
                .Where(vi => vi.Status == "PENDING_REVIEW")
                .Select(vi => new
                {
                    vi.Id,
                    vi.VenueId,
                    VenueName = vi.Venue != null ? vi.Venue.Name : "Unknown Venue",
                    vi.CloudinaryUrl,
                    vi.AiScore,
                    vi.CreatedAt
                })
                .OrderByDescending(vi => vi.CreatedAt)
                .ToListAsync();

            return Ok(pendingImages);
        }

        [HttpPost]
        [Authorize(Roles = "Admin,Superadmin,admin,superadmin")]
        public async Task<IActionResult> ModerateImage([FromBody] ModerateImageRequest request)
        {
            var image = await _context.VenueImages.FindAsync(request.ImageId);
            
            if (image == null)
            {
                return NotFound(new { message = "Image not found." });
            }

            if (request.Action.ToUpper() == "APPROVED")
            {
                image.Status = "APPROVED";
                
                // Also update the legacy VenueImages JSON array for the parent Venue so it shows up
                var venue = await _context.Venues.FindAsync(image.VenueId);
                if (venue != null)
                {
                    List<string> legacyImageUrls = string.IsNullOrEmpty(venue.VenueImages) 
                        ? new List<string>() 
                        : System.Text.Json.JsonSerializer.Deserialize<List<string>>(venue.VenueImages) ?? new List<string>();
                    
                    if (!legacyImageUrls.Contains(image.CloudinaryUrl))
                    {
                        legacyImageUrls.Add(image.CloudinaryUrl);
                        venue.VenueImages = System.Text.Json.JsonSerializer.Serialize(legacyImageUrls);
                    }
                }

                await _context.SaveChangesAsync();
                return Ok(new { message = "Image approved successfully." });
            }
            else if (request.Action.ToUpper() == "REJECTED")
            {
                // Delete from Cloudinary
                await _imageModerationService.DeleteImageAsync(image.CloudinaryPublicId);
                
                // Delete from DB
                _context.VenueImages.Remove(image);
                await _context.SaveChangesAsync();
                return Ok(new { message = "Image rejected and deleted successfully." });
            }

            return BadRequest(new { message = "Invalid action. Use APPROVED or REJECTED." });
        }
    }
}
