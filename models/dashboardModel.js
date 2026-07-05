const db = require("../database/connection"); // Adjust path as needed

const DashboardModel = {

  async getDashboardData() {

    const [brands, trends] = await Promise.all([

        db.query(`
        SELECT b.id, b.name, b.created_at as "createdAt", 
               COUNT(p.id)::int as "productCount"
        FROM brands b
        LEFT JOIN products p ON p.brand_id = b.id
        GROUP BY b.id
        ORDER BY "productCount" DESC
      `),
      
      db.query(`
        SELECT p.name as "product", 
               DATE_TRUNC('month', p.created_at) as "date", 
               SUM(p.stock) as "qty"
        FROM products p
        WHERE p.created_at >= NOW() - INTERVAL '6 months'
        GROUP BY 1, 2
        ORDER BY 2 ASC
      `)
    ]);

    return {
      brands: brands.rows,
      trends: trends.rows
    };
  }
};

module.exports = DashboardModel;