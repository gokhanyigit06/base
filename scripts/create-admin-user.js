const { Client } = require('pg');
const bcrypt = require('bcryptjs');

// Connection string matching docker-compose.yml (port 5454)
const connectionString = 'postgres://postgres:mysecretpassword@localhost:5454/agency_site';

const client = new Client({
    connectionString,
});

async function run() {
    try {
        await client.connect();
        const email = 'admin';
        const password = 'admin'; // Default password
        const hashedPassword = await bcrypt.hash(password, 10);

        console.log(`Hashing password for user: ${email}`);

        const query = `
      INSERT INTO admin_users (email, password_hash)
      VALUES ($1, $2)
      ON CONFLICT (email) 
      DO UPDATE SET password_hash = $2
      RETURNING *;
    `;

        const res = await client.query(query, [email, hashedPassword]);
        console.log('Admin user updated:', res.rows[0]);

    } catch (err) {
        console.error('Error creating admin user:', err);
    } finally {
        await client.end();
    }
}

run();
