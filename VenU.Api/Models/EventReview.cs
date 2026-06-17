using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace VenU.Api.Models
{
    public class EventReview
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public Guid Id { get; set; }

        [Required]
        public Guid EventId { get; set; }

        [ForeignKey("EventId")]
        public Event Event { get; set; }

        [Required]
        [MaxLength(150)]
        public string ReviewerName { get; set; }

        [Required]
        [Range(1, 5)]
        public int StarRating { get; set; }

        [MaxLength(2000)]
        public string FeedbackText { get; set; }

        [Required]
        public DateTime DateSubmitted { get; set; } = DateTime.UtcNow;
    }
}
