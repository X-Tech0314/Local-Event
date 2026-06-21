using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace VenU.Api.Models
{
    public class VenueImage
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [Required]
        public Guid VenueId { get; set; }

        [ForeignKey("VenueId")]
        public Venue? Venue { get; set; }

        [Required]
        [MaxLength(255)]
        public string CloudinaryUrl { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string CloudinaryPublicId { get; set; } = string.Empty;

        [Required]
        [MaxLength(20)]
        public string Status { get; set; } = "PENDING_REVIEW"; // APPROVED, REJECTED, PENDING_REVIEW

        [Column(TypeName = "decimal(5,2)")]
        public decimal AiScore { get; set; } = 0.00m;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
