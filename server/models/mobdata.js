const { id } = require("ethers");

const mobdata = {
  "mobs": [
    {
      "name": "Undead",
      "level": 1,
      "hp": 20,
      "dmg": 4,
      "armor": 2,
      "agility": 1,
      "type": "melee",
      "xp":10,
      "dropitem": {
        "id": 0,
        "droprate": 100,
      },

    },
    {
      "name": "Skeleton",
      "level": 1,
      "hp": 20,
      "dmg": 4,
      "armor": 2,
      "agility": 1,
      "type": "range",
      "xp":10,
      "dropitem": {
        "id": 0,    
        "droprate": 100,}
      
     
    }
  ]


  }

module.exports = mobdata;
