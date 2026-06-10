const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

exports.signup = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    console.log(`Signup attempt for email: ${email}`);

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      console.log('Signup failed: User already exists');
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Hash password
    console.log('Hashing password...');
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    console.log('Creating user in database...');
    const userId = await User.create({
      name,
      email,
      password: hashedPassword,
      role
    });

    // Generate token
    console.log('Generating JWT token...');
    const token = jwt.sign({ id: userId, role }, JWT_SECRET, { expiresIn: '24h' });

    console.log('Signup successful!');
    res.status(201).json({
      message: 'User created successfully',
      token,
      user: { id: userId, name, email, role }
    });
  } catch (error) {
    console.error('SIGNUP ERROR:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate token
    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '24h' });

    res.json({
      message: 'Login successful',
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
