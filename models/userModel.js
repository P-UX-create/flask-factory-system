const db = require('../database/connection'); 

const UserModel = {

    async createUser({ username, email, passwordHash }) {
        const query = `
            INSERT INTO users ( username, email, password_hash)
            VALUES ($1, $2, $3)
            RETURNING id,  username, email, created_at;
        `;
        const values = [username, email, passwordHash];
        const result = await db.query(query, values);
        return result.rows[0];
    },

    async findByEmail(email) {
        const query = `SELECT * FROM users WHERE email = $1;`;
        const result = await db.query(query, [email]);
        return result.rows[0] || null;
    },

    async findById(id) {
        const query = `
            SELECT id, username, email, created_at 
            FROM users 
            WHERE id = $1;
        `;
        const result = await db.query(query, [id]);
        return result.rows[0] || null;
    },

    
    async updateName(id, name) {
        const query = `
            UPDATE users
            SET username = $2
            WHERE id = $1;
        `;
        const result = await db.query(query, [id, name]);
    },
    
    async updatePassword(newPasswordHash, id) {
        const query = `
            UPDATE users 
            SET password_hash = $1 
            WHERE id = $2;
        `;
        const result = await db.query(query, [newPasswordHash, id]);
        return result.rows[0];
    },

    async deleteAccount(id) {
        const query = `DELETE FROM users WHERE id = $1;`;
        const result = await db.query(query, [id]);
        return result.rowCount > 0;
    }
};

module.exports = UserModel;