using Microsoft.AspNetCore.SignalR;
using VenU.Api.Hubs;
using VenU.Api.Models;
using VenU.Api.Data;
using Microsoft.EntityFrameworkCore;

namespace VenU.Api.Services
{
    public interface INotificationService
    {
        Task SendNotificationAsync(Guid userId, string title, string message, bool sendEmail = false);
    }

    public class NotificationService : INotificationService
    {
        private readonly VenUDbContext _context;
        private readonly IHubContext<NotificationHub> _hubContext;
        private readonly IEmailService _emailService;

        public NotificationService(VenUDbContext context, IHubContext<NotificationHub> hubContext, IEmailService emailService)
        {
            _context = context;
            _hubContext = hubContext;
            _emailService = emailService;
        }

        public async Task SendNotificationAsync(Guid userId, string title, string message, bool sendEmail = false)
        {
            // 1. Save to DB
            var notification = new Notification
            {
                UserId = userId,
                Title = title,
                Message = message,
                IsRead = false,
                CreatedAt = DateTime.UtcNow
            };
            _context.Notifications.Add(notification);
            await _context.SaveChangesAsync();

            // 2. Real-Time SignalR Push
            var payload = new
            {
                id = notification.Id,
                title = notification.Title,
                message = notification.Message,
                read = notification.IsRead, // matches frontend property name
                time = "Just now",
                createdAt = notification.CreatedAt
            };
            await _hubContext.Clients.Group(userId.ToString()).SendAsync("ReceiveNotification", payload);

            // 3. Optional Email Notification
            if (sendEmail)
            {
                var user = await _context.Users.FindAsync(userId);
                if (user != null && !string.IsNullOrEmpty(user.Email))
                {
                    var htmlBody = $@"
                        <div style='font-family: sans-serif; padding: 20px; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px;'>
                            <h2 style='color: #7c3aed;'>{title}</h2>
                            <p style='font-size: 16px; line-height: 1.5;'>{message}</p>
                            <hr style='border: 0; border-top: 1px solid #eee; margin: 20px 0;'/>
                            <p style='font-size: 12px; color: #777;'>This is an automated notification from VenU. Please do not reply directly to this email.</p>
                        </div>";
                    await _emailService.SendEmailAsync(user.Email, title, htmlBody);
                }
            }
        }
    }
}
