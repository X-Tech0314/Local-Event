using System.ComponentModel.DataAnnotations;

namespace VenU.Api.DTOs
{
    public class ScanQrDto
    {
        [Required]
        public string Token { get; set; } = string.Empty;
    }
}
