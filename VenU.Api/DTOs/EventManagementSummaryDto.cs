using System;
using System.Collections.Generic;

namespace VenU.Api.DTOs
{
    public class EventReviewDto
    {
        public Guid Id { get; set; }
        public string ReviewerName { get; set; }
        public int StarRating { get; set; }
        public string FeedbackText { get; set; }
        public DateTime DateSubmitted { get; set; }
    }

    public class EventManagementSummaryDto
    {
        public Guid EventId { get; set; }
        public string EventTitle { get; set; }
        public int TotalRegistered { get; set; }
        public int CheckedInCount { get; set; }
        public decimal AverageRating { get; set; }
        public int TotalReviews { get; set; }
        public bool IsEnded { get; set; }
        public IEnumerable<EventReviewDto> Reviews { get; set; }
        public IEnumerable<AttendeeDto> Attendees { get; set; }
    }
}
