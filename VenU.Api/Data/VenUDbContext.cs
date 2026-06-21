using Microsoft.EntityFrameworkCore;
using VenU.Api.Models;

namespace VenU.Api.Data
{
    public class VenUDbContext : DbContext
    {
        public VenUDbContext(DbContextOptions<VenUDbContext> options) : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<Event> Events { get; set; }
        public DbSet<Ticket> Tickets { get; set; }
        public DbSet<EventTicketTier> EventTicketTiers { get; set; }
        public DbSet<Venue> Venues { get; set; }
        public DbSet<VenueImage> VenueImages { get; set; }
        public DbSet<EventAttendee> EventAttendees { get; set; }
        public DbSet<EventReview> EventReviews { get; set; }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            
            // Unique Constraints
            modelBuilder.Entity<User>()
                .HasIndex(u => u.Email)
                .IsUnique();
                
            modelBuilder.Entity<Ticket>()
                .HasIndex(t => t.TicketCode)
                .IsUnique();

            // Cascade delete for Event -> TicketTiers
            modelBuilder.Entity<EventTicketTier>()
                .HasOne(t => t.Event)
                .WithMany(e => e.TicketTiers)
                .HasForeignKey(t => t.EventId)
                .OnDelete(DeleteBehavior.Cascade);

            // Cascade delete for Venue -> VenueImages
            modelBuilder.Entity<VenueImage>()
                .HasOne(vi => vi.Venue)
                .WithMany(v => v.Images)
                .HasForeignKey(vi => vi.VenueId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
