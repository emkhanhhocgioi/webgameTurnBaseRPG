const mongoose = require('mongoose');

const UserplayerData = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true
    },
    walletAddress: {
        type: String,
        required: true,
        unique: true,   
    },
    privatekey: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true
    },
   
})
const userdata = mongoose.model('UserProfile', UserplayerData);

module.exports = userdata;