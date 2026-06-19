# 1. Use the official .NET SDK image to build the app
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy the project file and restore dependencies
COPY ["VenU.Api.csproj", "./"]
RUN dotnet restore "VenU.Api.csproj"

# Copy everything within VenU.Api (including VenUDbContext, Models, DTOs, etc.)
COPY . .

# Compile and publish release artifacts
RUN dotnet publish "VenU.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

# 2. Build runtime image
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .

# Render dynamically assigns a port via the PORT environment variable
ENV ASPNETCORE_URLS=http://+:10000
EXPOSE 10000

ENTRYPOINT ["dotnet", "VenU.Api.dll"]