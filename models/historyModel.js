const db = require('../database/connection'); // Assuming you have a pool/client export

const HistoryModel = {
  // Fetch history for a user within a specific timeframe (max 30 days)
  async getRecent(userId, days) {
    const limitDays = Math.min(days, 30);
    const query = `
      SELECT * FROM history 
      WHERE user_id = $1 
      AND created_at >= NOW() - ($2 || ' days')::interval
      ORDER BY created_at DESC
      LIMIT 50;
    `;
    const { rows } = await db.query(query, [userId, limitDays]);
    return rows;
  },

  // Log a new activity
  async createLog(userId, action, targetSubject) {
    const query = `
      INSERT INTO history (user_id, action, target_subject)
      VALUES ($1, $2, $3)
      RETURNING *;
    `;
    const { rows } = await db.query(query, [userId, action, targetSubject]);
    return rows[0];
  }
};

module.exports = HistoryModel;