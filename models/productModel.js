const db = require('../database/connection');

const ProductModel = {

    async create({ brand_id, name, category, stock = 0 }) {
        const query = `
            INSERT INTO products (brand_id, name, category, stock)
            VALUES ($1, $2, $3, $4)
            RETURNING *;
        `;

        const result = await db.query(query, [
            brand_id,
            name,
            category,
            stock
        ]);

        return result.rows[0];
    },

    async getAll(userId) {
  const query = `
    SELECT
      p.*,
      b.name AS brand_name
    FROM products p
    JOIN brands b
      ON b.id = p.brand_id
    WHERE b.user_id = $1
    ORDER BY p.updated_at DESC;
  `;

  const result = await db.query(query, [userId]);
  return result.rows;
},

    async findById(id) {
        const query = `
            SELECT
                p.*,
                b.name AS brand_name
            FROM products p
            LEFT JOIN brands b
                ON b.id = p.brand_id
            WHERE p.id = $1;
        `;

        const result = await db.query(query, [id]);

        return result.rows[0] || null;
    },

    async update(id, updates) {
        const allowedFields = [
           'stock'
        ];

        const set = [];
        const values = [];
        let index = 1;

        for (const [key, value] of Object.entries(updates)) {
            if (allowedFields.includes(key)) {
                set.push(`${key} = $${index++}`);
                values.push(value);
            }
        }

        if (!set.length) {
            throw new Error('No valid fields provided.');
        }

        set.push('updated_at = NOW()');

        values.push(id);

        const query = `
            UPDATE products
            SET ${set.join(', ')}
            WHERE id = $${index}
            RETURNING *;
        `;

        const result = await db.query(query, values);

        return result.rows[0] || null;
    },

    async remove(id) {
        const result = await db.query(
            `DELETE FROM products WHERE id = $1 RETURNING *`,
            [id]
        );

        return result.rows[0];
    }
};

module.exports = ProductModel;