const db = require('../database/connection'); 

const BrandModel = {
    
    async create({ name, userId }) {
        const query = `
          INSERT INTO brands (name, user_id)
VALUES ($1, $2)
RETURNING
    id,
    name,
    created_at AS "createdAt";
        `;
        const result = await db.query(query, [name, userId]);
        return result.rows[0];
    },
    
   async update({ id, name, userId }) {
    const query = `
        UPDATE brands
        SET name = $1
        WHERE id = $2
        AND user_id = $3
        RETURNING *;
    `;

    const result = await db.query(query, [
        name,
        id,
        userId
    ]);

    return result.rows[0];
},

  
    async displayBrands(userId) {
    const query = `
        SELECT
            b.id,
            b.name,
            COUNT(p.id)::INTEGER AS "productCount",
            b.created_at AS "createdAt"
        FROM brands b
        LEFT JOIN products p
            ON b.id = p.brand_id
        WHERE b.user_id = $1
        GROUP BY b.id
        ORDER BY b.created_at DESC;
    `;

    const result = await db.query(query, [userId]);
    return result.rows;
},

async deleteBrands(id, userId) {
    const query = `
        DELETE FROM brands
        WHERE id = $1
        AND user_id = $2
        RETURNING *;
    `;

    const result = await db.query(query, [
        id,
        userId
    ]);

    return result.rows[0];
},

};

module.exports = BrandModel;