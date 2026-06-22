using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
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
        private readonly IWebHostEnvironment _env;
        private readonly IConfiguration _config;

        public EventsController(VenUDbContext context, IWebHostEnvironment env, IConfiguration config)
        {
            _context = context;
            _env = env;
            _config = config;
        }

        [HttpPost("upload")]
        [Authorize]
        public async Task<IActionResult> UploadBanner(IFormFile file)
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest("No file uploaded.");
            }

            // Check if Cloudinary credentials are set and not placeholder values
            var cloudName = _config["Cloudinary:CloudName"];
            var apiKey = _config["Cloudinary:ApiKey"];
            var apiSecret = _config["Cloudinary:ApiSecret"];

            bool useCloudinary = !string.IsNullOrEmpty(cloudName) && 
                                 !string.IsNullOrEmpty(apiKey) && 
                                 !string.IsNullOrEmpty(apiSecret) &&
                                 cloudName != "your_cloud_name_here" &&
                                 apiKey != "your_api_key_here" &&
                                 apiSecret != "your_api_secret_here" &&
                                 !cloudName.Contains("placeholder") &&
                                 !cloudName.StartsWith("your_");

            if (useCloudinary)
            {
                try
                {
                    var account = new Account(cloudName, apiKey, apiSecret);
                    var cloudinary = new Cloudinary(account);

                    using var stream = file.OpenReadStream();
                    var uploadParams = new ImageUploadParams()
                    {
                        File = new FileDescription(file.FileName, stream),
                        Folder = "venu_uploads"
                    };

                    var uploadResult = await cloudinary.UploadAsync(uploadParams);
                    if (uploadResult.Error != null)
                    {
                        return BadRequest($"Cloudinary upload error: {uploadResult.Error.Message}");
                    }

                    return Ok(new { url = uploadResult.SecureUrl.ToString() });
                }
                catch (Exception ex)
                {
                    // If Cloudinary fails, we can fall back to local upload as a safety net
                    Console.WriteLine($"Cloudinary upload failed, falling back to local: {ex.Message}");
                }
            }

            var wwwrootPath = _env.WebRootPath;
            if (string.IsNullOrEmpty(wwwrootPath))
            {
                wwwrootPath = System.IO.Path.Combine(_env.ContentRootPath, "wwwroot");
            }
            var uploadsPath = System.IO.Path.Combine(wwwrootPath, "uploads");
            
            if (!System.IO.Directory.Exists(uploadsPath))
            {
                System.IO.Directory.CreateDirectory(uploadsPath);
            }

            var fileExtension = System.IO.Path.GetExtension(file.FileName);
            var uniqueFileName = $"{Guid.NewGuid()}{fileExtension}";
            var filePath = System.IO.Path.Combine(uploadsPath, uniqueFileName);

            using (var stream = new System.IO.FileStream(filePath, System.IO.FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            var baseUrl = $"{Request.Scheme}://{Request.Host}{Request.PathBase}";
            var fileUrl = $"{baseUrl}/uploads/{uniqueFileName}";

            return Ok(new { url = fileUrl });
        }

        [HttpPost]
        [Authorize]
        public async Task<IActionResult> CreateEvent([FromBody] CreateEventDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // Date validation
            var minStartDate = new DateTime(2026, 6, 16);
            if (dto.StartDateTime.Date < minStartDate.Date)
            {
                return BadRequest("The event start date cannot be before June 16, 2026.");
            }

            // The JWT stores the user ID under the Sub claim (see GenerateJwtToken in AuthController)
            var userIdClaim = User.Claims.FirstOrDefault(c =>
                c.Type == JwtRegisteredClaimNames.Sub ||
                c.Type == ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out Guid organizerId))
            {
                return Unauthorized(new { message = "Invalid user token." });
            }

            // Handle Venue Sourcing Logic
            Guid? finalVenueId = dto.VenueId;
            
            if (dto.VenueSourcingMode == "custom" && dto.RegisterVenueToDB)
            {
                var newVenue = new Venue
                {
                    Name = dto.VenueName ?? "Custom Venue",
                    Type = dto.VenueType ?? "Standalone Building / Street Address",
                    StreetAddress = dto.StreetAddress,
                    Barangay = dto.Barangay,
                    City = dto.City,
                    Province = dto.Province,
                    Region = dto.Region,
                    ZipCode = dto.ZipCode,
                    Latitude = dto.Latitude,
                    Longitude = dto.Longitude,
                    ContactPerson = dto.ContactPerson,
                    ContactNumber = dto.ContactNumber,
                    ContactEmail = dto.ContactEmail,
                    MapUrl = dto.MapUrl,
                    SquareFootage = dto.SquareFootage,
                    NumberOfFloors = dto.NumberOfFloors,
                    HasFireExit = dto.HasFireExit,
                    HasFireExtinguishers = dto.HasFireExtinguishers,
                    MaxCapacity = dto.MaxCapacity,
                    VenueImages = dto.VenueImages != null && dto.VenueImages.Count > 0
                        ? System.Text.Json.JsonSerializer.Serialize(dto.VenueImages)
                        : null,
                    IsVerified = false, // Require admin approval before publishing to public directory
                    CreatedByOrganizerId = organizerId
                };
                _context.Venues.Add(newVenue);
                // We don't save yet, it will be saved with the event
                finalVenueId = newVenue.Id;
            }
            else if (dto.VenueSourcingMode == "registered" && finalVenueId.HasValue)
            {
                var existingVenue = await _context.Venues.FindAsync(finalVenueId.Value);
                if (existingVenue != null)
                {
                    existingVenue.OrganizersUsedCount += 1;
                }
                else
                {
                    finalVenueId = null;
                }
            }

            var newEvent = new Event
            {
                Title = dto.Title ?? "",
                Description = dto.Description ?? "",
                Category = dto.Category ?? "",
                BannerUrl = dto.BannerUrl ?? "",
                StartDateTime = dto.StartDateTime,
                EndDateTime = dto.EndDateTime,
                TicketSalesStart = dto.TicketSalesStart,
                TicketSalesEnd = dto.TicketSalesEnd,
                RequiresTicket = dto.RequiresTicket,
                DailyStartTime = dto.DailyStartTime,
                DailyEndTime = dto.DailyEndTime,
                Status = "Pending", // Always start as Pending — admin must approve before publishing
                
                VenueId = finalVenueId,
                VenueName = dto.VenueName ?? "",
                VenueType = dto.VenueType ?? "",
                FloorLevel = dto.FloorLevel ?? "",
                WingSection = dto.WingSection ?? "",
                BoothNumber = dto.BoothNumber ?? "",
                ProximityAnchor = dto.ProximityAnchor ?? "",
                LogisticsNotes = dto.LogisticsNotes ?? "",
                
                StreetAddress = dto.StreetAddress ?? "N/A",
                Barangay = dto.Barangay ?? "",
                City = dto.City ?? "",
                Province = dto.Province ?? "",
                Region = dto.Region ?? "",
                ZipCode = dto.ZipCode ?? "",
                Latitude = dto.Latitude,
                Longitude = dto.Longitude,
                MapUrl = dto.MapUrl ?? "",
                AccessType = dto.AccessType ?? "Public",
                VerificationCode = dto.VerificationCode ?? "",
                MaxCapacity = dto.MaxCapacity,
                OrganizerId = organizerId,
                TicketTiers = dto.TicketTiers.Select(t => new EventTicketTier
                {
                    TierName = t.TierName ?? "",
                    OnlineSlots = t.OnlineSlots,
                    F2FSlots = t.F2FSlots,
                    Price = t.Price,
                    ValidityScope = t.ValidityScope ?? "Full Event Multi-Pass (All Days)"
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

        [HttpGet("published")]
        public async Task<IActionResult> GetPublishedEvents()
        {
            var events = await _context.Events
                .Include(e => e.TicketTiers)
                .Include(e => e.Organizer)
                .Where(e => e.Status != "Draft")
                .OrderBy(e => e.StartDateTime)
                .ToListAsync();

            return Ok(events);
        }

        [HttpGet]
        [Authorize]
        public async Task<IActionResult> GetOrganizerEvents()
        {
            var userIdClaim = User.Claims.FirstOrDefault(c =>
                c.Type == JwtRegisteredClaimNames.Sub ||
                c.Type == ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out Guid organizerId))
            {
                return Unauthorized(new { message = "Invalid user token." });
            }

            var events = await _context.Events
                .Include(e => e.TicketTiers)
                .Where(e => e.OrganizerId == organizerId)
                .OrderByDescending(e => e.CreatedAt)
                .ToListAsync();

            var eventIds = events.Where(e => e.EndDateTime < DateTime.UtcNow).Select(e => e.Id).ToList();
            if (eventIds.Any())
            {
                var reviews = await _context.EventReviews
                    .Where(r => eventIds.Contains(r.EventId))
                    .GroupBy(r => r.EventId)
                    .Select(g => new { EventId = g.Key, Avg = g.Average(r => r.StarRating), Count = g.Count() })
                    .ToDictionaryAsync(x => x.EventId, x => x);

                foreach (var evt in events)
                {
                    if (reviews.TryGetValue(evt.Id, out var stat))
                    {
                        evt.AverageRating = (decimal)Math.Round(stat.Avg, 1);
                        evt.TotalReviews = stat.Count;
                    }
                    else if (evt.EndDateTime < DateTime.UtcNow)
                    {
                        evt.AverageRating = 0;
                        evt.TotalReviews = 0;
                    }
                }
            }

            return Ok(events);
        }

        [HttpPut("{id}")]
        [Authorize]
        public async Task<IActionResult> UpdateEvent(Guid id, [FromBody] CreateEventDto dto)
        {
            var userIdClaim = User.Claims.FirstOrDefault(c =>
                c.Type == JwtRegisteredClaimNames.Sub ||
                c.Type == ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out Guid organizerId))
            {
                return Unauthorized(new { message = "Invalid user token." });
            }

            var evt = await _context.Events
                .Include(e => e.TicketTiers)
                .FirstOrDefaultAsync(e => e.Id == id && e.OrganizerId == organizerId);

            if (evt == null)
            {
                return NotFound("Event not found or you do not have permission to edit it.");
            }

            evt.Title = dto.Title ?? evt.Title;
            evt.Description = dto.Description ?? evt.Description;
            evt.Category = dto.Category ?? evt.Category;
            evt.BannerUrl = dto.BannerUrl ?? evt.BannerUrl;
            evt.StartDateTime = dto.StartDateTime;
            evt.EndDateTime = dto.EndDateTime;
            evt.TicketSalesStart = dto.TicketSalesStart;
            evt.TicketSalesEnd = dto.TicketSalesEnd;
            evt.RequiresTicket = dto.RequiresTicket;
            evt.DailyStartTime = dto.DailyStartTime;
            evt.DailyEndTime = dto.DailyEndTime;
            evt.Status = dto.Status ?? evt.Status;

            evt.StreetAddress = dto.StreetAddress ?? evt.StreetAddress;
            evt.Barangay = dto.Barangay ?? evt.Barangay;
            evt.City = dto.City ?? evt.City;
            evt.Province = dto.Province ?? evt.Province;
            evt.Region = dto.Region ?? evt.Region;
            evt.ZipCode = dto.ZipCode ?? evt.ZipCode;
            evt.Latitude = dto.Latitude ?? evt.Latitude;
            evt.Longitude = dto.Longitude ?? evt.Longitude;
            evt.MapUrl = dto.MapUrl ?? evt.MapUrl;

            evt.VenueName = dto.VenueName ?? evt.VenueName;
            evt.VenueType = dto.VenueType ?? evt.VenueType;
            evt.FloorLevel = dto.FloorLevel ?? evt.FloorLevel;
            evt.WingSection = dto.WingSection ?? evt.WingSection;
            evt.BoothNumber = dto.BoothNumber ?? evt.BoothNumber;
            evt.ProximityAnchor = dto.ProximityAnchor ?? evt.ProximityAnchor;
            evt.LogisticsNotes = dto.LogisticsNotes ?? evt.LogisticsNotes;
            evt.MaxCapacity = dto.MaxCapacity;
            
            // Re-create ticket tiers
            _context.EventTicketTiers.RemoveRange(evt.TicketTiers);
            if (dto.RequiresTicket)
            {
                evt.TicketTiers = dto.TicketTiers.Select(t => new EventTicketTier
                {
                    TierName = t.TierName ?? "",
                    OnlineSlots = t.OnlineSlots,
                    F2FSlots = t.F2FSlots,
                    Price = t.Price,
                    ValidityScope = t.ValidityScope ?? "Full Event Multi-Pass (All Days)"
                }).ToList();
            }

            await _context.SaveChangesAsync();
            return Ok(evt);
        }

        [HttpPut("{id}/status")]
        [Authorize]
        public async Task<IActionResult> UpdateEventStatus(Guid id, [FromBody] UpdateStatusDto dto)
        {
            var userIdClaim = User.Claims.FirstOrDefault(c =>
                c.Type == JwtRegisteredClaimNames.Sub ||
                c.Type == ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out Guid organizerId))
            {
                return Unauthorized(new { message = "Invalid user token." });
            }

            var evt = await _context.Events.FirstOrDefaultAsync(e => e.Id == id && e.OrganizerId == organizerId);
            if (evt == null)
            {
                return NotFound("Event not found or you do not have permission to edit it.");
            }

            evt.Status = dto.Status;
            await _context.SaveChangesAsync();
            
            return Ok(evt);
        }

        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> DeleteEvent(Guid id)
        {
            var userIdClaim = User.Claims.FirstOrDefault(c =>
                c.Type == JwtRegisteredClaimNames.Sub ||
                c.Type == ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out Guid organizerId))
            {
                return Unauthorized(new { message = "Invalid user token." });
            }

            var evt = await _context.Events.FirstOrDefaultAsync(e => e.Id == id && e.OrganizerId == organizerId);
            if (evt == null)
            {
                return NotFound("Event not found or you do not have permission to delete it.");
            }

            _context.Events.Remove(evt);
            await _context.SaveChangesAsync();
            
            return Ok(new { message = "Event deleted successfully." });
        }

        [HttpGet("{id}/analytics")]
        [Authorize]
        public async Task<IActionResult> GetEventAnalytics(Guid id, [FromQuery] string search = null)
        {
            var userIdClaim = User.Claims.FirstOrDefault(c =>
                c.Type == JwtRegisteredClaimNames.Sub ||
                c.Type == ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out Guid organizerId))
            {
                return Unauthorized(new { message = "Invalid user token." });
            }

            var evt = await _context.Events.FirstOrDefaultAsync(e => e.Id == id && e.OrganizerId == organizerId);
            if (evt == null)
            {
                return StatusCode(403, "Forbidden. You do not have permission to view analytics for this event.");
            }

            var attendeesQuery = _context.EventAttendees.Where(a => a.EventId == id).AsQueryable();

            if (!string.IsNullOrEmpty(search))
            {
                var lowerSearch = search.ToLower();
                attendeesQuery = attendeesQuery.Where(a => 
                    a.AttendeeName.ToLower().Contains(lowerSearch) || 
                    a.AttendeeEmail.ToLower().Contains(lowerSearch) ||
                    a.TicketType.ToLower().Contains(lowerSearch));
            }

            var attendees = await attendeesQuery.OrderByDescending(a => a.CreatedAt).ToListAsync();

            var totalRegistered = attendees.Count;
            var checkedInCount = attendees.Count(a => a.IsPresent);
            var arrivalRate = totalRegistered > 0 ? ((decimal)checkedInCount / totalRegistered) * 100 : 0;
            var isOverCapacity = evt.MaxCapacity > 0 && totalRegistered >= evt.MaxCapacity;

            var result = new VenU.Api.DTOs.EventAnalyticsHubDto
            {
                EventId = evt.Id,
                EventTitle = evt.Title,
                MaxCapacity = evt.MaxCapacity,
                TotalRegistered = totalRegistered,
                CheckedInCount = checkedInCount,
                ArrivalRatePercentage = arrivalRate,
                IsOverCapacity = isOverCapacity,
                Attendees = attendees.Select(a => new VenU.Api.DTOs.AttendeeDto
                {
                    Id = a.Id,
                    AttendeeName = a.AttendeeName,
                    MaskedEmail = MaskEmail(a.AttendeeEmail),
                    TicketType = a.TicketType,
                    IsPresent = a.IsPresent,
                    ArrivalTime = a.ArrivalTime
                })
            };

            return Ok(result);
        }

        [HttpGet("{id}/management-summary")]
        [Authorize]
        public async Task<IActionResult> GetManagementSummary(Guid id)
        {
            var userIdClaim = User.Claims.FirstOrDefault(c =>
                c.Type == JwtRegisteredClaimNames.Sub ||
                c.Type == ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out Guid organizerId))
            {
                return Unauthorized(new { message = "Invalid user token." });
            }

            var evt = await _context.Events.FirstOrDefaultAsync(e => e.Id == id && e.OrganizerId == organizerId);
            if (evt == null)
            {
                return StatusCode(403, "Forbidden. You do not have permission to view management summary for this event.");
            }

            var attendees = await _context.EventAttendees.Where(a => a.EventId == id).ToListAsync();
            var reviews = await _context.EventReviews.Where(r => r.EventId == id).OrderByDescending(r => r.DateSubmitted).ToListAsync();

            var totalRegistered = attendees.Count;
            var checkedInCount = attendees.Count(a => a.IsPresent);
            
            decimal avgRating = 0;
            if (reviews.Count > 0)
            {
                avgRating = (decimal)reviews.Average(r => r.StarRating);
            }

            var isEnded = evt.EndDateTime < DateTime.UtcNow;

            var result = new VenU.Api.DTOs.EventManagementSummaryDto
            {
                EventId = evt.Id,
                EventTitle = evt.Title,
                TotalRegistered = totalRegistered,
                CheckedInCount = checkedInCount,
                AverageRating = Math.Round(avgRating, 1),
                TotalReviews = reviews.Count,
                IsEnded = isEnded,
                Reviews = reviews.Select(r => new VenU.Api.DTOs.EventReviewDto
                {
                    Id = r.Id,
                    ReviewerName = MaskName(r.ReviewerName),
                    StarRating = r.StarRating,
                    FeedbackText = r.FeedbackText,
                    DateSubmitted = r.DateSubmitted
                }),
                Attendees = attendees.Select(a => new VenU.Api.DTOs.AttendeeDto
                {
                    Id = a.Id,
                    AttendeeName = MaskName(a.AttendeeName),
                    MaskedEmail = MaskEmail(a.AttendeeEmail),
                    TicketType = a.TicketType,
                    IsPresent = a.IsPresent,
                    ArrivalTime = a.ArrivalTime
                })
            };

            return Ok(result);
        }

        private string MaskName(string name)
        {
            if (string.IsNullOrEmpty(name)) return "Anonymous";
            var parts = name.Split(' ', StringSplitOptions.RemoveEmptyEntries);
            if (parts.Length == 1) return $"{parts[0][0]}***";
            return $"{parts[0][0]}*** {parts[^1][0]}***";
        }

        private string MaskEmail(string email)
        {
            if (string.IsNullOrEmpty(email) || !email.Contains("@")) return email;
            var parts = email.Split('@');
            var name = parts[0];
            var domain = parts[1];
            if (name.Length <= 1) return email;
            return $"{name[0]}***@{domain}";
        }
    }
}