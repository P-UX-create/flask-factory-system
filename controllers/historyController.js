const {
  getRecent
} = require('../models/historyModel');

const HistoryController = {
  async getHistory(req, res) {
    try {
      const user = req.user; 

      const days = parseInt(req.query.days) || 7;

      const validatedDays = Math.min(Math.max(days, 1), 30);

      const history = await getRecent(user.id, validatedDays);
      res.json(history);
    } catch (error) {
      console.error('History Fetch Error:', error);
      res.status(500).json({ error: 'Failed to retrieve history' });
    }
  }
};

module.exports = HistoryController;