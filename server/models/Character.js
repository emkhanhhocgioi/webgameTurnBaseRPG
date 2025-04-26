const mongoose = require('mongoose');

const CharacterSchema = new mongoose.Schema({
    UserID : {
        type: String,
        required: true,
        unique: true,
    },
    characterClass: {
        type: String,
        required: true,
    },
    hp:{
        type: Number,
        required: true, 
    },

    mp:{
        type: Number,
        required: true, 
    },
    damage:{
        type: Number,
        required: true, 
    },
    armor:{
        type: Number,
        required: true, 
    },
    agility:{
        type: Number,
        required: true, 
    },
    level:{
        type: Number,
        required: true, 
    },
    exp:{
        type: Number,
        required: true, 
    },
    skillPointsAvailable:{
        type: Number,
        default: 0,
    },
    inventory:{
        type: Array,
        default: [],
    },  

    
})
const Character = mongoose.model('Character', CharacterSchema);
module.exports = Character;