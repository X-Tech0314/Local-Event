using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace VenU.Api.Models
{
    public class Event
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public Guid Id { get; set; }

        [Required]
        public Guid OrganizerId { get; set; }
        
        [ForeignKey("OrganizerId")]
        public User Organizer { get; set; }

        [Required]
        [MaxLength(200)]
        public string Title { get; set; }

        [MaxLength(2000)]
        public string Description { get; set; }

        [MaxLength(50)]
        public string Category { get; set; }

        public DateTime Date { get; set; }
        
        [MaxLength(20)]
        public string Time { get; set; }

        public bool IsPaid { get; set; }
        
        [Column(TypeName = "decimal(18,2)")]
        public decimal BasePrice { get; set; }

        [MaxLength(20)]
        public string Status { get; set; } // Draft, Published, Cancelled

        // Location fields for event matching
        [MaxLength(50)]
        public string City { get; set; }

        [MaxLength(50)]
        public string Barangay { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
