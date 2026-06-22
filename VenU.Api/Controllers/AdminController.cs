using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VenU.Api.Data;
using VenU.Api.Models;

namespace VenU.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin,Superadmin,admin,superadmin")]
    public class AdminController : ControllerBase
    {
        private readonly VenUDbContext _context;

        public AdminController(VenUDbContext context)
        {
            _context = context;
        }

        // ==========================================
        // 1. DASHBOARD STATS
        // ==========================================
        [HttpGet("stats")]
        public async Task<IActionResult> GetStats()
        {
            var totalUsers = await _context.Users.CountAsync();
            var activeEvents = await _context.Events.CountAsync(e => e.Status == "Published");
            
            decimal totalSales = 0;

            return Ok(new {
                totalUsers,
                activeEvents,
                totalSales
            });
        }

        // ==========================================
        // 2. EVENT APPROVALS
        // ==========================================
        [HttpGet("events/pending")]
        public async Task<IActionResult> GetPendingEvents()
        {
            var pendingEvents = await _context.Events
                .Include(e => e.Organizer)
                .Where(e => e.Status == "Pending")
                .Select(e => new {
                    id = e.Id,
                    name = e.Title,
                    organizer = e.Organizer.OrgName ?? (e.Organizer.FirstName + " " + e.Organizer.LastName),
                    date = e.StartDateTime.ToString("MMM dd, yyyy")
                })
                .ToListAsync();

            return Ok(pendingEvents);
        }

        [HttpPut("events/{id}/approved")]
        public async Task<IActionResult> ApproveEvent(Guid id)
        {
            return await UpdateEventStatus(id, "Published");
        }

        [HttpPut("events/{id}/rejected")]
        public async Task<IActionResult> RejectEvent(Guid id)
        {
            return await UpdateEventStatus(id, "Rejected");
        }

        private async Task<IActionResult> UpdateEventStatus(Guid id, string status)
        {
            var evt = await _context.Events.FindAsync(id);
            if (evt == null) return NotFound(new { message = "Event not found." });

            evt.Status = status;
            await _context.SaveChangesAsync();
            
            return Ok(new { message = $"Event {status} successfully." });
        }

        // ==========================================
        // 3. USER MANAGEMENT (with Recycle Bin)
        // ==========================================
        [HttpGet("users")]
        public async Task<IActionResult> GetUsers([FromQuery] string search = "", [FromQuery] int page = 1, [FromQuery] int pageSize = 10, [FromQuery] bool deleted = false)
        {
            var query = _context.Users
                .Where(u => u.Role == "Attendee" || u.Role == "Organizer");

            if (deleted) {
                query = query.Where(u => u.Status == "Deleted");
            } else {
                query = query.Where(u => u.Status != "Deleted");
            }

            if (!string.IsNullOrEmpty(search))
            {
                var lowerSearch = search.ToLower();
                query = query.Where(u => 
                    (u.FirstName != null && u.FirstName.ToLower().Contains(lowerSearch)) || 
                    (u.LastName != null && u.LastName.ToLower().Contains(lowerSearch)) ||
                    ((u.FirstName ?? "") + " " + (u.LastName ?? "")).ToLower().Contains(lowerSearch)
                );
            }

            var totalCount = await query.CountAsync();
            var totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);

            var users = await query
                .OrderByDescending(u => u.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(u => new {
                    id = u.Id,
                    firstName = u.FirstName,
                    lastName = u.LastName,
                    role = u.Role,
                    status = u.Status,
                    isVerified = u.IsVerified
                })
                .ToListAsync();

            return Ok(new { 
                users, 
                totalCount, 
                totalPages, 
                currentPage = page 
            });
        }

        [HttpPut("users/{id}/status")]
        public async Task<IActionResult> UpdateUserStatus(Guid id, [FromBody] UpdateStatusDto dto)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return NotFound(new { message = "User not found." });

            user.Status = dto.Status;
            await _context.SaveChangesAsync();
            
            return Ok(new { message = "User status updated successfully." });
        }

        [HttpDelete("users/{id}")]
        public async Task<IActionResult> DeleteUser(Guid id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return NotFound(new { message = "User not found." });

            if (user.Role == "Admin" || user.Role == "Superadmin")
            {
                return BadRequest(new { message = "Cannot delete admin accounts from here. Use Admin Management." });
            }

            user.Status = "Deleted";
            await _context.SaveChangesAsync();
            
            return Ok(new { message = "User moved to Recycle Bin." });
        }

        [HttpPut("users/{id}/restore")]
        public async Task<IActionResult> RestoreUser(Guid id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return NotFound(new { message = "User not found." });

            user.Status = "Active";
            await _context.SaveChangesAsync();
            
            return Ok(new { message = "User restored successfully." });
        }

        [HttpDelete("users/{id}/permanent")]
        public async Task<IActionResult> PermanentDeleteUser(Guid id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return NotFound(new { message = "User not found." });

            try {
                _context.Users.Remove(user);
                await _context.SaveChangesAsync();
                return Ok(new { message = "User permanently deleted from the database." });
            }
            catch (Exception)
            {
                return BadRequest(new { message = "Cannot permanently delete this user because they have existing tickets or events tied to their account." });
            }
        }

        // ==========================================
        // 4. ADMIN MANAGEMENT (Superadmin Only)
        // ==========================================
        [HttpGet("admins")]
        [Authorize(Roles = "Superadmin,superadmin")]
        public async Task<IActionResult> GetAdmins()
        {
            var admins = await _context.Users
                .Where(u => u.Role == "Admin" || u.Role == "Superadmin")
                .Select(u => new {
                    id = u.Id,
                    name = u.FirstName + " " + u.LastName,
                    email = u.Email,
                    role = u.Role 
                })
                .ToListAsync();

            return Ok(admins);
        }

        [HttpPost("admins")]
        [Authorize(Roles = "Superadmin,superadmin")]
        public async Task<IActionResult> CreateAdmin([FromBody] CreateAdminDto dto)
        {
            if (await _context.Users.AnyAsync(u => u.Email == dto.Email))
            {
                return BadRequest(new { message = "An account with this email already exists." });
            }

            var newAdmin = new User
            {
                Id = Guid.NewGuid(),
                Role = "Admin",
                Email = dto.Email,
                FirstName = dto.Name,
                LastName = "",
                MiddleName = "", 
                Suffix = "",     
                Status = "Active",
                CreatedAt = DateTime.UtcNow,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                DateOfBirth = new DateTime(1990, 1, 1),
                ContactNumber = "N/A",
                HouseNo = "N/A",
                StreetName = "N/A",
                Subdivision = "N/A",
                ZipCode = "N/A",
                Region = "N/A",
                Province = "N/A",
                City = "N/A",
                Barangay = "N/A",
                IdType = "N/A",
                IdReferenceNumber = "N/A",
                IdFrontPath = "N/A",
                IdBackPath = "N/A",
                SelfiePath = "N/A",
                OrgDocumentPath = "N/A"
            };

            _context.Users.Add(newAdmin);
            await _context.SaveChangesAsync();

            return Ok(new { 
                id = newAdmin.Id, 
                name = newAdmin.FirstName, 
                email = newAdmin.Email 
            });
        }

        [HttpPut("admins/{id}/role")]
        [Authorize(Roles = "Superadmin,superadmin")]
        public async Task<IActionResult> UpdateAdminRole(Guid id, [FromBody] UpdateRoleDto dto)
        {
            var admin = await _context.Users.FindAsync(id);
            if (admin == null) return NotFound(new { message = "Admin not found." });

            if (dto.Role != "Admin" && dto.Role != "Superadmin")
            {
                return BadRequest("Invalid role specified.");
            }

            admin.Role = dto.Role;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Admin role updated successfully." });
        }

        [HttpDelete("admins/{id}")]
        [Authorize(Roles = "Superadmin,superadmin")]
        public async Task<IActionResult> DeleteAdmin(Guid id)
        {
            var admin = await _context.Users.FindAsync(id);
            if (admin == null) return NotFound(new { message = "Admin not found." });

            if (admin.Role != "Admin" && admin.Role != "Superadmin")
            {
                return BadRequest("This user is not an admin.");
            }

            _context.Users.Remove(admin);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Admin deleted successfully." });
        }

        // ==========================================
        // 5. REAL-TIME EMAIL CHECKER
        // ==========================================
        [HttpGet("check-email")]
        public async Task<IActionResult> CheckEmailExists([FromQuery] string email)
        {
            if (string.IsNullOrWhiteSpace(email))
                return Ok(new { exists = false });

            var exists = await _context.Users.AnyAsync(u => u.Email.ToLower() == email.ToLower().Trim());
            return Ok(new { exists });
        }

        // ==========================================
        // 6. IDENTITY APPROVALS
        // ==========================================
        [HttpGet("identity-approvals")]
        public async Task<IActionResult> GetPendingIdentityApprovals()
        {
            var pendingUsers = await _context.Users
                .Where(u => (u.Role == "Attendee" || u.Role == "Organizer") 
                         && !u.IsVerified 
                         && u.Status == "Active"
                         && string.IsNullOrEmpty(u.VerificationMessage))
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
                    orgDocumentPath = u.OrgDocumentPath
                })
                .ToListAsync();

            return Ok(pendingUsers);
        }

        [HttpPut("identity-approvals/{id}/approve")]
        public async Task<IActionResult> ApproveIdentity(Guid id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return NotFound(new { message = "User not found." });

            user.IsVerified = true;
            user.VerificationMessage = null;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Identity approved successfully." });
        }

        [HttpPut("identity-approvals/{id}/reject")]
        public async Task<IActionResult> RejectIdentity(Guid id, [FromBody] RejectIdentityDto dto)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return NotFound(new { message = "User not found." });

            user.IsVerified = false;
            user.VerificationMessage = dto.Reason;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Identity rejected successfully." });
        }
    }

    // ==========================================
    // DTOs (Data Transfer Objects)
    // ==========================================
    public class UpdateStatusDto
    {
        public string Status { get; set; }
    }

    public class CreateAdminDto
    {
        public string Name { get; set; }
        public string Email { get; set; }
        public string Password { get; set; }
    }

    public class UpdateRoleDto
    {
        public string Role { get; set; }
    }

    public class RejectIdentityDto
    {
        public string Reason { get; set; }
    }
}