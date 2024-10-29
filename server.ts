import express from 'express'
import authRoutes from './src/auth-service/auth'
import bookRoutes from './src/booking-service/booking'
import payRoutes from './src/payment-service/payment' 

const app = express()
const PORT = process.env.PORT || 3000

app.use(express.json())
app.use('/auth', authRoutes) 
app.use('/book', authRoutes) 
app.use('/payment', authRoutes) 

app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`)
})
