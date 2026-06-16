using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace VenU.Api.Models
{
    public class Venue
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public Guid Id { get; set; }

        [Required]
        [MaxLength(150)]
        public string Name { get; set; }

        [Required]
        [MaxLength(100)]
        public string Type { get; set; } // Mall, Exhibition Hall, etc.

        [MaxLength(255)]
        public string StreetAddress { get; set; }

        [MaxLength(100)]
        public string Barangay { get; set; }

        [MaxLength(100)]
        public string City { get; set; }

        [MaxLength(100)]
        public string Province { get; set; }

        [MaxLength(50)]
        public string Region { get; set; }

        [MaxLength(20)]
        public string ZipCode { get; set; }

        [Column(TypeName = "decimal(9,6)")]
        public decimal? Latitude { get; set; }

        [Column(TypeName = "decimal(9,6)")]
        public decimal? Longitude { get; set; }

        // Algorithm Stats
        [Column(TypeName = "decimal(3,1)")]
        public decimal Rating { get; set; } = 0.0M;
        
        public int OrganizersUsedCount { get; set; } = 0;
        
        public bool IsVerified { get; set; } = false;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public Guid? CreatedByOrganizerId { get; set; }
    }
}
