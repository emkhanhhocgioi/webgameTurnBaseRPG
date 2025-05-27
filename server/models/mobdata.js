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
      "xp":300,
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
      "xp":300,
      "dropitem": {
        "id": 0,    
        "droprate": 100,}
      
     
    },
    {
      "name": "Undead",
      "level": 2,
      "hp": 80,
      "dmg": 10,
      "armor": 4,
      "agility": 1,
      "type": "melee",
       "xp":400,
      "dropitem": {
        "id": 1,
        "droprate": 10,
      },

    },
    {
      "name": "Undead",
      "level": 3,
      "hp": 120,
      "dmg": 14,
      "armor": 2,
      "agility": 1,
      "type": "melee",
      "xp":500,
      "dropitem": {
        "id": 3,
        "droprate": 1,
      },

    },
    {
      "name": "Undead",
      "level": 4,
      "hp": 200,
      "dmg": 24,
      "armor": 2,
      "agility": 1,
      "type": "melee",
      "xp":10,
      "dropitem": {
        "id": 4,
        "droprate": 1,
      },

    },
    {
      "name": "Undead",
      "level": 5,
      "hp": 200,
      "dmg": 24,
      "armor": 2,
      "agility": 1,
      "type": "melee",
      "xp":10,
      "dropitem": {
        "id": 4,
        "droprate": 1,
      },

    },
    {
      "name": "Undead",
      "level": 6,
      "hp": 200,
      "dmg": 24,
      "armor": 2,
      "agility": 1,
      "type": "melee",
      "xp":10,
      "dropitem": {
        "id": 4,
        "droprate": 1,
      },

    },
  ]


  }

module.exports = mobdata;
