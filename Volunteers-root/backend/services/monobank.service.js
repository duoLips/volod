const axios = require('axios');
const db = require('../models/db');

const MONOBANK_API = 'https://api.monobank.ua/personal/client-info';
const MONOBANK_TOKEN = process.env.MONOBANK_TOKEN;
async function fetchJarsFromMonobank() {
    const { data } = await axios.get(MONOBANK_API, {
        headers: { 'X-Token': MONOBANK_TOKEN }
    });

    return data.jars.map(jar => ({
        id: jar.id,
        title: jar.title,
        description: jar.description || '',
        balance: jar.balance,
        goal: jar.goal,
        send_id: jar.sendId.replace('jar/', '')
    }));
}

async function updateJarsInDB() {
    const jars = await fetchJarsFromMonobank();

    const promises = jars.map(jar => db.query(`
        INSERT INTO jars (id, title, description, balance, goal, send_id, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, NOW())
        ON CONFLICT (id) DO UPDATE SET
            title = EXCLUDED.title,
            description = EXCLUDED.description,
            balance = EXCLUDED.balance,
            goal = EXCLUDED.goal,
            send_id = EXCLUDED.send_id,
            updated_at = NOW()
    `, [jar.id, jar.title, jar.description, jar.balance, jar.goal, jar.send_id]));

    await Promise.all(promises);
    return jars.length;
}

async function getAllJarsFromDB() {
    const { rows } = await db.query(`SELECT * FROM jars ORDER BY title`);
    return rows;
}

module.exports = {
    fetchJarsFromMonobank,
    updateJarsInDB,
    getAllJarsFromDB
};