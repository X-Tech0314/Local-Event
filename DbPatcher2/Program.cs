using System;
using MySqlConnector;

namespace DbPatcher2
{
    class Program
    {
        static void Main(string[] args)
        {
            string connStr = "Server=venu-mysql-k4tan4fromph-72b9.e.aivencloud.com;Port=10285;Database=defaultdb;User=avnadmin;Password=AVNS_BCt3qWtQkssivvbcebc;SslMode=Required;";
            
            using (var conn = new MySqlConnection(connStr))
            {
                conn.Open();
                Console.WriteLine("Connected to MySQL.");

                string jsonImages = "[\"https://res.cloudinary.com/ditxaqwu6/image/upload/v1781709664/jnnxlfdwihffrvn0mg7v.jpg\", \"/venues/bldg2.png\", \"/venues/bldg3.png\"]";
                
                string sql = "UPDATE Venues SET VenueImages = @images WHERE Name LIKE '%BRAZA%'";
                using (var cmd = new MySqlCommand(sql, conn))
                {
                    cmd.Parameters.AddWithValue("@images", jsonImages);
                    int rows = cmd.ExecuteNonQuery();
                    Console.WriteLine($"Rows affected: {rows}");
                }
            }
        }
    }
}
