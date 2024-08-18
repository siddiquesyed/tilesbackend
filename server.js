const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcrypt'); // Import bcrypt for password hashing
const User = require('./models/User'); // Import the User model

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Connect to MongoDB Atlas
const MONGODB_URI = 'mongodb+srv://siddusyed99:tile%40123456@tilecluster.v7i64.mongodb.net/Tails?retryWrites=true&w=majority';
mongoose.connect(MONGODB_URI, {
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

    // Validate inputs (you can use express-validator here)

    // Check if the email or mobile number already exists
    const existingUser = await User.findOne({ $or: [{ email }, { mobile }] });
    if (existingUser) {
      if (existingUser.email === email && existingUser.mobile === mobile) {
        return res.status(400).json({ error: { email: "Email already registered", mobile: "Mobile number already registered" } });
      }
      if (existingUser.email === email) {
        return res.status(400).json({ error: 'Email already registered' });
      }
      if (existingUser.mobile === mobile) {
        return res.status(400).json({ error: 'Mobile number already registered' });
      }
    }

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new User({ name, email, password: hashedPassword, mobile });
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
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    // Check if the provided password matches the stored hashed password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(400).json({ error: 'Invalid email or password' });
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
