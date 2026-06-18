using Microsoft.AspNetCore.Http;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.Extensions.DependencyInjection;
using VenU.Api.Data;
using System.Text.Json;
using System;

namespace VenU.Api.Middlewares
{
    public class SuspensionCheckMiddleware
    {
        private readonly RequestDelegate _next;

        public SuspensionCheckMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            if (context.User.Identity?.IsAuthenticated == true)
            {
                var userIdClaim = context.User.Claims.FirstOrDefault(c =>
                    c.Type == ClaimTypes.NameIdentifier || c.Type == "sub")?.Value;

                if (Guid.TryParse(userIdClaim, out Guid userId))
                {
                    // Resolve DbContext using RequestServices because it's a scoped service
                    var dbContext = context.RequestServices.GetRequiredService<VenUDbContext>();
                    var user = await dbContext.Users.FindAsync(userId);

                    if (user != null && user.IsSuspended)
                    {
                        context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                        context.Response.ContentType = "application/json";
                        var result = JsonSerializer.Serialize(new { Message = "Your account has been suspended by an administrator." });
                        await context.Response.WriteAsync(result);
                        return; // Short-circuit the pipeline
                    }
                }
            }

            // Continue the pipeline
            await _next(context);
        }
    }
}
