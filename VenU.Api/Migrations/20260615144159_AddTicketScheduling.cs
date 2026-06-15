using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VenU.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddTicketScheduling : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ValidityScope",
                table: "EventTicketTiers",
                type: "varchar(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "")
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<DateTime>(
                name: "TicketSalesEnd",
                table: "Events",
                type: "datetime(6)",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<DateTime>(
                name: "TicketSalesStart",
                table: "Events",
                type: "datetime(6)",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ValidityScope",
                table: "EventTicketTiers");

            migrationBuilder.DropColumn(
                name: "TicketSalesEnd",
                table: "Events");

            migrationBuilder.DropColumn(
                name: "TicketSalesStart",
                table: "Events");
        }
    }
}
