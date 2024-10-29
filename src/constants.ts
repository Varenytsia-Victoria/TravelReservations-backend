const { Pool } = require('pg')
require('dotenv').config()

const authPool = new Pool({
	user: process.env.DB_USER,
	host: process.env.DB_HOST,
	database: process.env.AUTH_DB_NAME,
	password: process.env.DB_PASSWORD,
	port: process.env.DB_PORT || 5432,
})

const bookPool = new Pool({
	user: process.env.DB_USER,
	host: process.env.DB_HOST,
	database: process.env.BOOK_DB_NAME,
	password: process.env.DB_PASSWORD,
	port: process.env.DB_PORT || 5432,
})

const paymentPool = new Pool({
	user: process.env.DB_USER,
	host: process.env.DB_HOST,
	database: process.env.PAY_DB_NAME,
	password: process.env.DB_PASSWORD,
	port: process.env.DB_PORT || 5432,
})

module.exports = {authPool, bookPool, paymentPool}
