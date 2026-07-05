require("dotenv").config();
const db = require('./database/connection'); 

// Load migrations
const runMigration = require("./migrations");
const { resetTokens } = require("./stores/tokenStore");

const migrations = require
const app = require("./app");
const PORT = process.env.PORT || 3000;
const cron = require('node-cron');

setInterval(() => {
    const now = Date.now();

    for (const [token, data] of resetTokens.entries()) {
        if (data.expiresAt < now) {
            resetTokens.delete(token);
        }
    }
}, 60 * 1000); // every minute

cron.schedule('0 0 * * *', async () => {
   await db.query("DELETE FROM history WHERE created_at < NOW() - INTERVAL '30 days'");
});

app.listen(PORT, async() => {
  await runMigration();
  console.log("Server running on port:", PORT);
});
