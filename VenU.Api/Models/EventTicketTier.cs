using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace VenU.Api.Models
{
    public class EventTicketTier
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int TierId { get; set; }

        [Required]
        public Guid EventId { get; set; }

        [ForeignKey("EventId")]
        public Event Event { get; set; }

        [Required]
        [MaxLength(50)]
        public string TierName { get; set; }

        [Required]
        public int OnlineSlots { get; set; }

        [Required]
        public int F2FSlots { get; set; }

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal Price { get; set; } = 0.00M;

        [Required]
        [MaxLength(100)]
        public string ValidityScope { get; set; } = "Full Event Multi-Pass (All Days)";
    }
}
