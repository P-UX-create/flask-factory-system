const { Pool } = require("pg");

const pool = new Pool({
    connectionString: process.env.CONNECTION_STRING,
    connectionTimeoutMillis: 30000,
    idleTimeoutMillis: 20000,
    max: 10
})

pool.on("connect", ()=> console.log("Sql connected"));
pool.on("error", (e)=> console.error("Error connecting database", e.message));

module.exports = pool;
