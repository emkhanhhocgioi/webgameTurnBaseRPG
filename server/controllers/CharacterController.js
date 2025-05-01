const { now } = require('mongoose');
const Character = require('../models/Character');
const Item = require('../models/ItemModel.js');
const items = require('../models/Item.js');
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

        const inventory = await getCharacterInventory(UserID);
        console.log(inventory)
        const characterdt ={
            character:retrunCharacter,
            inventory:inventory
        }
        return res.status(200).json(characterdt);
    } catch (error) {
        console.error("Error fetching character:", error); // Log the error for debugging
        return res.status(500).json({ message: 'Internal Server Error' }); // Return 500 status for server errors
    }
};
 
const addItemtoServedAndChacracter = async (item, character) => {
    try {
        await client.connect();
        const db = client.db("DungeonRunnerGame");
        const itemCollection = db.collection("Item");
        const characterCollection = db.collection("Character");

        // Insert the new item into the Item collection
        const newItem = await itemCollection.insertOne({
            weaponid: item.id,
            attributes: item.attributes,
            createdAt: new Date(),
        });

        // Update the character to include the new item
        const updatedCharacter = await characterCollection.updateOne(
            { UserID: character.character.UserID },
            { $push: { inventory: newItem.insertedId } } // Assuming inventory is an array of item IDs
        );

        if (updatedCharacter.modifiedCount === 0) {
            throw new Error("Failed to update character with new item");
        }

        console.log("Item added successfully to character's inventory");
        return { message: "Item added successfully" };
    } catch (error) {
        console.error("Error adding item to character:", error);
        throw new Error("Failed to add item to character");
    }
};

const getCharacterInventory = async (userID) => {
    try {
        await client.connect();
        const db = client.db("DungeonRunnerGame");
        const itemCollection = db.collection("Item");
        const characterCollection = db.collection("Character");

        // Step 1: Get character's inventory (array of weapon/item IDs)
        const character = await characterCollection.findOne({ UserID: userID });

        if (!character || !character.inventory || character.inventory.length === 0) {
            return { inventory: [], message: "No items in inventory" };
        }

        // Step 2: Fetch item documents using the IDs from character's inventory
        const inventoryItems = await itemCollection.find({
            _id: { $in: character.inventory }
        }).toArray();

        // Step 3: Map and enrich each item with name/desc/image by matching `weaponID` to predefined item list
        const enrichedInventory = inventoryItems.map((dbItem) => {
            const matched = items.find(p => p.id === dbItem.weaponid);
            return {
                ...dbItem,
                name: matched?.name || "Unknown Item",
                description: matched?.description || "",
                image: matched?.image || "",
                attributes: dbItem.attributes || "",
            };
        });

        return enrichedInventory;
    } catch (error) {
        console.error("Error fetching inventory:", error);
        throw new Error("Failed to fetch inventory");
    }
};

const itemTransferFromTo = async (SellerWallet, BuyerWallet, itemId) => {
    try {
        await client.connect();
        const db = client.db("DungeonRunnerGame");
        const user = db.collection("UserProfile");
        const character = db.collection("Character");
        const itemCollection = db.collection("Item");
        
        // Step 1: Find UserIDs from wallet addresses
        const seller = await user.findOne({ walletAddress: SellerWallet });
        const buyer = await user.findOne({ walletAddress: BuyerWallet });

        if (!seller || !buyer) {
            throw new Error("Seller or buyer not found");
        }

        const sellerUserID = seller._id.toString();
        const buyerUserID = buyer._id.toString();

        // Step 2: Find corresponding characters
        const sellerCharacter = await character.findOne({ UserID: sellerUserID });
        const buyerCharacter = await character.findOne({ UserID: buyerUserID });

        if (!sellerCharacter || !buyerCharacter) {
            throw new Error("Seller or buyer character not found");
        }

        // Convert MongoDB ObjectIDs to strings for comparison if needed
        const sellerInventory = sellerCharacter.inventory.map(id => id.toString());
        
        // Step 3: Find the item in the seller's inventory
        const { ObjectId } = require('mongodb');
        const itemObjectId = new ObjectId(itemId);
        
        if (!sellerInventory.includes(itemId)) {
            throw new Error("Item not found in seller's inventory");
        }

        // Step 4: Update the seller's inventory (remove item)
        await character.updateOne(
            { UserID: sellerUserID },
            { $pull: { inventory: itemObjectId } }
        );

        // Step 5: Update the buyer's inventory (add item)
        await character.updateOne(
            { UserID: buyerUserID },
            { $push: { inventory: itemObjectId } }
        );

        console.log("Item transferred successfully");
        return { message: "Item transferred successfully" };

    } catch (error) {
        console.error("Error transferring item:", error);
        throw new Error("Failed to transfer item: " + error.message);
    }
};



module.exports = {
    CreateCharacter,
    GetuserCharacter,
    addItemtoServedAndChacracter,
    itemTransferFromTo
};