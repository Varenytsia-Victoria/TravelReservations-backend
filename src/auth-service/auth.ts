import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import { createClient } from 'redis'
dotenv.config()

const pool = require('./database')
const client = createClient({
	url: 'redis://localhost:6379',
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

interface User {
	id: number
	email: string
	username: string
	password: string
}

app.post('/register', async (req: any, res: any) => {
	const { email, username, password }: User = req.body

	try {
		const saltRounds = 10
		const hashedPassword = await bcrypt.hash(password, saltRounds)

		const userExist = await pool.query(
			'SELECT * FROM users WHERE username = $1',
			[username]
		)

		if (userExist.rows.length > 0) {
			return res
				.status(400)
				.json({ status: false, message: 'User already registered' })
		}

		const token = jwt.sign({ username }, process.env.TOKEN || '', {
			expiresIn: '1h',
		})

		// Додавання нового користувача в базу даних
		const newUser = await pool.query(
			'INSERT INTO users (email, username, password) VALUES ($1, $2, $3) RETURNING id',
			[email, username, hashedPassword]
		)

		const userId = newUser.rows[0].id

		// Збереження токена в Redis
		await client.set(`auth:${userId}`, token, { EX: 3600 })

		res.status(200).json({ status: true, newUser: { email, username }, token })
	} catch (err: any) {
		console.error(err.message)
		res.status(400).json({ status: false, message: err.message })
	}
})

app.post('/login', async (req: any, res: any) => {
	const { username, password } = req.body

	try {
		const registeredUser = await pool.query(
			'SELECT * FROM users WHERE username = $1',
			[username]
		)

		if (registeredUser.rows.length === 0) {
			return res.status(400).json({ message: 'User not found' })
		}

		const isMatch = await bcrypt.compare(
			password,
			registeredUser.rows[0].password
		)
		if (isMatch) {
			const userId = registeredUser.rows[0].id
			const token = jwt.sign({ id: userId }, process.env.TOKEN || '', {
				expiresIn: '1h',
			})

			await client.set(`auth:${userId}`, token, { EX: 3600 })

			return res
				.status(200)
				.json({ status: true, message: 'Login successful', token })
		} else {
			return res.status(400).json({ message: 'Incorrect Password' })
		}
	} catch (err: any) {
		console.error(err.message)
		return res.status(500).json({ message: 'Server Error' })
	}
})

app.post('/logout', async (req: express.Request, res: express.Response) => {
	const { id } = req.body

	try {
		const result = await client.del(`auth:${id}`)
		if (result === 1) {
			res.json({ message: 'Logout successful' })
		} else {
			res.status(500).json({ message: 'Logout failed' })
		}
	} catch (err: any) {
		console.error(err.message)
		res.status(500).json({ message: 'Error logging out' })
	}
})

app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`)
})
