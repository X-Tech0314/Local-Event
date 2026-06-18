using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using VenU.Api.Data;
using VenU.Api.Models;
using CloudinaryDotNet;
using CloudinaryDotNet.Actions;

namespace VenU.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly VenUDbContext _context;
        private readonly IConfiguration _configuration;
        private readonly IWebHostEnvironment _env;

        public AuthController(VenUDbContext context, IConfiguration configuration, IWebHostEnvironment env)
        {
            _context = context;
            _configuration = configuration;
            _env = env;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto request)
        {
            if (await _context.Users.AnyAsync(u => u.Email == request.Email))
            {
                return BadRequest(new { Message = "Email is already registered." });
            }

            var user = new User
            {
                Email = request.Email ?? "",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
                Role = request.Role ?? "Attendee",
                FirstName = request.FirstName ?? "",
                MiddleName = request.MiddleName ?? "",
                LastName = request.LastName ?? "",
                Suffix = request.Suffix ?? "",
                DateOfBirth = request.DateOfBirth ?? DateTime.UtcNow.AddYears(-18),
                ContactNumber = request.ContactNumber ?? "",
                HouseNo = request.HouseNo ?? "",
                StreetName = request.StreetName ?? "",
                Subdivision = request.Subdivision ?? "",
                ZipCode = request.ZipCode ?? "",
                Region = request.Region ?? "",
                Province = request.Province ?? "",
                City = request.City ?? "",
                Barangay = request.Barangay ?? "",
                IdType = request.IdType ?? "",
                IdReferenceNumber = request.IdReferenceNumber ?? "",
                IdFrontPath = request.IdFrontPath ?? "",
                IdBackPath = request.IdBackPath ?? "",
                SelfiePath = request.SelfiePath ?? "",
                Position = request.Position ?? "",
                OrgType = request.OrgType ?? "",
                OrgName = request.OrgName ?? "",
                TinNumber = request.TinNumber ?? "",
                OrgDocumentPath = request.OrgDocumentPath ?? "",
                IsVerified = false // Back to false for real identity verification workflow
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return Ok(new { Message = "User registered successfully." });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto request)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);

            if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            {
                return Unauthorized(new { Message = "Invalid email or password." });
            }

            if (user.Status == "Suspended" || user.Status == "Deleted")
            {
                return Unauthorized(new { Message = "Your account has been suspended or deleted. Please contact an administrator." });
            }

            var token = GenerateJwtToken(user);

            return Ok(new
            {
                Token = token,
                User = new
                {
                    user.Id,
                    user.Email,
                    user.Role,
                    user.FirstName,
                    user.LastName,
                    user.Barangay
                }
            });
        }

        private string GenerateJwtToken(User user)
        {
            var jwtSettings = _configuration.GetSection("Jwt");
            var key = Encoding.UTF8.GetBytes(jwtSettings["Key"]!);

            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
                new Claim(JwtRegisteredClaimNames.Email, user.Email),
                new Claim(ClaimTypes.Role, user.Role),
                new Claim("role", user.Role),
                new Claim("FirstName", user.FirstName ?? "")
            };

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.UtcNow.AddHours(24),
                Issuer = jwtSettings["Issuer"],
                Audience = jwtSettings["Audience"],
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            var tokenHandler = new JwtSecurityTokenHandler();
            var token = tokenHandler.CreateToken(tokenDescriptor);

            return tokenHandler.WriteToken(token);
        }

        [HttpPost("upload")]
        public async Task<IActionResult> UploadImage(IFormFile file)
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest("No file uploaded.");
            }

            var cloudName = _configuration["Cloudinary:CloudName"];
            var apiKey = _configuration["Cloudinary:ApiKey"];
            var apiSecret = _configuration["Cloudinary:ApiSecret"];

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

            var localUrl = $"{Request.Scheme}://{Request.Host}/uploads/{uniqueFileName}";
            return Ok(new { url = localUrl });
        }
    }

    public class RegisterDto
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string Role { get; set; } = "Attendee";
        public string FirstName { get; set; } = string.Empty;
        public string? MiddleName { get; set; }
        public string LastName { get; set; } = string.Empty;
        public string? Suffix { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public string? ContactNumber { get; set; }
        public string? HouseNo { get; set; }
        public string? StreetName { get; set; }
        public string? Subdivision { get; set; }
        public string? ZipCode { get; set; }
        public string? Region { get; set; }
        public string? Province { get; set; }
        public string? City { get; set; }
        public string? Barangay { get; set; }
        public string? IdType { get; set; }
        public string? IdReferenceNumber { get; set; }
        public string? Position { get; set; }
        public string? OrgType { get; set; }
        public string? OrgName { get; set; }
        public string? TinNumber { get; set; }
        public string? IdFrontPath { get; set; }
        public string? IdBackPath { get; set; }
        public string? SelfiePath { get; set; }
        public string? OrgDocumentPath { get; set; }
    }

    public class LoginDto
    {
        public string Email { get; set; }
        public string Password { get; set; }
    }
}
