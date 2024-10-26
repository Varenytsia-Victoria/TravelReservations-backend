const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const pool = require('./database')
const redis = require('redis')
require('dotenv').config()

const app = express()

const PORT = process.env.PORT || 3000
app.use(express.json)

app.post('/register', async (req, res) => {
	const newUser = new User({
		email: req.body.email,
		username: req.body.username,
		password: req.body.password,
	})

	try {
		const userExist = await pool.query(
			'SELECT * FROM users WHERE username = $1',
			[username]
		)

		if (userExist.rows.length > 0) {
			return res
				.status(400)
				.json({ status: false, message: 'User already registered' })
		}
		const token = jwt.sign({ id: newUser._id }, process.env.TOKEN, {
			expiresIn: '1h',
		})
		
		await pool.query('INSERT INTO users (email, username, password) $1,$2,$3', [
			email,
			username,
			password,
		])
		res.status(200).json({ status: true, newUser })
	} catch (err) {
		console.error(err.message)
		res.status(400).json({ status: false, message: err.message })
	}
})

app.post('/login', async (req, res) => {
	try {
		const registeredUser = await pool.query('SELECT * FROM user WHERE username = $1')

		if (registeredUser.rows.length > 0) {
			return res.status(400).json({ message: 'User not found' })
		}

		if (registeredUser.password === req.body.password) {
			const token = jwt.sign({ id: registeredUser._id }, process.env.TOKEN, {
				expiresIn: '1h',
			})

			return res
				.status(200)
				.json({ status: true, message: 'Login successful', token })
		} else {
			return res.status(400).json({ message: 'Incorrect Password' })
		}
	} catch (err) {
		console.error(err.message)
		return res.status(500).json({ message: 'Server Error' })
	}
})

app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`)
})
