const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
const JWT_SECRET = "my_super_secret_key_123";

// Middlewares
app.use(cors());
app.use(express.json());

// MySQL Database Connection Pool
const pool = mysql.createPool({
    host: "127.0.0.1",
    user: "root",
    password: "",
    database: "user_db",
    port: 3307,
    waitForConnections: true,
    connectionLimit: 10
});

// 1. SIGNUP ROUTE
app.post('/api/signup', async (req, res) => {
    const { name, email, password } = req.body || {};
    if (!name || !email || !password) {
        return res.status(400).json({ message: "Please fill in all fields!" });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const sql = "INSERT INTO users (name, email, password) VALUES (?, ?, ?)";
        await pool.execute(sql, [name, email, hashedPassword]);

        return res.status(201).json({ message: "User registered successfully!" });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: "This email is already registered!" });
        }
        return res.status(500).json({ message: `Database error: ${error.message}` });
    }
});

// 2. LOGIN ROUTE
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body || {};
    if (!email || !password) {
        return res.status(400).json({ message: "Please enter both email and password!" });
    }

    try {
        // Find User in Database
        const [rows] = await pool.execute("SELECT * FROM users WHERE email = ?", [email]);
        if (rows.length === 0) {
            return res.status(400).json({ message: "Invalid email or password!" });
        }

        const user = rows[0];

        // Match Password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid email or password!" });
        }

        // Generate JWT Token
        const token = jwt.sign({ id: user.id, name: user.name, email: user.email }, JWT_SECRET, { expiresIn: '1h' });

        return res.status(200).json({
            message: "Login successful!",
            token: token,
            user: { name: user.name, email: user.email }
        });

    } catch (error) {
        return res.status(500).json({ message: `Server error: ${error.message}` });
    }
});

// Start Server
const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Backend server running on http://localhost:${PORT}`));