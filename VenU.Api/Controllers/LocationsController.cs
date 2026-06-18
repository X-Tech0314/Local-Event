using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Threading.Tasks;
using VenU.Api.Data;

namespace VenU.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class LocationsController : ControllerBase
    {
        private readonly VenUDbContext _context;

        public LocationsController(VenUDbContext context)
        {
            _context = context;
        }

        [HttpGet("explore")]
        [AllowAnonymous] // Allow guests/explorers to see events
        public async Task<IActionResult> ExploreLocations([FromQuery] string search = null)
        {
            // Only fetch Published and active events
            var query = _context.Events
                .Where(e => e.Status == "Published")
                .AsQueryable();

            if (!string.IsNullOrEmpty(search))
            {
                var lowerSearch = search.ToLower();
                query = query.Where(e => 
                    e.Title.ToLower().Contains(lowerSearch) || 
                    e.VenueName.ToLower().Contains(lowerSearch) ||
                    e.City.ToLower().Contains(lowerSearch) ||
                    e.Barangay.ToLower().Contains(lowerSearch) ||
                    e.StreetAddress.ToLower().Contains(lowerSearch));
            }

            var events = await query
                .Include(e => e.Venue)
                .Select(e => new
                {
                    EventId = e.Id,
                    Title = e.Title,
                    Date = e.StartDateTime,
                    VenueName = string.IsNullOrEmpty(e.VenueName) ? e.StreetAddress : e.VenueName,
                    Address = $"{e.StreetAddress}, {e.Barangay}, {e.City}, {e.Province}",
                    Latitude = e.Latitude,
                    Longitude = e.Longitude,
                    Category = e.Category,
                    Price = e.TicketTiers.Any() ? e.TicketTiers.Min(t => t.Price) : 0,
                    Image = string.IsNullOrEmpty(e.BannerUrl) ? "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&q=80" : e.BannerUrl,
                    Capacity = e.MaxCapacity,
                    ContactPerson = e.Venue != null && !string.IsNullOrEmpty(e.Venue.RepresentativeName) ? e.Venue.RepresentativeName : (e.Venue != null ? e.Venue.ContactPerson : "N/A"),
                    ContactDetails = e.Venue != null && !string.IsNullOrEmpty(e.Venue.MobileNumber) ? e.Venue.MobileNumber : (e.Venue != null ? e.Venue.ContactNumber : "N/A"),
                    NumberOfFloors = e.Venue != null ? e.Venue.NumberOfFloors : 1,
                    FloorArea = e.Venue != null ? e.Venue.FloorArea : 0,
                    CeilingHeight = e.Venue != null ? e.Venue.CeilingHeight : 0,
                    AverageRating = e.AverageRating ?? 4.5M,
                    TotalReviews = e.TotalReviews ?? 12,
                    RecommendedFor = e.MaxCapacity <= 50 ? "small" : (e.MaxCapacity <= 200 ? "medium" : "large")
                })
                .ToListAsync();

            return Ok(events);
        }
    }
}
