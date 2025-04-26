const userdata = require('../models/UserProfile');
const client = require('../MongoDbConnection');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Khóa bí mật cho token - nên đặt trong biến môi trường
const JWT_SECRET = "buhzuhcuh"; 

const registerUserProfile = async (req, res) => {
    console.log(req.body);

    if (!req.body || !req.body.username || !req.body.password || !req.body.email) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    try {
        await client.connect();
        const db = client.db("DungeonRunnerGame");
        const doc = db.collection("UserProfile");

        const walletAddress = generateRandomWallet(); // Ensure this generates a valid wallet address format

        // Kiểm tra tài khoản đã tồn tại chưa
        const existingUser = await doc.findOne({ username: req.body.username });
        if (existingUser) {
            return res.status(409).json({ message: 'Username already exists' });
        }

        const existingWallet = await doc.findOne({ walletAddress: walletAddress });
        if (existingWallet) {
            return res.status(409).json({ message: 'Wallet address already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        
        // Optional: If you need to hash wallet address, it should be handled based on use case


        const result = await doc.insertOne({
            username: req.body.username,
            password: hashedPassword,
            walletAddress: walletAddress,
            email: req.body.email,
        });

        return res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
        console.error('Error creating user:', error); // Log error for server-side debugging
        return res.status(500).json({ message: 'Failed to create user' });
    }
};

const generateRandomWallet = () => {
    const randomHex = () => {
        return [...Array(40)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');
    };

    return `0x${randomHex()}`;
};

const getUserProfile = async (req, res) => {
    console.log(req.body);
    if (!req.body.email || !req.body.password) {
        return res.status(400).json({ message: 'Invalid request' });
    }

    try {
        await client.connect();
        const db = client.db("DungeonRunnerGame");
        const collection = db.collection("UserProfile");

        const user = await collection.findOne({ email: req.body.email });
        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }

        const isPasswordValid = await bcrypt.compare(req.body.password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Wrong password' });
        }

        // Tạo JWT token
        const token = jwt.sign(
            { id:user._id , username: user.username, Wallet_Address: user.Wallet_Address },
            JWT_SECRET,
            { expiresIn: '1h' }
        );

        // Ẩn mật khẩu khỏi response
        delete user.password;

        res.json({
            message: "Login successful",
            token: token,
            user: user
        });

    } catch (error) {
        return res.status(500).json({ message: 'Failed to fetch user' });
    }
};

const testApiCall = async (req, res) => {
    console.log("is callable");
    res.send("API is working");
};

module.exports = { registerUserProfile, getUserProfile, testApiCall };
