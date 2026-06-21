using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VenU.Api.Data;

 using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using VenU.Api.DTOs;
using VenU.Api.Models;
using VenU.Api.Services;

namespace VenU.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class VenuesController : ControllerBase
    {
        private readonly VenUDbContext _context;
        private readonly IImageModerationService _imageModerationService;

        public VenuesController(VenUDbContext context, IImageModerationService imageModerationService)
        {
            _context = context;
            _imageModerationService = imageModerationService;
        }

        [HttpGet("debug-bldg")]
        [AllowAnonymous]
        public async Task<IActionResult> DebugBldg()
        {
            var venue = await _context.Venues.FirstOrDefaultAsync(v => v.Name.Contains("BRAZA"));
            return Ok(venue);
        }

        [HttpGet]
        [Authorize]
        public async Task<IActionResult> GetVenues([FromQuery] string? search)
        {
            var userIdClaim = User.Claims.FirstOrDefault(c =>
                c.Type == JwtRegisteredClaimNames.Sub ||
                c.Type == ClaimTypes.NameIdentifier)?.Value;
                
            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out Guid organizerId))
            {
                return Unauthorized(new { message = "Invalid user token." });
            }

            var query = _context.Venues.AsQueryable();

            if (!string.IsNullOrEmpty(search))
            {
                query = query.Where(v => v.Name.Contains(search) || v.City.Contains(search));
            }

            // Return verified venues OR unverified venues created by this organizer
            var venues = await query
                .Where(v => v.IsVerified || v.CreatedByOrganizerId == organizerId)
                .OrderByDescending(v => v.OrganizersUsedCount)
                .ThenByDescending(v => v.Rating)
                .ToListAsync();

            return Ok(venues);
        }

        [HttpPost("add-venue")]
        [Authorize]
        public async Task<IActionResult> AddVenue([FromForm] CreateVenueDto dto)
        {
            var userIdClaim = User.Claims.FirstOrDefault(c =>
                c.Type == JwtRegisteredClaimNames.Sub ||
                c.Type == ClaimTypes.NameIdentifier)?.Value;
                
            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out Guid organizerId))
            {
                return Unauthorized(new { message = "Invalid user token." });
            }

            // 1. Handle file uploads to Cloudinary + Moderation
            List<string> legacyImageUrls = new List<string>();
            List<VenueImage> processedImages = new List<VenueImage>();

            if (dto.GalleryImages != null && dto.GalleryImages.Count >= 3)
            {
                foreach (var img in dto.GalleryImages)
                {
                    var (url, publicId) = await _imageModerationService.UploadImageAsync(img);
                    if (!string.IsNullOrEmpty(url))
                    {
                        decimal aiScore = await _imageModerationService.ModerateImageAsync(url);
                        
                        string status = "PENDING_REVIEW";
                        if (aiScore < 35.0m)
                        {
                            status = "APPROVED";
                            legacyImageUrls.Add(url); // Only public images go to legacy list
                        }
                        else if (aiScore >= 80.0m)
                        {
                            // Taboo Zone - Reject immediately
                            await _imageModerationService.DeleteImageAsync(publicId);
                            return BadRequest(new { message = "One or more images violated our safety policy and were rejected." });
                        }

                        processedImages.Add(new VenueImage
                        {
                            CloudinaryUrl = url,
                            CloudinaryPublicId = publicId,
                            AiScore = aiScore,
                            Status = status,
                            CreatedAt = DateTime.UtcNow
                        });
                    }
                }
            }
            else if (dto.GalleryImages != null && dto.GalleryImages.Count > 0)
            {
                return BadRequest("At least 3 gallery images are required.");
            }

            string floorPlanUrl = dto.FloorPlanFile != null ? $"https://cloudinary.com/venues/fp_{Guid.NewGuid()}.pdf" : null;
            string legalPermitsUrl = dto.LegalPermitsFile != null ? $"https://cloudinary.com/venues/legal_{Guid.NewGuid()}.pdf" : null;

            // 2. Create Entity
            var venue = new Venue
            {
                Name = dto.Name,
                Type = dto.Type,
                FloorArea = dto.FloorArea,
                CeilingHeight = dto.CeilingHeight,
                StreetAddress = dto.StreetAddress,
                Barangay = dto.Barangay,
                City = dto.City,
                Province = dto.Province,
                Landmarks = dto.Landmarks,
                Latitude = dto.Latitude,
                Longitude = dto.Longitude,
                // PSGC codes
                Region = dto.Region,
                RegionCode = dto.RegionCode,
                ProvinceCode = dto.ProvinceCode,
                CityMunCode = dto.CityMunCode,
                BarangayCode = dto.BarangayCode,
                RepresentativeName = dto.RepresentativeName,
                MobileNumber = dto.MobileNumber,
                Landline = dto.Landline,
                Email = dto.Email,
                WebsiteUrl = dto.WebsiteUrl,
                CapacityTheater = dto.CapacityTheater,
                CapacityBanquet = dto.CapacityBanquet,
                CapacityStanding = dto.CapacityStanding,
                ParkingSlots = dto.ParkingSlots,
                OperatingHours = dto.OperatingHours,
                HasAircon = dto.HasAircon,
                HasSoundSystem = dto.HasSoundSystem,
                HasBackupGenerator = dto.HasBackupGenerator,
                HasHoldingRooms = dto.HasHoldingRooms,
                FsicNumber = dto.FsicNumber,
                BusinessPermitNumber = dto.BusinessPermitNumber,
                HasBirForm2303 = dto.HasBirForm2303,
                HasSmokeDetectors = dto.HasSmokeDetectors,
                HasFireExits = dto.HasFireExits,
                VenueImages = System.Text.Json.JsonSerializer.Serialize(legacyImageUrls),
                Images = processedImages,
                FloorPlanUrl = floorPlanUrl,
                LegalPermitsUrl = legalPermitsUrl,
                CreatedAt = DateTime.UtcNow,
                CreatedByOrganizerId = organizerId,
                IsVerified = true // Set verified by default so everyone can see it
            };

            _context.Venues.Add(venue);
            await _context.SaveChangesAsync();

            return Ok(venue);
        }
    }
}
