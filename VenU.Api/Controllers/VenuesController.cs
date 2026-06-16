using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VenU.Api.Data;

namespace VenU.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class VenuesController : ControllerBase
    {
        private readonly VenUDbContext _context;

        public VenuesController(VenUDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetVenues([FromQuery] string? search)
        {
            var query = _context.Venues.AsQueryable();

            if (!string.IsNullOrEmpty(search))
            {
                query = query.Where(v => v.Name.Contains(search) || v.City.Contains(search));
            }

            // Only return verified venues to the public, order by popularity
            var venues = await query
                .Where(v => v.IsVerified)
                .OrderByDescending(v => v.OrganizersUsedCount)
                .ThenByDescending(v => v.Rating)
                .ToListAsync();

            return Ok(venues);
        }
    }
}
