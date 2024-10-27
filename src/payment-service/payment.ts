import express from 'express';
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pg = require('pg');
const redis = require('redis');

const app = express();

const PORT = process.env.PORT || 3000;
app.use(express.json());  
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
