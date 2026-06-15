using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using VenU.Api.Data;
using VenU.Api.Models;

namespace VenU.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class UsersController : ControllerBase
    {
        private readonly VenUDbContext _context;

        public UsersController(VenUDbContext context)
        {
            _context = context;
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetUser(Guid id)
        {
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userIdStr != id.ToString())
            {
                return Forbid();
            }

            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                return NotFound();
            }

            return Ok(new
            {
                user.Id,
                user.Email,
                user.Role,
                user.FirstName,
                user.MiddleName,
                user.LastName,
                user.Suffix,
                user.DateOfBirth,
                user.ContactNumber,
                user.HouseNo,
                user.StreetName,
                user.Subdivision,
                user.ZipCode,
                user.Region,
                user.Province,
                user.City,
                user.Barangay,
                user.IdType,
                user.IdReferenceNumber,
                user.IdFrontPath,
                user.IdBackPath,
                user.SelfiePath
            });
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateProfile(Guid id, [FromBody] UpdateProfileDto request)
        {
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userIdStr != id.ToString())
            {
                return Forbid();
            }

            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                return NotFound();
            }

            user.FirstName = request.FirstName;
            user.MiddleName = request.MiddleName;
            user.LastName = request.LastName;
            user.Suffix = request.Suffix;
            user.DateOfBirth = request.DateOfBirth;
            user.ContactNumber = request.ContactNumber;
            user.HouseNo = request.HouseNo;
            user.StreetName = request.StreetName;
            user.Subdivision = request.Subdivision;
            user.ZipCode = request.ZipCode;
            user.Region = request.Region;
            user.Province = request.Province;
            user.City = request.City;
            user.Barangay = request.Barangay;
            user.IdType = request.IdType;
            user.IdReferenceNumber = request.IdReferenceNumber;

            await _context.SaveChangesAsync();
            return Ok(new { Message = "Profile updated successfully." });
        }

        [HttpPut("{id}/password")]
        public async Task<IActionResult> UpdatePassword(Guid id, [FromBody] UpdatePasswordDto request)
        {
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userIdStr != id.ToString())
            {
                return Forbid();
            }

            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                return NotFound();
            }

            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Password updated successfully." });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAccount(Guid id)
        {
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userIdStr != id.ToString())
            {
                return Forbid();
            }

            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                return NotFound();
            }

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Account deleted successfully." });
        }
    }

    public class UpdateProfileDto
    {
        public string FirstName { get; set; }
        public string MiddleName { get; set; }
        public string LastName { get; set; }
        public string Suffix { get; set; }
        public DateTime DateOfBirth { get; set; }
        public string ContactNumber { get; set; }
        public string HouseNo { get; set; }
        public string StreetName { get; set; }
        public string Subdivision { get; set; }
        public string ZipCode { get; set; }
        public string Region { get; set; }
        public string Province { get; set; }
        public string City { get; set; }
        public string Barangay { get; set; }
        public string IdType { get; set; }
        public string IdReferenceNumber { get; set; }
    }

    public class UpdatePasswordDto
    {
        public string NewPassword { get; set; }
    }
}
