import * as pg from "pg";
const { Pool } = pg.default;

const pool = new Pool({
  connectionString:
    "postgresql://postgres:FQhzQ7wbRY4pNQm@localhost:5432/sappakit_personal_blog_database",
});

export { pool };
