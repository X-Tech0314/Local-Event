using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VenU.Api.Data;
using VenU.Api.Models;

namespace VenU.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AdminController : ControllerBase
    {
        private readonly VenUDbContext _context;

        public AdminController(VenUDbContext context)
        {
            _context = context;
        }

        [HttpGet("admins")]
        public async Task<IActionResult> GetAdmins()
        {
            var admins = await _context.Users
                .Where(u => u.Role == "Admin" || u.Role == "SuperAdmin")
                .Select(u => new { 
                    id = u.Id, 
                    name = string.IsNullOrEmpty(u.LastName) ? u.FirstName : u.FirstName + " " + u.LastName, 
                    email = u.Email, 
                    role = u.Role 
                })
                .ToListAsync();
            return Ok(admins);
        }

        [HttpGet("fix-identities")]
        public async Task<IActionResult> FixIdentities()
        {
            var users = await _context.Users.Where(u => !u.IsVerified && u.Role == "Attendee" && u.Email != "").ToListAsync();
            foreach (var user in users)
            {
                if (string.IsNullOrEmpty(user.IdFrontPath)) user.IdFrontPath = "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=800&q=80";
                if (string.IsNullOrEmpty(user.SelfiePath)) user.SelfiePath = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=800&q=80";
            }
            await _context.SaveChangesAsync();
            return Ok($"Fixed {users.Count} users");
        }

        [HttpPost("admins")]
        public async Task<IActionResult> CreateAdmin([FromBody] AdminCreateDto req)
        {
            if (await _context.Users.AnyAsync(u => u.Email == req.Email))
            {
                return BadRequest(new { Message = "Email is already registered." });
            }

            var parts = req.Name?.Split(' ', 2) ?? new[] { "Admin" };
            var firstName = parts[0];
            var lastName = parts.Length > 1 ? parts[1] : "";

            var user = new User
            {
                Email = req.Email ?? "",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(req.Password),
                Role = "Admin",
                FirstName = firstName,
                LastName = lastName,
                IsVerified = true,
                MiddleName = "",
                Suffix = "",
                ContactNumber = "",
                HouseNo = "",
                StreetName = "",
                Subdivision = "",
                ZipCode = "",
                Region = "",
                Province = "",
                City = "",
                Barangay = "",
                IdType = "",
                IdReferenceNumber = "",
                IdFrontPath = "",
                IdBackPath = "",
                SelfiePath = ""
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return Ok(new { 
                id = user.Id, 
                name = user.FirstName + (string.IsNullOrEmpty(user.LastName) ? "" : " " + user.LastName), 
                email = user.Email, 
                role = user.Role 
            });
        }

        [HttpDelete("admins/{id}")]
        public async Task<IActionResult> DeleteAdmin(Guid id)
        {
            var admin = await _context.Users.FindAsync(id);
            if (admin != null)
            {
                _context.Users.Remove(admin);
                await _context.SaveChangesAsync();
            }
            return Ok(new { Message = "Admin deleted successfully" });
        }

        [HttpPut("admins/{id}/role")]
        public async Task<IActionResult> UpdateAdminRole(Guid id, [FromBody] AdminRoleDto req)
        {
            var admin = await _context.Users.FindAsync(id);
            if (admin != null)
            {
                admin.Role = req.Role;
                await _context.SaveChangesAsync();
            }
            return Ok(new { Message = "Role updated successfully" });
        }

        [HttpGet("users")]
        public async Task<IActionResult> GetUsers()
        {
            var users = await _context.Users
                .Where(u => u.Role == "Attendee" || u.Role == "Organizer")
                .Select(u => new { 
                    id = u.Id, 
                    firstName = u.FirstName, 
                    lastName = u.LastName, 
                    email = u.Email, 
                    role = u.Role, 
                    status = !u.IsSuspended ? "Active" : "Suspended",
                    isVerified = u.IsVerified 
                })
                .ToListAsync();
            return Ok(users);
        }

        [HttpPut("users/{id}/status")]
        public async Task<IActionResult> UpdateUserStatus(Guid id, [FromBody] UserStatusDto req)
        {
            var user = await _context.Users.FindAsync(id);
            if (user != null)
            {
                user.IsSuspended = req.Status != "Active";
                await _context.SaveChangesAsync();
            }
            return Ok(new { Message = "User status updated successfully" });
        }

        [HttpGet("identity-approvals")]
        public async Task<IActionResult> GetIdentityApprovals()
        {
            // Fetch users who are NOT verified but have uploaded at least a front ID or selfie
            var pendingUsers = await _context.Users
                .Where(u => !u.IsVerified && (!string.IsNullOrEmpty(u.IdFrontPath) || !string.IsNullOrEmpty(u.SelfiePath)))
                .Select(u => new {
                    id = u.Id,
                    firstName = u.FirstName,
                    lastName = u.LastName,
                    email = u.Email,
                    role = u.Role,
                    idType = u.IdType,
                    idFrontPath = u.IdFrontPath,
                    idBackPath = u.IdBackPath,
                    selfiePath = u.SelfiePath,
                    verificationMessage = u.VerificationMessage
                })
                .ToListAsync();
            
            return Ok(pendingUsers);
        }

        [HttpPut("identity-approvals/{id}/approve")]
        public async Task<IActionResult> ApproveIdentity(Guid id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return NotFound();

            user.IsVerified = true;
            user.VerificationMessage = null;
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Identity approved." });
        }

        public class RejectIdentityDto
        {
            public string Reason { get; set; }
        }

        [HttpPut("identity-approvals/{id}/reject")]
        public async Task<IActionResult> RejectIdentity(Guid id, [FromBody] RejectIdentityDto req)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return NotFound();

            user.IsVerified = false;
            // Optionally clear the paths so they must upload again
            user.IdFrontPath = "";
            user.IdBackPath = "";
            user.SelfiePath = "";
            user.VerificationMessage = req.Reason;
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Identity rejected." });
        }

        [HttpGet("events/pending")]
        public async Task<IActionResult> GetPendingEvents()
        {
            var events = await _context.Events
                .Include(e => e.Organizer)
                .Where(e => e.Status == "Pending" || e.Status == "UnderReview")
                .Select(e => new {
                    id = e.Id,
                    name = e.Title,
                    organizer = e.Organizer.FirstName + " " + e.Organizer.LastName,
                    date = e.StartDateTime.ToString("MMM dd, yyyy")
                })
                .ToListAsync();
            return Ok(new { events });
        }

        [HttpPut("events/{id}/{actionName}")]
        public async Task<IActionResult> UpdateEventAction(Guid id, string actionName)
        {
            var evt = await _context.Events.FindAsync(id);
            if (evt != null)
            {
                if (actionName.ToLower() == "approved")
                    evt.Status = "Published";
                else if (actionName.ToLower() == "rejected")
                    evt.Status = "Rejected";

                await _context.SaveChangesAsync();
            }
            return Ok(new { Message = "Event updated successfully" });
        }

        [HttpGet("stats")]
        public async Task<IActionResult> GetAdminStats()
        {
            var totalUsers = await _context.Users.CountAsync(u => u.Role == "Attendee" || u.Role == "Organizer");
            var activeEvents = await _context.Events.CountAsync(e => e.Status == "Published");
            
            // For now, simulate total sales or leave at 0 if no tickets are sold yet
            var totalSales = 0;

            return Ok(new {
                totalUsers,
                activeEvents,
                totalSales
            });
        }
    }

    public class AdminCreateDto
    {
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }

    public class AdminRoleDto
    {
        public string Role { get; set; } = string.Empty;
    }

    public class UserStatusDto
    {
        public string Status { get; set; } = string.Empty;
    }
}
