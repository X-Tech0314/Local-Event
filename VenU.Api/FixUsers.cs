using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using VenU.Api.Data;
using System.Linq;
using System.Threading.Tasks;
using System;

namespace VenU.Api.Scripts
{
    public class FixUsers
    {
        public static async Task Run(IServiceProvider serviceProvider)
        {
            using var scope = serviceProvider.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<VenUDbContext>();
            var suspendedUsers = await context.Users.Where(u => !u.IsVerified).ToListAsync();
            
            foreach (var user in suspendedUsers)
            {
                user.IsVerified = true;
            }

            await context.SaveChangesAsync();
            Console.WriteLine($"Fixed {suspendedUsers.Count} users to Active status.");
        }
    }
}
