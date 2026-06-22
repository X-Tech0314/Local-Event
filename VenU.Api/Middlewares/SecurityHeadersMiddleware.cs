using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;

namespace VenU.Api.Middlewares
{
    public class SecurityHeadersMiddleware
    {
        private readonly RequestDelegate _next;

        public SecurityHeadersMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            // Add security headers to the response
            if (!context.Response.Headers.ContainsKey("X-Content-Type-Options"))
            {
                context.Response.Headers.Append("X-Content-Type-Options", "nosniff");
            }

            if (!context.Response.Headers.ContainsKey("X-Frame-Options"))
            {
                context.Response.Headers.Append("X-Frame-Options", "DENY");
            }

            if (!context.Response.Headers.ContainsKey("X-XSS-Protection"))
            {
                context.Response.Headers.Append("X-XSS-Protection", "1; mode=block");
            }

            if (!context.Response.Headers.ContainsKey("Referrer-Policy"))
            {
                context.Response.Headers.Append("Referrer-Policy", "strict-origin-when-cross-origin");
            }

            // We don't apply a strict CSP here for all APIs because it's an API. 
            // The frontend app (served via Vercel) will have its own CSP.
            // But we can add a basic one for any HTML errors returned by the API.
            if (!context.Response.Headers.ContainsKey("Content-Security-Policy"))
            {
                context.Response.Headers.Append("Content-Security-Policy", "default-src 'self'; frame-ancestors 'none';");
            }

            await _next(context);
        }
    }
}
