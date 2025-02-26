const { Pool } = require("pg");
require("dotenv").config();

class Database {
  constructor() {
    this.pool = new Pool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT,
    });

    // optional: log when connection is established
    this.pool.on("connect", () => console.log("Connected to PSQL db"));
  }
}
