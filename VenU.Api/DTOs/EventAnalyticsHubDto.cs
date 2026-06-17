using System;
using System.Collections.Generic;

namespace VenU.Api.DTOs
{
    public class EventAnalyticsHubDto
    {
        public Guid EventId { get; set; }
        public string EventTitle { get; set; }
        public int MaxCapacity { get; set; }
        public int TotalRegistered { get; set; }
        public int CheckedInCount { get; set; }
        public decimal ArrivalRatePercentage { get; set; }
        public bool IsOverCapacity { get; set; }
        public IEnumerable<AttendeeDto> Attendees { get; set; }
    }

    public class AttendeeDto
    {
        public Guid Id { get; set; }
        public string AttendeeName { get; set; }
        public string MaskedEmail { get; set; }
        public string TicketType { get; set; }
        public bool IsPresent { get; set; }
        public DateTime? ArrivalTime { get; set; }
    }
}
