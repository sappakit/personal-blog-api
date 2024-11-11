import * as pg from "pg";
const { Pool } = pg.default;
import "dotenv/config";

const pool = new Pool({
  connectionString: process.env.CONNECTION_STRING,
});

export { pool };
