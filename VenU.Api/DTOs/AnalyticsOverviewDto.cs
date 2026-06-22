namespace VenU.Api.DTOs
{
    public class AnalyticsOverviewDto
    {
        public decimal GrossSales { get; set; }
        public decimal TicketConversion { get; set; }
        public int PageEngagements { get; set; }
        public int TotalTicketsSold { get; set; }
        public int TotalRegistrants { get; set; }
        public int TotalEventsTracked { get; set; }
    }
}
