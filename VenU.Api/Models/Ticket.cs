using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace VenU.Api.Models
{
    public class Ticket
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public Guid Id { get; set; }

        [Required]
        public Guid EventId { get; set; }

        [ForeignKey("EventId")]
        public Event Event { get; set; }

        [Required]
        public Guid AttendeeId { get; set; }

        [ForeignKey("AttendeeId")]
        public User Attendee { get; set; }

        [Required]
        [MaxLength(50)]
        public string TicketCode { get; set; }

        [MaxLength(20)]
        public string Status { get; set; } // Valid, Scanned, Cancelled

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
