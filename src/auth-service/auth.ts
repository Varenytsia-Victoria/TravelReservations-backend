import express, { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
const pool = require('./database') 

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

app.use(express.json())

interface User {
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

		await pool.query(
			'INSERT INTO users (email, username, password) VALUES ($1, $2, $3)',
			[email, username, hashedPassword]
		)

		res.status(200).json({ status: true, newUser: { email, username }, token })
	} catch (err:any) {
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
			const token = jwt.sign(
				{ id: registeredUser.rows[0]._id },
				process.env.TOKEN || '',
				{
					expiresIn: '1h',
				}
			)

			return res
				.status(200)
				.json({ status: true, message: 'Login successful', token })
		} else {
			return res.status(400).json({ message: 'Incorrect Password' })
		}
	} catch (err:any) {
		console.error(err.message)
		return res.status(500).json({ message: 'Server Error' })
	}
})

app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`)
})
