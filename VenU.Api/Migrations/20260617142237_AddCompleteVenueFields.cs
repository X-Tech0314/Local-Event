using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VenU.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddCompleteVenueFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "ZipCode",
                table: "Venues",
                type: "varchar(20)",
                maxLength: 20,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "varchar(20)",
                oldMaxLength: 20)
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AlterColumn<string>(
                name: "StreetAddress",
                table: "Venues",
                type: "varchar(255)",
                maxLength: 255,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "varchar(255)",
                oldMaxLength: 255)
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AlterColumn<string>(
                name: "Region",
                table: "Venues",
                type: "varchar(50)",
                maxLength: 50,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "varchar(50)",
                oldMaxLength: 50)
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AlterColumn<string>(
                name: "Province",
                table: "Venues",
                type: "varchar(100)",
                maxLength: 100,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "varchar(100)",
                oldMaxLength: 100)
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AlterColumn<string>(
                name: "City",
                table: "Venues",
                type: "varchar(100)",
                maxLength: 100,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "varchar(100)",
                oldMaxLength: 100)
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AlterColumn<string>(
                name: "Barangay",
                table: "Venues",
                type: "varchar(100)",
                maxLength: 100,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "varchar(100)",
                oldMaxLength: 100)
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "BusinessPermitNumber",
                table: "Venues",
                type: "varchar(100)",
                maxLength: 100,
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<int>(
                name: "CapacityBanquet",
                table: "Venues",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "CapacityStanding",
                table: "Venues",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "CapacityTheater",
                table: "Venues",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<decimal>(
                name: "CeilingHeight",
                table: "Venues",
                type: "decimal(5,2)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Email",
                table: "Venues",
                type: "varchar(100)",
                maxLength: 100,
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<decimal>(
                name: "FloorArea",
                table: "Venues",
                type: "decimal(10,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<string>(
                name: "FloorPlanUrl",
                table: "Venues",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "FsicNumber",
                table: "Venues",
                type: "varchar(100)",
                maxLength: 100,
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<bool>(
                name: "HasAircon",
                table: "Venues",
                type: "tinyint(1)",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "HasBackupGenerator",
                table: "Venues",
                type: "tinyint(1)",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "HasBirForm2303",
                table: "Venues",
                type: "tinyint(1)",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "HasFireExits",
                table: "Venues",
                type: "tinyint(1)",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "HasHoldingRooms",
                table: "Venues",
                type: "tinyint(1)",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "HasSmokeDetectors",
                table: "Venues",
                type: "tinyint(1)",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "HasSoundSystem",
                table: "Venues",
                type: "tinyint(1)",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "Landline",
                table: "Venues",
                type: "varchar(20)",
                maxLength: 20,
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "Landmarks",
                table: "Venues",
                type: "varchar(255)",
                maxLength: 255,
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "LegalPermitsUrl",
                table: "Venues",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "MobileNumber",
                table: "Venues",
                type: "varchar(20)",
                maxLength: 20,
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "OperatingHours",
                table: "Venues",
                type: "varchar(100)",
                maxLength: 100,
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<int>(
                name: "ParkingSlots",
                table: "Venues",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "RepresentativeName",
                table: "Venues",
                type: "varchar(100)",
                maxLength: 100,
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "WebsiteUrl",
                table: "Venues",
                type: "varchar(255)",
                maxLength: 255,
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "BusinessPermitNumber",
                table: "Venues");

            migrationBuilder.DropColumn(
                name: "CapacityBanquet",
                table: "Venues");

            migrationBuilder.DropColumn(
                name: "CapacityStanding",
                table: "Venues");

            migrationBuilder.DropColumn(
                name: "CapacityTheater",
                table: "Venues");

            migrationBuilder.DropColumn(
                name: "CeilingHeight",
                table: "Venues");

            migrationBuilder.DropColumn(
                name: "Email",
                table: "Venues");

            migrationBuilder.DropColumn(
                name: "FloorArea",
                table: "Venues");

            migrationBuilder.DropColumn(
                name: "FloorPlanUrl",
                table: "Venues");

            migrationBuilder.DropColumn(
                name: "FsicNumber",
                table: "Venues");

            migrationBuilder.DropColumn(
                name: "HasAircon",
                table: "Venues");

            migrationBuilder.DropColumn(
                name: "HasBackupGenerator",
                table: "Venues");

            migrationBuilder.DropColumn(
                name: "HasBirForm2303",
                table: "Venues");

            migrationBuilder.DropColumn(
                name: "HasFireExits",
                table: "Venues");

            migrationBuilder.DropColumn(
                name: "HasHoldingRooms",
                table: "Venues");

            migrationBuilder.DropColumn(
                name: "HasSmokeDetectors",
                table: "Venues");

            migrationBuilder.DropColumn(
                name: "HasSoundSystem",
                table: "Venues");

            migrationBuilder.DropColumn(
                name: "Landline",
                table: "Venues");

            migrationBuilder.DropColumn(
                name: "Landmarks",
                table: "Venues");

            migrationBuilder.DropColumn(
                name: "LegalPermitsUrl",
                table: "Venues");

            migrationBuilder.DropColumn(
                name: "MobileNumber",
                table: "Venues");

            migrationBuilder.DropColumn(
                name: "OperatingHours",
                table: "Venues");

            migrationBuilder.DropColumn(
                name: "ParkingSlots",
                table: "Venues");

            migrationBuilder.DropColumn(
                name: "RepresentativeName",
                table: "Venues");

            migrationBuilder.DropColumn(
                name: "WebsiteUrl",
                table: "Venues");

            migrationBuilder.UpdateData(
                table: "Venues",
                keyColumn: "ZipCode",
                keyValue: null,
                column: "ZipCode",
                value: "");

            migrationBuilder.AlterColumn<string>(
                name: "ZipCode",
                table: "Venues",
                type: "varchar(20)",
                maxLength: 20,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "varchar(20)",
                oldMaxLength: 20,
                oldNullable: true)
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.UpdateData(
                table: "Venues",
                keyColumn: "StreetAddress",
                keyValue: null,
                column: "StreetAddress",
                value: "");

            migrationBuilder.AlterColumn<string>(
                name: "StreetAddress",
                table: "Venues",
                type: "varchar(255)",
                maxLength: 255,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "varchar(255)",
                oldMaxLength: 255,
                oldNullable: true)
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.UpdateData(
                table: "Venues",
                keyColumn: "Region",
                keyValue: null,
                column: "Region",
                value: "");

            migrationBuilder.AlterColumn<string>(
                name: "Region",
                table: "Venues",
                type: "varchar(50)",
                maxLength: 50,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "varchar(50)",
                oldMaxLength: 50,
                oldNullable: true)
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.UpdateData(
                table: "Venues",
                keyColumn: "Province",
                keyValue: null,
                column: "Province",
                value: "");

            migrationBuilder.AlterColumn<string>(
                name: "Province",
                table: "Venues",
                type: "varchar(100)",
                maxLength: 100,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "varchar(100)",
                oldMaxLength: 100,
                oldNullable: true)
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.UpdateData(
                table: "Venues",
                keyColumn: "City",
                keyValue: null,
                column: "City",
                value: "");

            migrationBuilder.AlterColumn<string>(
                name: "City",
                table: "Venues",
                type: "varchar(100)",
                maxLength: 100,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "varchar(100)",
                oldMaxLength: 100,
                oldNullable: true)
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.UpdateData(
                table: "Venues",
                keyColumn: "Barangay",
                keyValue: null,
                column: "Barangay",
                value: "");

            migrationBuilder.AlterColumn<string>(
                name: "Barangay",
                table: "Venues",
                type: "varchar(100)",
                maxLength: 100,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "varchar(100)",
                oldMaxLength: 100,
                oldNullable: true)
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4");
        }
    }
}
