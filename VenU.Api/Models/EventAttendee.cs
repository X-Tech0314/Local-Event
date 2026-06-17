using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace VenU.Api.Models
{
    public class EventAttendee
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public Guid Id { get; set; }

        [Required]
        public Guid EventId { get; set; }
        
        [ForeignKey("EventId")]
        public Event Event { get; set; }

        [Required]
        [MaxLength(100)]
        public string AttendeeName { get; set; }

        [Required]
        [MaxLength(150)]
        public string AttendeeEmail { get; set; }

        [MaxLength(50)]
        public string TicketType { get; set; }

        public bool IsPresent { get; set; } = false;

        public DateTime? ArrivalTime { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
