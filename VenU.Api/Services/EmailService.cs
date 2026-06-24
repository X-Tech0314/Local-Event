using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System.Net.Http.Headers;
using System.Text.Json;
using System.Text;

namespace VenU.Api.Services
{
    public interface IEmailService
    {
        Task SendEmailAsync(string toEmail, string subject, string body);
    }

    public class EmailService : IEmailService
    {
        private readonly HttpClient _httpClient;
        private readonly IConfiguration _config;
        private readonly ILogger<EmailService> _logger;

        public EmailService(HttpClient httpClient, IConfiguration config, ILogger<EmailService> logger)
        {
            _httpClient = httpClient;
            _config = config;
            _logger = logger;
        }

        public async Task SendEmailAsync(string toEmail, string subject, string body)
        {
            var apiKey = _config["Resend:ApiKey"] ?? Environment.GetEnvironmentVariable("RESEND_API_KEY");
            var fromEmail = _config["Resend:FromEmail"] ?? "onboarding@resend.dev";

            if (string.IsNullOrEmpty(apiKey) || apiKey.StartsWith("your_") || apiKey.Contains("placeholder"))
            {
                _logger.LogWarning("EMAIL SERVICE [FALLBACK]: Resend API key is not configured or is set to placeholder. Email not sent.");
                _logger.LogInformation("\n--- Mock Email Dispatch ---\nTo: {ToEmail}\nSubject: {Subject}\nBody:\n{Body}\n-------------------------", toEmail, subject, body);
                return;
            }

            try
            {
                var payload = new
                {
                    from = $"VenU Alerts <{fromEmail}>",
                    to = new[] { toEmail },
                    subject = subject,
                    html = body
                };

                var request = new HttpRequestMessage(HttpMethod.Post, "https://api.resend.com/emails");
                request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);
                request.Content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");

                var response = await _httpClient.SendAsync(request);
                if (response.IsSuccessStatusCode)
                {
                    _logger.LogInformation("Email sent successfully to {ToEmail}", toEmail);
                }
                else
                {
                    var responseContent = await response.Content.ReadAsStringAsync();
                    _logger.LogError("Failed to send email to {ToEmail}. Status: {StatusCode}, Details: {Details}", toEmail, response.StatusCode, responseContent);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while sending email to {ToEmail}", toEmail);
            }
        }
    }
}
