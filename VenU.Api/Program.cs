using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using VenU.Api.Data;
using VenU.Api.Middlewares;
using VenU.Api.Models;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.AspNetCore.RateLimiting;
using System.Threading.RateLimiting;

// Load environment variables from .env if present
var currentDir = Directory.GetCurrentDirectory();
var envPath = Path.Combine(currentDir, ".env");
if (!File.Exists(envPath))
{
    envPath = Path.Combine(currentDir, "..", ".env");
}
if (!File.Exists(envPath))
{
    envPath = Path.Combine(currentDir, "..", "VenU-app", ".env");
}

if (File.Exists(envPath))
{
    foreach (var line in File.ReadAllLines(envPath))
    {
        var trimmedLine = line.Trim();
        if (string.IsNullOrWhiteSpace(trimmedLine) || trimmedLine.StartsWith("#"))
            continue;

        var parts = trimmedLine.Split('=', 2);
        if (parts.Length == 2)
        {
            var key = parts[0].Trim();
            var val = parts[1].Trim();
            if ((val.StartsWith("\"") && val.EndsWith("\"")) || (val.StartsWith("'") && val.EndsWith("'")))
            {
                val = val.Substring(1, val.Length - 2);
            }
            Environment.SetEnvironmentVariable(key, val);
        }
    }
}

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers().AddJsonOptions(options =>
{
    options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
});
// Register Http Client and Image Moderation Service
builder.Services.AddHttpClient<VenU.Api.Services.IImageModerationService, VenU.Api.Services.ImageModerationService>();
builder.Services.AddScoped<VenU.Api.Services.IImageModerationService, VenU.Api.Services.ImageModerationService>();

// Register SignalR
builder.Services.AddSignalR();

// Register Email Service
builder.Services.AddHttpClient<VenU.Api.Services.IEmailService, VenU.Api.Services.EmailService>();
builder.Services.AddScoped<VenU.Api.Services.IEmailService, VenU.Api.Services.EmailService>();

// Register Notification Service
builder.Services.AddScoped<VenU.Api.Services.INotificationService, VenU.Api.Services.NotificationService>();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Configure MySQL DbContext
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<VenUDbContext>(options =>
    options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString)));

// Configure CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactFrontend",
        policy =>
        {
            policy.SetIsOriginAllowed(origin =>
                {
                    var host = new Uri(origin).Host;
                    return host == "localhost"
                        || host.EndsWith(".vercel.app")   // Vercel prod & preview URLs
                        || host == "venu-app.vercel.app"; // explicit prod URL
                })
                  .AllowAnyHeader()
                  .AllowAnyMethod()
                  .AllowCredentials();
        });
});

// Configure JWT Authentication
var jwtSettings = builder.Configuration.GetSection("Jwt");
var secretKey = jwtSettings["Key"];

// Clear the default Microsoft claim type mappings so role claims aren't remapped
JwtSecurityTokenHandler.DefaultInboundClaimTypeMap.Clear();

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings["Issuer"],
        ValidAudience = jwtSettings["Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey!)),
        RoleClaimType = ClaimTypes.Role
    };

    options.Events = new JwtBearerEvents
    {
        OnMessageReceived = context =>
        {
            var accessToken = context.Request.Query["access_token"];
            var path = context.Request.Path;
            if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/hub"))
            {
                context.Token = accessToken;
            }
            return Task.CompletedTask;
        }
    };
});

// Configure Rate Limiting
builder.Services.AddRateLimiter(options =>
{
    // Global Limit: 100 requests per 10 seconds per IP
    options.AddFixedWindowLimiter("Global", opt =>
    {
        opt.PermitLimit = 100;
        opt.Window = TimeSpan.FromSeconds(10);
        opt.QueueProcessingOrder = QueueProcessingOrder.OldestFirst;
        opt.QueueLimit = 2;
    });

    // Stricter Limit for Auth: 5 requests per minute per IP
    options.AddFixedWindowLimiter("AuthStrict", opt =>
    {
        opt.PermitLimit = 5;
        opt.Window = TimeSpan.FromMinutes(1);
        opt.QueueProcessingOrder = QueueProcessingOrder.OldestFirst;
        opt.QueueLimit = 0; // Reject immediately if over limit
    });

    options.OnRejected = async (context, token) =>
    {
        context.HttpContext.Response.StatusCode = 429;
        await context.HttpContext.Response.WriteAsync("Too many requests. Please try again later.", token);
    };
});

var app = builder.Build();

