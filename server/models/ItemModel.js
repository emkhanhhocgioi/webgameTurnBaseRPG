const { string } = require('hardhat/internal/core/params/argumentTypes');
const mongoose = require('mongoose');

const ItemSchema = new mongoose.Schema({
  
    weaponid:{
        type: Number,
        required: true,
    },
    attributes: { 
        type: Array,
        required: true,
       
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const Item = mongoose.model('Items', ItemSchema);

module.exports = Item;