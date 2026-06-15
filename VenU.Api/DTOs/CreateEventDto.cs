namespace VenU.Api.DTOs
{
    public class CreateEventDto
    {
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public string? BannerUrl { get; set; }
        
        public DateTime StartDateTime { get; set; }
        public DateTime EndDateTime { get; set; }
        
        public DateTime TicketSalesStart { get; set; }
        public DateTime TicketSalesEnd { get; set; }
        
        public string StreetAddress { get; set; } = string.Empty;
        public string Barangay { get; set; } = string.Empty;
        public string City { get; set; } = string.Empty;
        public string Province { get; set; } = string.Empty;
        public string Region { get; set; } = string.Empty;
        public string ZipCode { get; set; } = string.Empty;
        
        public decimal? Latitude { get; set; }
        public decimal? Longitude { get; set; }
        
        public string AccessType { get; set; } = "Public"; // Default Value Set
        public string? VerificationCode { get; set; }
        
        public int MaxCapacity { get; set; }
        
        // Relational Nested Structure Loop Collection
        public List<TicketTierDto> TicketTiers { get; set; } = new List<TicketTierDto>();
    }

    public class TicketTierDto
    {
        public string TierName { get; set; } = string.Empty;
        public int AllocatedSlots { get; set; }
        public decimal Price { get; set; } = 0.00M;
        public string ValidityScope { get; set; } = "Full Event Multi-Pass (All Days)";
    }
}
