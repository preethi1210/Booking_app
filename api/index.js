const express = require('express');
const app = express();
const cors = require('cors');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const User = require('./models/User');
const Place = require('./models/Place');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const imageDownloader = require('image-downloader');
require('dotenv').config();
const multer = require('multer');
const fs = require('fs');
const path = require('path');

// Secret keys and configurations
const jwtSecret = process.env.JWT_SECRET || "your_jwt_secret";
const uploadDir = path.join(__dirname, '/uploads/');

// Middleware setup
app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static(uploadDir)); // Serve images from 'uploads' directory
app.use(
  cors({
    credentials: true,
    origin: 'http://localhost:5173', // Ensure this matches your frontend's URL
  })
);

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Helper function to verify JWT
const verifyToken = (token, res, callback) => {
  jwt.verify(token, jwtSecret, {}, (err, userData) => {
    if (err) return res.status(401).json({ error: 'Invalid or expired token' });
    callback(userData);
  });
};

// Routes
app.get('/test', (req, res) => {
  res.json('Server is running');
});

// Register user
app.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const hashedPassword = bcrypt.hashSync(password, bcrypt.genSaltSync(10));
    const userDoc = await User.create({ name, email, password: hashedPassword });
    res.json(userDoc);
  } catch (error) {
    res.status(422).json(error);
  }
});

// Login user
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const userDoc = await User.findOne({ email });

  if (!userDoc) return res.status(404).json({ error: 'User not found' });

  const passOk = bcrypt.compareSync(password, userDoc.password);
  if (!passOk) return res.status(401).json({ error: 'Invalid email or password' });

  const token = jwt.sign({ email: userDoc.email, id: userDoc._id }, jwtSecret, { expiresIn: '24h' });
  res.cookie('token', token, { httpOnly: true, secure: false }).json(userDoc);
});

// Get profile
app.get('/profile', (req, res) => {
  const { token } = req.cookies;
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  verifyToken(token, res, async (userData) => {
    const user = await User.findById(userData.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json({ name: user.name, email: user.email, id: user._id });
  });
});

// Logout
app.post('/logout', (req, res) => {
  res.cookie('token', '').json(true);
});

// Upload image by link
app.post('/upload-by-link', async (req, res) => {
  const { link } = req.body;
  const newName = Date.now() + '.jpg';
  try {
    await imageDownloader.image({
      url: link,
      dest: path.join(uploadDir, newName),
    });
    res.json(newName);
  } catch (error) {
    console.error('Image download error:', error);
    res.status(500).json({ error: 'Failed to download image' });
  }
});

// Upload images via form
const photoMiddleware = multer({ dest: 'uploads/' });

app.post('/upload', photoMiddleware.array('photos', 100), (req, res) => {
  const uploadedFiles = [];
  
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'No files uploaded' });
  }

  for (let i = 0; i < req.files.length; i++) {
    const { path, originalname } = req.files[i];
    const parts = originalname.split('.');
    const ext = parts[parts.length-1 ]; 
    const newPath = path+'.'+ ext; // Create a new filename
    // New path for file

    try {
      // Rename the file to avoid overwriting
      fs.renameSync(path, newPath);
     uploadedFiles.push(newPath.replace('uploads/',''));
    } catch (err) {
      console.error("Error renaming file:", err);
      return res.status(500).json({ error: 'File upload failed' });
    }
  }

  // Respond with uploaded file details
  res.json(uploadedFiles); 
});



// Create a new place
app.post('/places', (req, res) => {
  const { token } = req.cookies;
  const { title, address, addedPhotos, description, perks, extraInfo, checkIn, checkOut, maxGuests,price } = req.body;

  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  jwt.verify(token, jwtSecret,{}, async (err,userData) => {
    try {
      const placeDoc = await Place.create({
        owner: userData.id,
        title,
        address,
        photos:addedPhotos,
        description,
        perks,
        extraInfo,
        checkIn,
        checkOut,
        maxGuests,price,
      });
      res.json(placeDoc);
    } catch (error) {
      console.error("Error saving place:", error);
      res.status(500).json({ error: 'Failed to save place' });
    }
  });
});
app.get('/user-places',(req,res)=>{
  const { token } = req.cookies;


  jwt.verify(token, jwtSecret,{}, async (err,userData) => {
    const {id}=userData;
    res.json(await Place.find({owner:id}));
  });
})
;
app.get('/places/:id',async(req,res)=>{
  const { id } = req.params;
  res.json(await Place.findById(id));})

app.put('/places',async(req,res)=>{
  const { token } = req.cookies;
  const {
    id,title,address,addedPhotos,description,perks,extraInfo,checkOut,maxGuests,
  }=req.body;
  jwt.verify(token, jwtSecret,{}, async (err,userData) => {
    const placeDoc=await Place.findById(id);
    if (userData.id===placeDoc.owner.toString()){
      placeDoc.set({
        title,
        address,
        photos:addedPhotos,
        description,
        perks,
        extraInfo,
        checkIn,
        checkOut,
        maxGuests,price,
      })
      await placeDoc.save();
      res.json('ok');
    }
  })
})
app.get('/places',async(req,res)=>{
  res.json(await Place.find());
})
// Start server
app.listen(4000, () => {
  console.log('Server running on port 4000');
});
