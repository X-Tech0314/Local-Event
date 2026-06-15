using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace VenU.Api.Models
{
    public class Event
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public Guid Id { get; set; } // Representing EventId

        [Required]
        [MaxLength(150)]
        public string Title { get; set; }

        [Required]
        public string Description { get; set; }

        [Required]
        [MaxLength(50)]
        public string Category { get; set; }

        [MaxLength(2083)]
        public string BannerUrl { get; set; }

        // Logistics & Timestamps
        [Required]
        public DateTime StartDateTime { get; set; }

        [Required]
        public DateTime EndDateTime { get; set; }

        // Cascading Location Parameters
        [Required]
        [MaxLength(255)]
        public string StreetAddress { get; set; }

        [Required]
        [MaxLength(100)]
        public string Barangay { get; set; }

        [Required]
        [MaxLength(100)]
        public string City { get; set; }

        [Required]
        [MaxLength(100)]
        public string Province { get; set; }

        [Required]
        [MaxLength(50)]
        public string Region { get; set; }

        [Required]
        [MaxLength(20)]
        public string ZipCode { get; set; }

        // Geospatial Map Tracking Variables
        [Column(TypeName = "decimal(9,6)")]
        public decimal? Latitude { get; set; }

        [Column(TypeName = "decimal(9,6)")]
        public decimal? Longitude { get; set; }

        // Privacy & Authorization Access Controls
        [Required]
        [MaxLength(10)]
        public string AccessType { get; set; } = "Public"; // 'Public' or 'Private'

        [MaxLength(20)]
        public string VerificationCode { get; set; }

        [Required]
        public int MaxCapacity { get; set; }

        [Required]
        public Guid OrganizerId { get; set; } // Foreign Key

        [ForeignKey("OrganizerId")]
        public User Organizer { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation Property for Ticket Tiers
        public ICollection<EventTicketTier> TicketTiers { get; set; }
    }
}
