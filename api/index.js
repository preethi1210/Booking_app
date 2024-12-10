const express = require('express');
const app = express();
const cors = require('cors');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const User = require('./models/User');
const jwt = require('jsonwebtoken');
require('dotenv').config();
app.use(express.json());
const jwtSecret ="berrituh439uhgfwe98wy3greh2";  // Ensure JWT_SECRET is set in .env

app.use(
    cors({
        credentials: true,
        origin: 'http://localhost:5173',  // Ensure this matches the React frontend's URL
    })
);

mongoose.connect(process.env.MONGO_URL);

app.get('/test', (req, res) => {
    res.json('test ok');
});

app.post('/register', async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const hashedPassword = bcrypt.hashSync(password, bcrypt.genSaltSync(10));
        const userDoc = await User.create({ name, email, password: hashedPassword });
        res.json(userDoc);
    } catch (e) {
        res.status(422).json(e);
    }
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        // Find the user by email
        const userDoc = await User.findOne({ email });

        if (!userDoc) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Compare the provided password with the stored hash
        const passOk = bcrypt.compareSync(password, userDoc.password);
        if (!passOk) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Sign the JWT token
        const token = jwt.sign(
            { email: userDoc.email, _id: userDoc._id }, // Payload
            jwtSecret,                                  // Secret key
            { expiresIn: '1h' }                         // Optional expiration time
        );

        // Set the JWT token as a cookie
        res.cookie('token', token, { httpOnly: true }).json({ message: 'Login successful' });
    } catch (e) {
        console.error('Error during login:', e);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.listen(4000, () => {
    console.log('Server running on port 4000');
});
