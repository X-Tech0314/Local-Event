using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using VenU.Api.Data;

namespace VenU.Api.Scripts
{
    public class SanitizeDb
    {
        public static async Task Run(IServiceProvider serviceProvider)
        {
            using var scope = serviceProvider.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<VenUDbContext>();

            Console.WriteLine("---------------------------------------------");
            Console.WriteLine("DATABASE SANITATION: Starting clean-up...");
            Console.WriteLine("---------------------------------------------");

            // 1. Delete dependent transactional records
            Console.WriteLine("Wiping Tickets...");
            context.Tickets.RemoveRange(context.Tickets);

            Console.WriteLine("Wiping EventAttendees...");
            context.EventAttendees.RemoveRange(context.EventAttendees);

            Console.WriteLine("Wiping EventReviews...");
            context.EventReviews.RemoveRange(context.EventReviews);

            Console.WriteLine("Wiping EventTicketTiers...");
            context.EventTicketTiers.RemoveRange(context.EventTicketTiers);

            Console.WriteLine("Wiping Notifications...");
            context.Notifications.RemoveRange(context.Notifications);

            await context.SaveChangesAsync();
            Console.WriteLine("Transaction ledger tables successfully cleared.");

            // 2. Delete Events
            Console.WriteLine("Wiping Events...");
            context.Events.RemoveRange(context.Events);
            await context.SaveChangesAsync();
            Console.WriteLine("All Event records successfully cleared.");

            // 3. Delete Venues except seeded ones
            Console.WriteLine("Wiping Custom Venues (keeping SMX Convention Center, Philippine Arena, Whitespace Manila)...");
            var seededVenueIds = new[]
            {
                Guid.Parse("11111111-1111-1111-1111-111111111111"),
                Guid.Parse("22222222-2222-2222-2222-222222222222"),
                Guid.Parse("33333333-3333-3333-3333-333333333333")
            };
            var customVenues = context.Venues.Where(v => !seededVenueIds.Contains(v.Id));
            context.Venues.RemoveRange(customVenues);

            // Also clean up images for deleted venues
            var customVenueImages = context.VenueImages.Where(vi => !seededVenueIds.Contains(vi.VenueId));
            context.VenueImages.RemoveRange(customVenueImages);

            await context.SaveChangesAsync();
            Console.WriteLine("All custom venue listings successfully cleared.");

            // 4. Delete Users except Superadmin
            Console.WriteLine("Wiping Users (keeping Superadmin account)...");
            var nonAdmins = context.Users.Where(u => u.Role != "Superadmin");
            context.Users.RemoveRange(nonAdmins);

            await context.SaveChangesAsync();
            Console.WriteLine("All test organizer and attendee user profiles successfully cleared.");
            Console.WriteLine("---------------------------------------------");
            Console.WriteLine("DATABASE SANITATION: Complete!");
            Console.WriteLine("---------------------------------------------");
        }
    }
}
