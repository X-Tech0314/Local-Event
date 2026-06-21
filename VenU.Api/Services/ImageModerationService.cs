using System.Net.Http.Headers;
using System.Text.Json;
using CloudinaryDotNet;
using CloudinaryDotNet.Actions;

namespace VenU.Api.Services
{
    public interface IImageModerationService
    {
        Task<(string Url, string PublicId)> UploadImageAsync(IFormFile file);
        Task<decimal> ModerateImageAsync(string imageUrl);
        Task<bool> DeleteImageAsync(string publicId);
    }

    public class ImageModerationService : IImageModerationService
    {
        private readonly Cloudinary _cloudinary;
        private readonly HttpClient _httpClient;
        private readonly IConfiguration _configuration;

        public ImageModerationService(IConfiguration configuration, HttpClient httpClient)
        {
            _configuration = configuration;
            _httpClient = httpClient;

            var acc = new Account(
                _configuration["Cloudinary:CloudName"] ?? "YOUR_CLOUD_NAME",
                _configuration["Cloudinary:ApiKey"] ?? "YOUR_API_KEY",
                _configuration["Cloudinary:ApiSecret"] ?? "YOUR_API_SECRET"
            );
            _cloudinary = new Cloudinary(acc);
        }

        public async Task<(string Url, string PublicId)> UploadImageAsync(IFormFile file)
        {
            if (file.Length > 0)
            {
                using var stream = file.OpenReadStream();
                var uploadParams = new ImageUploadParams
                {
                    File = new FileDescription(file.FileName, stream),
                    Folder = "venu_images"
                };

                var uploadResult = await _cloudinary.UploadAsync(uploadParams);
                return (uploadResult.SecureUrl.ToString(), uploadResult.PublicId);
            }
            return (string.Empty, string.Empty);
        }

        public async Task<decimal> ModerateImageAsync(string imageUrl)
        {
            // Use Sightengine API for moderation
            string apiUser = _configuration["Sightengine:ApiUser"] ?? _configuration["Sightengine:User"] ?? "YOUR_SIGHTENGINE_API_USER";
            string apiSecret = _configuration["Sightengine:ApiSecret"] ?? "YOUR_SIGHTENGINE_API_SECRET";

            string requestUrl = $"https://api.sightengine.com/1.0/check.json?url={Uri.EscapeDataString(imageUrl)}&models=nudity,gore,weapons&api_user={apiUser}&api_secret={apiSecret}";

            try
            {
                var response = await _httpClient.GetAsync(requestUrl);
                if (response.IsSuccessStatusCode)
                {
                    var content = await response.Content.ReadAsStringAsync();
                    using var document = JsonDocument.Parse(content);
                    var root = document.RootElement;

                    if (root.TryGetProperty("status", out var status) && status.GetString() == "success")
                    {
                        // Calculate a combined risk score (0-100) based on Sightengine probabilities
                        // Sightengine returns probabilities between 0.0 and 1.0
                        decimal maxRisk = 0;

                        if (root.TryGetProperty("nudity", out var nudity))
                        {
                            decimal nudityRisk = nudity.GetProperty("safe").GetDecimal() < 0.5m ? 1.0m : 0.0m; // Simple mapping, but let's use the actual probability of NSFW
                            // Sightengine nudity model returns multiple properties. We'll check the "safe" property.
                            // The lower the "safe" score, the higher the risk.
                            decimal safeScore = nudity.GetProperty("safe").GetDecimal();
                            decimal nsfwRisk = 1.0m - safeScore;
                            if (nsfwRisk > maxRisk) maxRisk = nsfwRisk;
                        }

                        if (root.TryGetProperty("gore", out var gore))
                        {
                            decimal goreRisk = gore.GetProperty("prob").GetDecimal();
                            if (goreRisk > maxRisk) maxRisk = goreRisk;
                        }

                        if (root.TryGetProperty("weapon", out var weapon))
                        {
                            decimal weaponRisk = weapon.GetProperty("prob").GetDecimal();
                            if (weaponRisk > maxRisk) maxRisk = weaponRisk;
                        }

                        // Convert to 0-100% scale
                        return maxRisk * 100m;
                    }
                }
            }
            catch (Exception ex)
            {
                // Log exception
                Console.WriteLine($"Error moderating image: {ex.Message}");
            }

            // Fallback score if API fails or is not configured
            // Since it failed, we could return a high score to reject, or a gray score to pend review.
            // Returning 50 forces it into the Gray Zone (PENDING_REVIEW) for safety.
            return 50.00m;
        }

        public async Task<bool> DeleteImageAsync(string publicId)
        {
            var deletionParams = new DeletionParams(publicId);
            var result = await _cloudinary.DestroyAsync(deletionParams);
            return result.Result == "ok";
        }
    }
}
