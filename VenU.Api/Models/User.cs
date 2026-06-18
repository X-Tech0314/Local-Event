using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace VenU.Api.Models
{
    public class User
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public Guid Id { get; set; }

        [Required]
        [MaxLength(20)]
        public string Role { get; set; }

        [Required]
        [EmailAddress]
        [MaxLength(100)]
        public string Email { get; set; }

        [Required]
        public string PasswordHash { get; set; }

        [MaxLength(50)]
        public string FirstName { get; set; }

        [MaxLength(50)]
        public string MiddleName { get; set; }

        [MaxLength(50)]
        public string LastName { get; set; }

        [MaxLength(10)]
        public string Suffix { get; set; }

        public DateTime DateOfBirth { get; set; }

        [MaxLength(20)]
        public string ContactNumber { get; set; }

        public bool IsVerified { get; set; } = false;

        [MaxLength(100)]
        public string HouseNo { get; set; }

        [MaxLength(100)]
        public string StreetName { get; set; }

        [MaxLength(100)]
        public string Subdivision { get; set; }

        [MaxLength(20)]
        public string ZipCode { get; set; }

        [MaxLength(50)]
        public string Region { get; set; }

        [MaxLength(50)]
        public string Province { get; set; }

        [MaxLength(50)]
        public string City { get; set; }

        [MaxLength(50)]
        public string Barangay { get; set; }

        [MaxLength(50)]
        public string IdType { get; set; }

        [MaxLength(100)]
        public string IdReferenceNumber { get; set; }

        public string IdFrontPath { get; set; }
        public string IdBackPath { get; set; }
        public string SelfiePath { get; set; }
        
        [MaxLength(100)]
        public string? Position { get; set; }

        [MaxLength(50)]
        public string? OrgType { get; set; }

        [MaxLength(150)]
        public string? OrgName { get; set; }

        [MaxLength(30)]
        public string? TinNumber { get; set; }

        public string? OrgDocumentPath { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Add this inside the User class
        [MaxLength(20)]
        public string Status { get; set; } = "Active"; // Active or Suspended
    }
}
