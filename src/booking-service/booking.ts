import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import { createClient } from 'redis'
import AuthRouter from '../auth-service/auth'
import { Pool } from 'pg'

dotenv.config()

const { PORT = 3000, REDIS_URL, TOKEN_SECRET } = process.env

const bookPool = new Pool({
	connectionString: process.env.DATABASE_URL,
})

const client = createClient({ url: REDIS_URL })
client.connect().catch(err => console.error('Redis connection failed:', err))
client.on('error', err => console.error('Redis error:', err))
client.on('connect', () => console.log('Connected to Redis'))

const route = express.Router()
route.use(express.json())
route.use('/login', AuthRouter)

const sendResponse = (res:any, status:number, message:string, data = null) => {
	res.status(status).json({ status, message, data })
}

const authToken = (req:any, res:any, next:any) => {
	const authHeader = req.headers['authorization']
	const token = authHeader && authHeader.split(' ')[1]

	if (!token) {
		return sendResponse(res, 401, 'No token provided')
	}

	jwt.verify(token, TOKEN_SECRET || '', (err:any, user:any) => {
		if (err) {
			return sendResponse(res, 403, 'Invalid token')
		}
		req.user = user
		next()
	})
}

const cacheResponse = async (key:any, fetchFunction:any, res:any) => {
	try {
		const cachedData = await client.get(key)
		if (cachedData) {
			return sendResponse(res, 200, 'Success', JSON.parse(cachedData))
		}
		const data = await fetchFunction()
		client.setEx(key, 600, JSON.stringify(data))
		sendResponse(res, 200, 'Success', data)
	} catch (err) {
		console.error(err)
		sendResponse(res, 500, 'Server error')
	}
}


route.get('/hotels', async (req, res) => {
	await cacheResponse(
		'hotels',
		async () => {
			const result = await bookPool.query('SELECT * FROM hotels')
			return result.rows
		},
		res
	)
})

route.get('/hotels/:id', async (req, res) => {
	const { id } = req.params
	await cacheResponse(
		`hotel:${id}`,
		async () => {
			const result = await bookPool.query(
				'SELECT * FROM hotels WHERE id = $1',
				[id]
			)
			return result.rows[0] || null
		},
		res
	)
})

route.get('/cars', async (req, res) => {
	await cacheResponse(
		'cars',
		async () => {
			const result = await bookPool.query('SELECT * FROM cars')
			return result.rows
		},
		res
	)
})

route.get('/cars/:id', async (req, res) => {
	const { id } = req.params
	await cacheResponse(
		`car:${id}`,
		async () => {
			const result = await bookPool.query('SELECT * FROM cars WHERE id = $1', [
				id,
			])
			return result.rows[0] || null
		},
		res
	)
})

route.get('/flights', async (req, res) => {
	await cacheResponse(
		'flights',
		async () => {
			const result = await bookPool.query('SELECT * FROM flights')
			return result.rows
		},
		res
	)
})

route.get('/flights/:id', async (req, res) => {
	const { id } = req.params
	await cacheResponse(
		`flight:${id}`,
		async () => {
			const result = await bookPool.query(
				'SELECT * FROM flights WHERE id = $1',
				[id]
			)
			return result.rows[0] || null
		},
		res
	)
})

// Bookings routes
route.get('/bookings', authToken, async (req, res) => {
	await cacheResponse(
		'bookings',
		async () => {
			const result = await bookPool.query('SELECT * FROM bookings')
			return result.rows
		},
		res
	)
})

route.get('/bookings/:type', authToken, async (req, res) => {
	const { type } = req.params
	await cacheResponse(
		`bookings:${type}`,
		async () => {
			const result = await bookPool.query(
				'SELECT * FROM bookings WHERE type = $1',
				[type]
			)
			return result.rows
		},
		res
	)
})

export default route
