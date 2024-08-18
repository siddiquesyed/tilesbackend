const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const User = require('./models/User'); // Import the User model

const app = express();
const port = 5000;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/students', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('Connected to MongoDB!');
}).catch(err => {
  console.error('Error connecting to MongoDB:', err);
});

// Route to handle user registration
app.post('/submit-form', async (req, res) => {
  try {
    const { name, email, password, mobile } = req.body;

    // Check if the email or mobile number already exists
    const existingUser = await User.findOne({ $or: [{ email }, { mobile }] });
    if (existingUser) {
      if (existingUser.email === email && existingUser.mobile === mobile) {
        return res.status(400).json({ error:{email:"Email already registered",mobile:"Mobile number already registered"} });
      }
      if (existingUser.email === email) {
        return res.status(400).json({ error: 'Email already registered' });
      }
      if (existingUser.mobile === mobile) {
        return res.status(400).json({ error: 'Mobile number already registered' });
      }
    }
    const newUser = new User({ name, email, password, mobile });
    await newUser.save();
    res.status(201).json({ message: 'User created successfully!', user: newUser });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: 'An error occurred while creating the user.' });
  }
});

// Route to handle user login
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find the user by email
    const user = await User.findOne({ email });
    
    
    
    // Check if the email exists
    if (!user) {
      return res.status(400).json({ error: 'Invalid email' });
    }

    // Check if the provided password matches the stored password
    if (user.password !== password) {
      return res.status(400).json({ error: 'Invalid password' });
    }

    // If the credentials are correct
    res.status(200).json({ message: 'Login successful' });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: 'An error occurred during login.' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
