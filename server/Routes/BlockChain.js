const express = require('express');
const bcrouter = express.Router();

    
const {droptokentoplayer,
    getTokenBalanceOfUser,
    DropitemToUser,
    getalluseritem,
    testgetmetadata,
    ExchangeTokken,
    BuyProduct,
    ListItem,
    getExchanges,
    ApproveExchange,
    getOwnerEthers
}  = require('../controllers/BDChainController');
const { ethers } = require('hardhat'); // Import ethers từ hardhat  

bcrouter.post('/droptokentoplayer', droptokentoplayer );
bcrouter.post('/getTokenBalanceOfUser', getTokenBalanceOfUser ); // Đường dẫn mới cho hàm getTokenBalanceOfUser
bcrouter.post('/dropitemtoplayer',DropitemToUser )
bcrouter.get('/getallitem',getalluseritem)
bcrouter.post('/testgetmetadata',testgetmetadata)
bcrouter.post('/listitem',ListItem)
bcrouter.post('/buylisteditem',BuyProduct)
bcrouter.get('/get/token/offer',getExchanges)
bcrouter.post('/approve/token/offer',ApproveExchange)
bcrouter.get('/testbzh',getOwnerEthers)
module.exports = bcrouter;

