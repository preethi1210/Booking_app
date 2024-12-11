const express = require('express');
const app = express();
const cors = require('cors');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const User = require('./models/User');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
require('dotenv').config();
app.use(express.json());
const jwtSecret ="berrituh439uhgfwe98wy3greh2";  // Ensure JWT_SECRET is set in .env
app.use(cookieParser());
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
            { expiresIn: '24h' }                         // Optional expiration time
        );

        // Set the JWT token as a cookie
        res.cookie('token', token, { httpOnly: true, secure: true }).json(userDoc);
    } catch (e) {
        console.error('Error during login:', e);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
app.get('/profile', (req, res) => {
    const { token } = req.cookies;
  
    if (token) {
      // Verify JWT
      jwt.verify(token, jwtSecret, {}, async (err, userData) => {
        if (err) {
          console.error('JWT Error:', err); // Log error for debugging
          return res.status(401).json({ message: 'Invalid or expired token' }); // Respond with error message
        }
  
        try {
          // Find user by ID
          const user = await User.findById(userData.id);
          if (!user) {
            return res.status(404).json({ message: 'User not found' }); // If user not found
          }
  
          // Return user data
          const { name, email, _id } = user;
          res.json({ name, email, _id });
        } catch (dbError) {
          console.error('Database Error:', dbError); // Log database error
          res.status(500).json({ message: 'Server error while fetching user data' }); // Respond with server error
        }
      });
    } else {
      res.status(400).json({ message: 'Token not provided' }); // If no token is found
    }
  });
  app.post('/logout',(req,res)=>{
    res.cookie('token','').json(true);
  })
app.listen(4000, () => {
    console.log('Server running on port 4000');
});
