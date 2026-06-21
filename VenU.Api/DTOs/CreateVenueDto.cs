using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;

namespace VenU.Api.DTOs
{
    public class CreateVenueDto
    {
        // 1. Core
        [Required] public string Name { get; set; } = string.Empty;
        [Required] public string Type { get; set; } = string.Empty;
        public decimal FloorArea { get; set; }
        public decimal? CeilingHeight { get; set; }

        // 2. Location
        public string? StreetAddress { get; set; }
        public string? Barangay { get; set; }
        public string? City { get; set; }
        public string? Province { get; set; }
        public string? Region { get; set; }
        public string? ZipCode { get; set; }
        public string? Landmarks { get; set; }
        public decimal? Latitude { get; set; }
        public decimal? Longitude { get; set; }
        // PSGC codes
        public string? RegionCode { get; set; }
        public string? ProvinceCode { get; set; }
        public string? CityMunCode { get; set; }
        public string? BarangayCode { get; set; }

        // 3. Contact
        public string? RepresentativeName { get; set; }
        
        [RegularExpression(@"^09\d{2}-\d{3}-\d{4}$", ErrorMessage = "Must be 09XX-XXX-XXXX format")]
        public string? MobileNumber { get; set; }
        public string? Landline { get; set; }
        
        [EmailAddress] 
        public string? Email { get; set; }
        public string? WebsiteUrl { get; set; }

        // 4. Logistics
        public int CapacityTheater { get; set; }
        public int CapacityBanquet { get; set; }
        public int CapacityStanding { get; set; }
        public int ParkingSlots { get; set; }
        public string? OperatingHours { get; set; }
        public bool HasAircon { get; set; }
        public bool HasSoundSystem { get; set; }
        public bool HasBackupGenerator { get; set; }
        public bool HasHoldingRooms { get; set; }

        // 5. Compliance
        public string? FsicNumber { get; set; }
        public string? BusinessPermitNumber { get; set; }
        public bool HasBirForm2303 { get; set; }
        public bool HasSmokeDetectors { get; set; }
        public bool HasFireExits { get; set; }

        // Files
        public List<IFormFile>? GalleryImages { get; set; }
        public IFormFile? FloorPlanFile { get; set; }
        public IFormFile? LegalPermitsFile { get; set; }
    }
}
