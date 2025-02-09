const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
require('dotenv').config();
const FormDataModel = require('./models/FormData');

const corsOptions = {
    origin: 'https://truthguardianfrontend-g4ve.onrender.com',  // Allow requests from localhost:5173
    methods: ['GET', 'POST'],
};
  
const app = express();
app.use(express.json());
app.use(cors(corsOptions));

// ✅ Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch(err => console.error('❌ MongoDB connection error:', err));

// ✅ Register Route
app.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        console.log("📝 Registration request for:", email);

        const existingUser = await FormDataModel.findOne({ email });
        if (existingUser) {
            console.log("❌ User already exists");
            return res.status(400).json({ message: "User already registered" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        console.log("🔒 Hashed password:", hashedPassword);

        const newUser = await FormDataModel.create({ name, email, password: hashedPassword });

        console.log("✅ New user registered:", newUser.email);
        res.status(201).json({ message: "Registration successful" });
    } catch (error) {
        console.error("❌ Error in registration:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// ✅ Login Route
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log("🔐 Login request for:", email);

        const user = await FormDataModel.findOne({ email });
        if (!user) {
            console.log("❌ User not found");
            return res.status(404).json({ message: "User not found" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        console.log("🔍 Password match result:", isMatch);

        if (!isMatch) {
            console.log("❌ Incorrect password");
            return res.status(401).json({ message: "Incorrect password" });
        }

        console.log("✅ Login successful!");

        const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });

        return res.status(200).json({ message: "Login successful", token });

    } catch (error) {
        console.error("❌ Server error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// ✅ Logout Route
app.post('/logout', (req, res) => {
    // Notify client to remove JWT token
    console.log("🔒 Logging out");

    // No need to do anything server-side for JWT (stateless)
    res.status(200).json({ message: "Logout successful" });
});

// ✅ Middleware: Verify JWT Token
function authenticateToken(req, res, next) {
    const token = req.header('Authorization')?.split(' ')[1]; // Extract token from "Bearer <token>"

    if (!token) return res.status(401).json({ message: "Access denied" });

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: "Invalid token" });

        req.user = user;
        next();
    });
}

// ✅ Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://127.0.0.1:${PORT}`);
});
