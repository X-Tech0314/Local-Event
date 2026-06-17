using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace VenU.Api.Models
{
    public class Venue
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public Guid Id { get; set; }

        // 1. Core Details
        [Required]
        [MaxLength(150)]
        public string Name { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string Type { get; set; } = string.Empty;

        [Column(TypeName = "decimal(10,2)")]
        public decimal FloorArea { get; set; } // in sq meters

        [Column(TypeName = "decimal(5,2)")]
        public decimal? CeilingHeight { get; set; } // in meters

        // 2. Location
        [MaxLength(255)]
        public string? StreetAddress { get; set; }

        [MaxLength(100)]
        public string? Barangay { get; set; }

        [MaxLength(100)]
        public string? City { get; set; }

        [MaxLength(100)]
        public string? Province { get; set; }

        [MaxLength(50)]
        public string? Region { get; set; }

        [MaxLength(20)]
        public string? ZipCode { get; set; }

        [MaxLength(255)]
        public string? Landmarks { get; set; }

        [Column(TypeName = "decimal(9,6)")]
        public decimal? Latitude { get; set; }

        [Column(TypeName = "decimal(9,6)")]
        public decimal? Longitude { get; set; }

        [MaxLength(500)]
        public string? MapUrl { get; set; }

        // 3. Contact Info
        [MaxLength(100)]
        public string? RepresentativeName { get; set; }

        [MaxLength(20)]
        [RegularExpression(@"^09\d{2}-\d{3}-\d{4}$", ErrorMessage = "Invalid mobile format.")]
        public string? MobileNumber { get; set; }

        [MaxLength(20)]
        public string? Landline { get; set; }

        [MaxLength(100)]
        [EmailAddress]
        public string? Email { get; set; }

        [MaxLength(255)]
        public string? WebsiteUrl { get; set; }

        // 4. Capacity & Logistics
        public int MaxCapacity { get; set; } = 0; // Legacy mapping
        public int CapacityTheater { get; set; }
        public int CapacityBanquet { get; set; }
        public int CapacityStanding { get; set; }
        
        public int ParkingSlots { get; set; }
        public int NumberOfFloors { get; set; } = 1;
        
        [MaxLength(100)]
        public string? OperatingHours { get; set; }

        public bool HasAircon { get; set; }
        public bool HasSoundSystem { get; set; }
        public bool HasBackupGenerator { get; set; }
        public bool HasHoldingRooms { get; set; }

        // 5. PH Compliance & Safety
        [MaxLength(100)]
        public string? FsicNumber { get; set; }

        [MaxLength(100)]
        public string? BusinessPermitNumber { get; set; }

        public bool HasBirForm2303 { get; set; }
        public bool HasSmokeDetectors { get; set; }
        public bool HasFireExits { get; set; }
        public bool HasFireExtinguishers { get; set; } = false;
        public bool HasFireExit { get; set; } = false; // Legacy

        // 6. Media & Files (Stored as JSON array or URLs)
        public string? VenueImages { get; set; } // JSON array of Cloudinary URLs
        public string? FloorPlanUrl { get; set; }
        public string? LegalPermitsUrl { get; set; }

        // Algorithm Stats
        [Column(TypeName = "decimal(3,1)")]
        public decimal Rating { get; set; } = 0.0M;
        
        public int OrganizersUsedCount { get; set; } = 0;
        
        public bool IsVerified { get; set; } = false;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public Guid? CreatedByOrganizerId { get; set; }

        // Legacy fields for backward compatibility to prevent crashes during migration
        [MaxLength(100)] public string? ContactPerson { get; set; }
        [MaxLength(50)] public string? ContactNumber { get; set; }
        [MaxLength(100)] public string? ContactEmail { get; set; }
        public int SquareFootage { get; set; } = 0;
    }
}
