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
const Place = require('./models/Place');
const jwtSecret = "berrituh439uhgfwe98wy3greh2"; 

app.use(express.json());
app.use(cookieParser());

// Serve uploaded images from the 'uploads' directory
app.use('/uploads', express.static(__dirname+ '/uploads'));

app.use(
  cors({
    credentials: true,
    origin: 'http://localhost:5173',  // Ensure this matches the React frontend's URL
  })
);

mongoose.connect(process.env.MONGO_URL);

// Test route to check if the server is working
app.get('/test', (req, res) => {
  res.json('test ok');
});

// Register route
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

// Login route
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

// Profile route
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

// Logout route
app.post('/logout', (req, res) => {
  res.cookie('token', '').json(true);
});

// Image upload route using multer
// Route to upload an image by URL

app.post('/upload-by-link', async (req, res) => {
  const { link } = req.body;
  const newName = 'photo' + Date.now() + '.jpg';
  
  try {
    await imageDownloader.image({
      url: link,
      dest: __dirname + '/uploads/' + newName,
    });

    // Create the URL for the uploaded file
    const fileUrl = '/uploads/' + newName;

    // Save the file URL in your database (for example, in Place model)
    const place = await Place.create({
      owner: req.userData.id, // assuming JWT authentication to get user data
      addedPhotos: [fileUrl],  // save the image URL
    });

    res.json({ place, fileUrl }); // Send response with saved place and image URL
  } catch (error) {
    console.error("Error uploading image:", error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

const photosMiddleware = multer({ dest: 'uploads/' });

app.post('/upload', photosMiddleware.array('photos', 100), async (req, res) => {
  const uploadedFiles = [];

  for (let i = 0; i < req.files.length; i++) {
    const { path, originalname } = req.files[i];
    const parts = originalname.split('.');
    const ext = parts[parts.length - 1];
    const newPath = path + '.' + ext;
    fs.renameSync(path, newPath);

    // Create the URL for the uploaded file
    const fileUrl = newPath.replace('uploads/', '');

    // Push the URL into the array
    uploadedFiles.push(fileUrl);
  }

  // Save image URLs in your database (e.g., Place model)
  try {
    // You can use your existing model (Place, or any other model) to save the images
    const place = await Place.create({
      owner: req.userData.id, // assuming the user data is decoded from JWT
      images: uploadedFiles,   // save the file URLs here
    });

    res.json({ place, uploadedFiles }); // Send the saved place and file URLs back to the client
  } catch (error) {
    console.error("Error saving place:", error);
    res.status(500).json({ error: 'Failed to save images in database' });
  }
});

// Places route to create a new place
app.post('/places', (req, res) => {
  const { token } = req.cookies;
  const { title, address, addedPhotos, description, perks, extraInfo, checkIn, checkOut, maxGuests } = req.body;

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  jwt.verify(token, jwtSecret, {}, async (err, userData) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }

    try {
      // Create a new place entry
      const placeDoc = await Place.create({
        owner: userData.id,
        title,
        address,
        addedPhotos,
        description,
        perks,
        extraInfo,
        checkIn,
        checkOut,
        maxGuests,
      });

      // Respond with the created place data
      res.json(placeDoc);
    } catch (error) {
      console.error("Error saving place:", error);
      res.status(500).json({ error: 'Failed to save place' });
    }
  });
});

// Start the server
app.listen(4000, () => {
  console.log('Server running on port 4000');
});
