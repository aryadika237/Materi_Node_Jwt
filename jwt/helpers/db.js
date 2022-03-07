const config = require('config.json');
const mysql = require('mysql2/promise');
const { Sequelize } = require('sequelize');

module.exports = db = {};

initialize();

async function initialize() {
    // Buat db jika belum ada
    const { host, port, user, password, database } = config.database;
    const connection = await mysql.createConnection({ host, port, user, password });
    await connection.query(`CREATE DATABASE IF NOT EXISTS\`${database}\`;`);

    // Sambungkan ke db
    const sequelize = new Sequelize(database, user, password, { dialect: 'mysql' });

    // Init model dan tambahkan ke object db yang diekspor
    db.User = require('..users/user.model')(sequelize);

    // Sinkronkan semua model dengan Database
    await sequelize.sync();
}