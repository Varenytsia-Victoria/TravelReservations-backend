import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import { createClient } from 'redis'
dotenv.config()

const bookPool = require('../constants')
const client = createClient({
	url: process.env.REDIS_URL,
})

client.connect().catch(err => console.error('Redis connection failed', err))

client.on('error', (err: Error) => {
	console.error(`Error connecting to Redis: ${err}`)
})

client.on('connect', () => {
	console.log('Connected to Redis')
})

const app = express()
const PORT = process.env.PORT || 3000

app.use(express.json())

//-------------------   HOTELS ROUTES ------------------------------
app.get('/hotels', async (req: any, res: any) => {
	try {
		const cachedHotels = await client.get('hotels')
		if (cachedHotels) {
			return res.json(JSON.parse(cachedHotels))
		}
		const result = await bookPool.query('SELECT * FROM hotels')
		const hotels = result.rows
		client.setEx('hotels', 600, JSON.stringify(hotels))
	} catch (err: any) {
		console.error(err)
		res.status(500).json({ message: 'Server error' })
	}
})

app.get('/hotels/{id}', async (req: any, res: any) => {
	const { id } = req.params
	try {
		const cachedHotel = await client.get('hotel:${id}')
		if (cachedHotel) {
			return res.json(JSON.parse(cachedHotel))
		}
		const result = await bookPool.query('SELECT * FROM hotel WHERE id=$1', [id])
		const hotel = result.rows[0]

		if (!hotel) {
			return res.status(404).json({ status: false, message: 'Hotel not found' })
		}

		client.setEx(`hotels:${id}`, 600, JSON.stringify(hotel))
	} catch (err: any) {
		res.status(500).json({ status: false, message: 'Server error' })
	}
})

//-------------------   CARS ROUTES ------------------------------

app.get('/cars', async (req: any, res: any) => {
	try {
		const cachedCars = await client.get('cars')
		if (cachedCars) {
			return res.json(JSON.parse(cachedCars))
		}
		const result = await bookPool.query('SELECT * FROM cars')
		const cars = result.rows

		if (!cars) {
			res.status(404).json({ message: 'No cars found', status: false })
		}
		client.setEx('cars', 600, JSON.stringify(cars))
	} catch (err: any) {
		res.status(500).json({ message: 'Server error', status: false })
	}
})

app.get('/cars/{id}', async (req: any, res: any) => {
	try {
		const id = req.params
		const cachedCar = await client.get(`car:${id}`)
		if (cachedCar) {
			return res.json(JSON.parse(cachedCar))
		}
		const result = await bookPool.query('SELECT * FROM car WHERE id=$id', [id])
		const car = result

		client.setEx(`car:${id}`, 600, JSON.stringify(car))
	} catch (err: any) {
		res.status(500).json({ message: 'Server error', status: false })
	}
})

//-------------------   FLIGHTS ROUTES ------------------------------

app.get('/flights', async (req: any, res: any) => {
	try {
		const cachedCars = await client.get('cars')
		if (cachedCars) {
			return res.json(JSON.parse(cachedCars))
		}
		const result = await bookPool.query('SELECT * FROM cars')
		const cars = result.rows

		if (!cars) {
			res.status(404).json({ message: 'No cars found', status: false })
		}
		client.setEx('cars', 600, JSON.stringify(cars))
	} catch (err: any) {
		res.status(500).json({ message: 'Server error', status: false })
	}
})

app.get('/flights/{id}', async (req: any, res: any) => {
	try {
		const id = req.params
		const cachedFlights = await client.get(`flights:${id}`)
		if (cachedFlights) {
			return res.json(JSON.parse(cachedFlights))
		}
		const result = await bookPool.query('SELECT * FROM flights WHERE id=$id', [
			id,
		])
		const flights = result

		client.setEx(`flights:${id}`, 600, JSON.stringify(flights))
	} catch (err: any) {
		res.status(500).json({ message: 'Server error', status: false })
	}
})

//-------------------   BOOKING ROUTES ------------------------------

app.get('/bookings', async (req: any, res: any) => {
	try {
		const cachedBookings = await client.get('bookings')
		if (cachedBookings) {
			return res.json(JSON.parse(cachedBookings))
		}
		const result = await bookPool.query('SELECT * FROM bookings')
		const bookings = result.rows

		if (!bookings) {
			res.status(404).json({ message: 'No bookings found', status: false })
		}
		client.setEx('bookings', 600, JSON.stringify(bookings))
	} catch (err: any) {
		res.status(500).json({ message: 'Server error', status: false })
	}
})

app.get('/bookings/{type}', async (req: any, res: any) => {
	try {
		const type = req.params
		const cachedBookings = await client.get(`bookings:${type}`)
		if (cachedBookings) {
			return res.json(JSON.parse(cachedBookings))
		}
		const result = await bookPool.query(
			'SELECT * FROM bookings WHERE type=$1',
			[type]
		)
		const bookings = result.rows
		client.setEx('bookings', 600, JSON.stringify(bookings))
	} catch (err: any) {}
})

app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`)
})
