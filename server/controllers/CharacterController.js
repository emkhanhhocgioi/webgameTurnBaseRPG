const Character = require('../models/Character');
const client = require('../MongoDbConnection');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');



const CreateCharacter = async (req, res) => {
    const { UserID, characterClass } = req.body;

    console.log(req.body);

    if (!UserID || !characterClass  ) {
        return res.status(400).json({ message: 'Missing required fields' });
    }
    try {
        const doc =  await client.db("DungeonRunnerGame").collection("Character");
        const existingCharacter = await doc.findOne({ UserID: UserID });
        if (existingCharacter) {
            return res.status(409).json({ message: 'Character already exists' });
        }else{
            let hp, mp, damage, armor, agility, level, exp;

            switch (characterClass) {
                case 'Warrior':
                    hp = 150;
                    mp = 50;
                    damage = 20;
                    armor = 15;
                    agility = 5;
                    level = 1;
                    exp = 0;
                    break;
                case 'Mage':
                    hp = 100;
                    mp = 100;
                    damage = 20;
                    armor = 5;
                    agility = 10;
                    level = 1;
                    exp = 0;
                    break;
            }
            const newCharacter = new Character({
                UserID,
                characterClass,
                hp,
                mp,
                damage,
                armor,
                agility,
                level,
                exp
            });
            await doc.insertOne(newCharacter);
            return res.status(201).json({ message: 'Character created successfully' });
        }
       
    } catch (error) {
        console.error('Error creating character:', error); // Log error for server-side debugging
        return res.status(500).json({ message: 'Failed to create character' });
    }
  
}

const GetuserCharacter = async (req, res) => {
    const { UserID } = req.body;
    console.log(req.body); // For debugging

    if (!UserID) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    try {
        await client.connect();
        const db = client.db("DungeonRunnerGame");
             
        // Ensure client is connected and the correct collection is used
        const doc = await client.db("DungeonRunnerGame").collection("Character");
        const existingCharacter = await doc.findOne({ UserID: UserID });
      
        const retrunCharacter = {
            UserID: existingCharacter.UserID,
            characterClass: existingCharacter.characterClass,
            hp: existingCharacter.hp,
            mp: existingCharacter.mp,
            maxHp: existingCharacter.hp, 
            damage: existingCharacter.damage,
            armor: existingCharacter.armor,
            agility: existingCharacter.agility,
            level: existingCharacter.level,
            exp: existingCharacter.exp
        };
        console.log("retrunCharacter", retrunCharacter);    
        if (!existingCharacter) {
            return res.status(404).json({ message: 'Character not found' }); // Status 404 for not found
        }

        return res.status(200).json(retrunCharacter);
    } catch (error) {
        console.error("Error fetching character:", error); // Log the error for debugging
        return res.status(500).json({ message: 'Internal Server Error' }); // Return 500 status for server errors
    }
};
 

module.exports = {
    CreateCharacter,
    GetuserCharacter
};