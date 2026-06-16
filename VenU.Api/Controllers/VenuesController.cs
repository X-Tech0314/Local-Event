using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VenU.Api.Data;

 using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

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
        [Authorize(Roles = "Organizer")]
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
    }
}
