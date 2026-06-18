using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VenU.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddUserStatusAndNameFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
// migrationBuilder.DropColumn(
//     name: "IsSuspended",
//     table: "Users");

//             migrationBuilder.AddColumn<string>(
//                 name: "Status",
//                 table: "Users",
//                 type: "varchar(20)",
//                 maxLength: 20,
//                 nullable: false,
//                 defaultValue: "")
//                 .Annotation("MySql:CharSet", "utf8mb4");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Status",
                table: "Users");

            migrationBuilder.AddColumn<bool>(
                name: "IsSuspended",
                table: "Users",
                type: "tinyint(1)",
                nullable: false,
                defaultValue: false);
        }
    }
}
