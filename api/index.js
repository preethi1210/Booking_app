const express = require('express');
const app = express();
const cors = require('cors');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const User = require('./models/User');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const imageDownloader = require('image-downloader');
require('dotenv').config();
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const Place=require('./models/Place')
const jwtSecret = "berrituh439uhgfwe98wy3greh2"; 

app.use(express.json());

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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
      { expiresIn: '24h' }                        // Optional expiration time
    );

    // Set the JWT token as a cookie
    res.cookie('token', token, { httpOnly: true, secure: false }).json(userDoc); // secure: false for local dev
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
        return res.status(401).json({ message: 'Invalid or expired token' });
      }

      try {
        // Find user by ID
        const user = await User.findById(userData.id);
        if (!user) {
          return res.status(404).json({ message: 'User not found' });
        }

        // Return user data
        const { name, email, _id } = user;
        res.json({ name, email, _id });
      } catch (dbError) {
        console.error('Database Error:', dbError);
        res.status(500).json({ message: 'Server error while fetching user data' });
      }
    });
  } else {
    res.status(400).json({ message: 'Token not provided' });
  }
});

app.post('/logout', (req, res) => {
  res.cookie('token', '').json(true);
});

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.post('/upload-by-link', async (req, res) => {
  const { link } = req.body;

  if (!link) {
    return res.status(400).json({ error: 'No link provided' });
  }

  const newName = 'photo' + Date.now() + '.jpg';
  const destinationPath = path.join(__dirname, 'uploads', newName);
  console.log('Saving image to:', destinationPath);  // Log the full path

  try {
    // Download the image
    await imageDownloader.image({
      url: link,
      dest: destinationPath,
    });

    // Respond with the filename so the client can use it
    res.json({ filename: newName });
  } catch (error) {
    console.error('Error downloading image:', error);
    res.status(500).json({ error: 'Failed to download image' });
  }
});

const photoMiddleware = multer({ dest: 'uploads/' });

app.post('/upload', photoMiddleware.array('photos', 100), (req, res) => {
  const uploadedFiles = [];
  for (let i = 0; i < req.files.length; i++) {
    const { path: filePath, originalname } = req.files[i];
    const parts = originalname.split('.');
    const ext = parts[parts.length - 1]; 
    const newName = 'photo' + Date.now() + '.jpg'; // Create new filename
    const newPath = path.join(__dirname, 'uploads', newName); // New path for file
    fs.renameSync(filePath, newPath); // Rename the file

    uploadedFiles.push({
      filename: newName,
      url: `http://localhost:4000/uploads/${newName}`, // Include the URL
    });
  }
  res.json(uploadedFiles); // Return the updated file objects
});

app.post('/places',(req,res)=>{
  const {token}=req.cookies;
  const {title,address,addedPhotos,description,perks,extraInfo,checkIn,checkOut,maxGuests,}=req.body;
  jwt.verify(token, jwtSecret, {}, async (err, userData) => {
    if (err) {
      throw err; 
    }
    const placeDoc=await Place.create({
      owner:userData.id,
      title,address,addedPhotos,description,perks,extraInfo,checkIn,checkOut,maxGuests,
 })
})
})
app.listen(4000, () => {
  console.log('Server running on port 4000');
});
