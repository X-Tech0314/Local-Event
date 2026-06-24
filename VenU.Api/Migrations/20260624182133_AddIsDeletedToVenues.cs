using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VenU.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddIsDeletedToVenues : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "Venues",
                type: "tinyint(1)",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "Venues");
        }
    }
}
