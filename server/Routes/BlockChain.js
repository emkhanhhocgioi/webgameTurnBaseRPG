const express = require('express');
const bcrouter = express.Router();

const {droptokentoplayer,getTokenBalanceOfUser}  = require('../controllers/BDChainController');
const { ethers } = require('hardhat'); // Import ethers từ hardhat  

bcrouter.post('/droptokentoplayer', droptokentoplayer );
bcrouter.get('/getTokenBalanceOfUser', getTokenBalanceOfUser ); // Đường dẫn mới cho hàm getTokenBalanceOfUser

module.exports = bcrouter;

