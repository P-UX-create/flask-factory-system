const { getDashboardData } = require('../models/dashboardModel');
const { findById } = require('../models/userModel');

const DashboardController = {
  async getDashboard(req, res) {
    try {
      const [data, rawUser] = await Promise.all([
        getDashboardData(),
        findById(req.user.id),
      ]);

      if (!rawUser) {
        return res.status(404).json({ message: 'User not found.' });
      }

      // Strip sensitive fields before sending to client — never send password_hash
      const user = {
        id:         rawUser.id,
        username:   rawUser.username,
        email:      rawUser.email,
        created_at: rawUser.created_at,
      };

      res.status(200).json({ ...data, user });

    } catch (error) {
      console.error('Dashboard Controller Error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while loading dashboard.',
      });
    }
  },
};

module.exports = DashboardController;