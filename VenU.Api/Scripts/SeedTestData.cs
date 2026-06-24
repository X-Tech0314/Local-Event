using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using VenU.Api.Data;
using VenU.Api.Models;

namespace VenU.Api.Scripts
{
    public class SeedTestData
    {
        public static async Task Run(IServiceProvider serviceProvider)
        {
            using var scope = serviceProvider.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<VenUDbContext>();

            // 1. Check if the test organizer already exists
            var organizerEmail = "testorganizer@venu.com";
            var organizer = await context.Users.FirstOrDefaultAsync(u => u.Email == organizerEmail);
            if (organizer == null)
            {
                organizer = new User
                {
                    Id = Guid.NewGuid(),
                    Email = organizerEmail,
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("Password123!"),
                    Role = "Organizer",
                    FirstName = "Test",
                    LastName = "Organizer",
                    MiddleName = "",
                    Suffix = "",
                    Status = "Active",
                    IsVerified = true,
                    CreatedAt = DateTime.UtcNow,
                    DateOfBirth = new DateTime(1990, 1, 1),
                    ContactNumber = "09170000000",
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
                context.Users.Add(organizer);
            }

            // 2. Check if the test attendee already exists
            var attendeeEmail = "testattendee@venu.com";
            var attendee = await context.Users.FirstOrDefaultAsync(u => u.Email == attendeeEmail);
            if (attendee == null)
            {
                attendee = new User
                {
                    Id = Guid.NewGuid(),
                    Email = attendeeEmail,
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("Password123!"),
                    Role = "Attendee",
                    FirstName = "Test",
                    LastName = "Attendee",
                    MiddleName = "",
                    Suffix = "",
                    Status = "Active",
                    IsVerified = true,
                    CreatedAt = DateTime.UtcNow,
                    DateOfBirth = new DateTime(1995, 5, 5),
                    ContactNumber = "09180000000",
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
                context.Users.Add(attendee);
            }

            await context.SaveChangesAsync();

            // 3. Check if the test event already exists
            var eventTitle = "Taylor Swift Tribute Concert";
            var testEvent = await context.Events.Include(e => e.TicketTiers).FirstOrDefaultAsync(e => e.Title == eventTitle);
            if (testEvent == null)
            {
                testEvent = new Event
                {
                    Id = Guid.NewGuid(),
                    Title = eventTitle,
                    Description = "A spectacular tribute concert celebrating the eras of Taylor Swift. Join us for a night of music, visuals, and fan connections.",
                    Category = "Music / Concerts",
                    Status = "Published",
                    AccessType = "Public",
                    StartDateTime = DateTime.UtcNow.AddDays(7),
                    EndDateTime = DateTime.UtcNow.AddDays(7).AddHours(4),
                    MaxCapacity = 1000,
                    StreetAddress = "2314 Chino Roces Ave Extension, Makati",
                    Barangay = "Brgy. 2",
                    City = "Makati",
                    Province = "Metro Manila",
                    Region = "NCR",
                    ZipCode = "1200",
                    OrganizerId = organizer.Id,
                    CreatedAt = DateTime.UtcNow,
                    RequiresTicket = true,
                    BannerUrl = "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80",
                    VenueId = Guid.Parse("33333333-3333-3333-3333-333333333333"),
                    VenueName = "Whitespace Manila",
                    VenueType = "Standalone Building / Street Address",
                    FloorLevel = "N/A",
                    WingSection = "N/A",
                    BoothNumber = "N/A",
                    ProximityAnchor = "N/A",
                    LogisticsNotes = "N/A",
                    VerificationCode = "N/A",
                    Latitude = 14.5422M,
                    Longitude = 121.0183M,
                    MapUrl = "https://maps.google.com/?q=whitespace"
                };
                context.Events.Add(testEvent);
                await context.SaveChangesAsync();

                // Add ticket tiers
                var regularTier = new EventTicketTier
                {
                    EventId = testEvent.Id,
                    TierName = "Regular",
                    Price = 500.00M,
                    OnlineSlots = 500,
                    F2FSlots = 100,
                    ValidityScope = "General Admission Entry"
                };

                var vipTier = new EventTicketTier
                {
                    EventId = testEvent.Id,
                    TierName = "VIP",
                    Price = 2000.00M,
                    OnlineSlots = 100,
                    F2FSlots = 20,
                    ValidityScope = "Front Row + Meet & Greet Pass"
                };

                context.EventTicketTiers.Add(regularTier);
                context.EventTicketTiers.Add(vipTier);
                await context.SaveChangesAsync();

                // Create EventAttendee & Tickets (Simulating 3 Regular + 2 VIP registrations)
                // Total expected sales: (3 * 500) + (2 * 2000) = 5,500 PHP
                var bookings = new List<(string Name, string Email, string Tier)>
                {
                    ("Alice Cooper", "alice@music.com", "Regular"),
                    ("Bob Marley", "bob@music.com", "Regular"),
                    ("Charlie Puth", "charlie@music.com", "Regular"),
                    ("Diana Ross", "diana@music.com", "VIP"),
                    ("Elton John", "elton@music.com", "VIP")
                };

                foreach (var b in bookings)
                {
                    var attendeeRecord = new EventAttendee
                    {
                        Id = Guid.NewGuid(),
                        EventId = testEvent.Id,
                        AttendeeName = b.Name,
                        AttendeeEmail = b.Email,
                        TicketType = b.Tier,
                        IsPresent = false,
                        CreatedAt = DateTime.UtcNow
                    };
                    context.EventAttendees.Add(attendeeRecord);

                    var ticketRecord = new Ticket
                    {
                        Id = Guid.NewGuid(),
                        EventId = testEvent.Id,
                        AttendeeId = attendee.Id,
                        TicketCode = attendeeRecord.Id.ToString(),
                        Status = "Valid",
                        CreatedAt = DateTime.UtcNow
                    };
                    context.Tickets.Add(ticketRecord);
                }

                await context.SaveChangesAsync();
                Console.WriteLine("Mock test data for revenue verification seeded successfully: ₱5,500 sales generated.");
            }
        }
    }
}