// Seed mock venues on startup
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<VenUDbContext>();
    try
    {
        context.Database.Migrate();

        var mockVenues = new List<VenU.Api.Models.Venue>
        {
            new VenU.Api.Models.Venue
            {
                Id = Guid.Parse("11111111-1111-1111-1111-111111111111"),
                Name = "SMX Convention Center",
                Type = "Exhibition Hall / Convention Center",
                StreetAddress = "Seashell Lane, Mall of Asia Complex, Pasay City",
                Region = "NCR",
                Province = "Metro Manila",
                City = "Manila",
                Barangay = "Brgy. 1",
                ZipCode = "1000",
                Rating = 4.8M,
                OrganizersUsedCount = 142,
                IsVerified = true,
                MaxCapacity = 15000,
                ContactPerson = "Maria Santos",
                ContactNumber = "09171234567",
                ContactEmail = "events@smx.ph",
                MapUrl = "https://maps.google.com/?q=smx",
                SquareFootage = 226000,
                NumberOfFloors = 4,
                HasFireExit = true,
                HasFireExtinguishers = true,
                Latitude = 14.5317M,
                Longitude = 120.9818M
            },
            new VenU.Api.Models.Venue
            {
                Id = Guid.Parse("22222222-2222-2222-2222-222222222222"),
                Name = "Philippine Arena",
                Type = "Exhibition Hall / Convention Center",
                StreetAddress = "Ciudad de Victoria, Santa Maria, Bulacan",
                Region = "Region III",
                Province = "Bulacan",
                City = "Santa Maria",
                Barangay = "Brgy. 1",
                ZipCode = "3022",
                Rating = 4.9M,
                OrganizersUsedCount = 89,
                IsVerified = true,
                MaxCapacity = 55000,
                ContactPerson = "Juan Dela Cruz",
                ContactNumber = "09189876543",
                ContactEmail = "info@philippinearena.net",
                MapUrl = "https://maps.google.com/?q=philippine+arena",
                SquareFootage = 1000000,
                NumberOfFloors = 6,
                HasFireExit = true,
                HasFireExtinguishers = true,
                Latitude = 14.7936M,
                Longitude = 120.9575M
            },
            new VenU.Api.Models.Venue
            {
                Id = Guid.Parse("33333333-3333-3333-3333-333333333333"),
                Name = "Whitespace Manila",
                Type = "Standalone Building / Street Address",
                StreetAddress = "2314 Chino Roces Ave Extension, Makati",
                Region = "NCR",
                Province = "Metro Manila",
                City = "Makati",
                Barangay = "Brgy. 2",
                ZipCode = "1200",
                Rating = 4.7M,
                OrganizersUsedCount = 230,
                IsVerified = true,
                MaxCapacity = 300,
                ContactPerson = "Anna Reyes",
                ContactNumber = "09191112222",
                ContactEmail = "book@whitespacemanila.com",
                MapUrl = "https://maps.google.com/?q=whitespace",
                SquareFootage = 7000,
                NumberOfFloors = 1,
                HasFireExit = true,
                HasFireExtinguishers = true,
                Latitude = 14.5422M,
                Longitude = 121.0183M
            }
        };

        bool modified = false;
        foreach (var mv in mockVenues)
        {
            var existing = context.Venues.FirstOrDefault(v => v.Id == mv.Id);
            if (existing == null)
            {
                context.Venues.Add(mv);
                modified = true;
            }
            else if (existing.Latitude == null || existing.Latitude == 0 || existing.Longitude == null || existing.Longitude == 0)
            {
                existing.Latitude = mv.Latitude;
                existing.Longitude = mv.Longitude;
                modified = true;
            }
        }

        if (modified)
        {
            context.SaveChanges();
        }

        // Removed auto-verification block to respect manual admin approval for custom venues
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Error running database migrations or seeding: {ex.Message}");
    }
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Only redirect to HTTPS in production - in development we use HTTP only
if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

app.UseMiddleware<SecurityHeadersMiddleware>();

app.UseCors("AllowReactFrontend");

app.UseRateLimiter();

app.UseStaticFiles(); // Serve static uploaded assets from wwwroot

app.UseAuthentication();
app.UseAuthorization();

// Enforce auto-logout for suspended accounts on every authenticated request
app.UseMiddleware<SuspensionCheckMiddleware>();

app.MapControllers();
app.MapHub<VenU.Api.Hubs.NotificationHub>("/hub/notifications");

// --- ADD THIS RIGHT ABOVE app.Run(); ---

using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var context = services.GetRequiredService<VenUDbContext>();
    
    // Check if a Superadmin already exists
    if (!context.Users.Any(u => u.Role == "Superadmin"))
    {
        var superAdmin = new User
        {
            Email = "superadmin@venu.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("SuperAdmin123!"),
            Role = "Superadmin",
            FirstName = "Super",
            LastName = "Admin",
            MiddleName = "", // Added
            Suffix = "",     // Added
            Status = "Active",
            
            // Fill required fields with dummy data
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

        context.Users.Add(superAdmin);
        context.SaveChanges();
    }
}

app.Run();
