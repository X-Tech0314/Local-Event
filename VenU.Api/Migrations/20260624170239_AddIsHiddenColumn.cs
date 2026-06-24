using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VenU.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddIsHiddenColumn : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsHidden",
                table: "Venues",
                type: "tinyint(1)",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsHidden",
                table: "Venues");
        }
    }
}
