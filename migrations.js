// MODULE TO PROCESS DB MIGRATIONS


const fs = require("fs");
const path = require("path");
const pool = require("./database/connection");

const migrationDir = path.join(__dirname, "database", "migrations");
const sqlFiles = fs.readdirSync(migrationDir).sort();

module.exports = async()=>{

    try {
        await pool.query(`
          CREATE TABLE IF NOT EXISTS migrations(
          id SERIAL PRIMARY KEY,
          name VARCHAR UNIQUE NOT NULL,
          created_at TIMESTAMP DEFAULT NOW()
          )  
            `)
for (let file of sqlFiles){

    const { rows } = await pool.query(`
        SELECT id FROM migrations
        WHERE name = $1
        `, 
    [file]
);

if (rows.length > 0){
    console.log("Skipping File:", file);
    continue;
}

const sql = fs.readFileSync(path.join(migrationDir, file), "utf8");
await pool.query(sql);
await pool.query(`
    INSERT INTO migrations(name)
    VALUES($1)
    `,
    [file]
)

console.log(`Successfully ran file: ${file}`)
}
    } catch (error) {
        console.error("Error in migrate.js:", error.message);
    }
}