const express = require('express');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const validator = require('validator');
const User = require('../models/userModel');


const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'images');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext !== '.jpg' && ext !== '.jpeg' && ext !== '.png' && ext !== '.gif') {
      return cb(new Error('Only JPEG, PNG, and GIF files are allowed'));
    }
    cb(null, true);
  }
});


const createUser = async (req, res) => {
  const { fullName, email, password } = req.body;


  if (!fullName || !email || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }
  if (!validator.isEmail(email)) {
    return res.status(400).json({ message: 'Invalid email address' });
  }

  
  if (!passwordRegex.test(password)) {
    return res.status(400).json({
      message: 'Password must be at least 8 characters long, with at least one uppercase letter, one lowercase letter, and one special character.'
    });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      fullName,
      email,
      password: hashedPassword
    });
    await newUser.save();
    res.status(201).json({ message: 'User created successfully', user: newUser });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};


const updateUser = async (req, res) => {
  const { fullName, password } = req.body;
  const { email } = req.params;


  if (fullName && !validator.isLength(fullName, { min: 3 })) {
    return res.status(400).json({ message: 'Full name must be at least 3 characters long' });
  }
  if (password && !passwordRegex.test(password)) {
    return res.status(400).json({
      message: 'Password must be at least 8 characters long, with at least one uppercase letter, one lowercase letter, and one special character.'
    });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (fullName) user.fullName = fullName;
    if (password) user.password = await bcrypt.hash(password, 10);

    await user.save();
    res.status(200).json({ message: 'User updated successfully', user });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};


const deleteUser = async (req, res) => {
  const { email } = req.params;

  try {
    const user = await User.findOneAndDelete({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};


const getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json({ users });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};


const uploadImage = upload.single('image');
const handleImageUpload = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  const filePath = `/images/${req.file.filename}`;
  res.status(200).json({ message: 'Image uploaded successfully', path: filePath });
};

const router = express.Router();


router.post('/create', createUser);
router.put('/edit/:email', updateUser);
router.delete('/delete/:email', deleteUser);
router.get('/getAll', getAllUsers);
router.post('/uploadImage', uploadImage, handleImageUpload);

module.exports = router;
