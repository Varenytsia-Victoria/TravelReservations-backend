import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import { createClient } from 'redis'
dotenv.config()

const paymentPool = require('../constants')
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

const route = express.Router()
const PORT = process.env.PORT || 3000

route.use(express.json())


export default route