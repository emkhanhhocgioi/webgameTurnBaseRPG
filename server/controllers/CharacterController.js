const { now } = require('mongoose');
const Character = require('../models/Character');
const Item = require('../models/ItemModel.js');
const items = require('../models/Item.js');
const client = require('../MongoDbConnection');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { ObjectId } = require("mongodb");


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
const getlevelStats = async (retrunCharacter) =>{
   for (let i = 1; i <= retrunCharacter.level; i++) {
       retrunCharacter.hp += 10; // Increase hp by 10 for each level
       retrunCharacter.mp += 5; // Increase mp by 5 for each level
       retrunCharacter.damage += 2; // Increase damage by 2 for each level
       retrunCharacter.armor += 1; // Increase armor by 1 for each level
       retrunCharacter.agility += 1; // Increase agility by 1 for each level
       retrunCharacter.maxHp = retrunCharacter.hp; // Set maxHp to current hp
       
   }
   return retrunCharacter;
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
      
        const retrunCharacter = await getlevelStats(existingCharacter);
        console.log("existingCharacter", existingCharacter);
        console.log("retrunCharacter", retrunCharacter);    
        if (!existingCharacter) {
            return res.status(404).json({ message: 'Character not found' }); // Status 404 for not found
        }

        const inventory = await getCharacterInventory(UserID);
        const equippedItems = await getCharacterEquippedItems(UserID);
        console.log(inventory)
        const characterdt ={
            character:retrunCharacter,
            inventory:inventory,
            equippedItems: equippedItems
        }
        return res.status(200).json(characterdt);
    } catch (error) {
        console.error("Error fetching character:", error); // Log the error for debugging
        return res.status(500).json({ message: 'Internal Server Error' }); // Return 500 status for server errors
    }
};

const updateitemsEquipped = async (req,res) => {
  
    const { UserID, itemId, slot } =  req.body;; // Extract UserID, itemId, and slot from items
    console.log("updateitemsEquipped called with UserID:", UserID, "itemId:", itemId, "slot:", slot);
    try {
        await client.connect();
        const db = client.db("DungeonRunnerGame");
        const characterCollection = db.collection("Character");
        // Update the character's itemsEquipped field
        // Fetch the current equipped item in the slot
        const character = await characterCollection.findOne({ UserID: UserID });
        const oldId = character.itemsEquipped ? character.itemsEquipped[slot] : null;

        // If the old item ID is the same as the new one, return success
        if (oldId === itemId) {
            console.log("Item already equipped in this slot");
            return { message: "Item already equipped in this slot" };
        }

        // Otherwise, update the equipped item
        const updateResult = await characterCollection.updateOne(
            { UserID: UserID },
            { $set: { [`itemsEquipped.${slot}`]: itemId } } // Dynamically set the slot
        );
        if (updateResult.modifiedCount === 0) {
            throw new Error("No items equipped updated");
        }
        console.log("Items equipped updated successfully");
        return { message: "Items equipped updated successfully" };
    } catch (error) {
            
        console.error("Error updating itemsEquipped:", error);
        throw new Error("Failed to update itemsEquipped");
    }
}

const addItemFromLuckyChest = async (req, res) => {

    const { UserID, itemid } = req.body; // Extract UserID and item from request body
    console.log("addItemFromLuckyChest called with UserID:", UserID, "item:", itemid);
    try {
        await client.connect();
        const db = client.db("DungeonRunnerGame");
        const itemCollection = db.collection("Item");
        const characterCollection = db.collection("Character");
        

        const item = items.find(p => p.id == itemid);
        console.log("debug item", item);
        if (!item) {    
            throw new Error("Item not found in predefined items list");
        }else{
            // Insert the new item into the Item collection
            const newItem = await itemCollection.insertOne({
                weaponid: parseInt(itemid), 
                attributes: item.attributes,
                createdAt: new Date(),
            });

            // Update the character to include the new item
            const updatedCharacter = await characterCollection.updateOne(
                { UserID: UserID },
                { $push: { inventory: newItem.insertedId } } // Assuming inventory is an array of item IDs
            );

            if (updatedCharacter.modifiedCount === 0) {
                throw new Error("Failed to update character with new item");
            }
        }
        

       console.log("Item added successfully to character's inventory");
       res.status(200).json({ message: "Item added successfully" });
   } catch (error) {
       console.error("Error adding item from lucky chest:", error);
       res.status(500).json({ error: "Failed to add item from lucky chest" });
   }
}


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
            { UserID: character.player.UserID },
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
                slot: matched?.slot || "unknown",
            };
        });

        return enrichedInventory;
    } catch (error) {
        console.error("Error fetching inventory:", error);
        throw new Error("Failed to fetch inventory");
    }
};
const getCharacterEquippedItems = async (userID) => {
    try {
        await client.connect();
        const db = client.db("DungeonRunnerGame");
        const characterCollection = db.collection("Character");
        const itemCollection = db.collection("Item");
        // Step 1: Get character's equipped items
        const character = await characterCollection.findOne({
            UserID: userID
        });
        console.log("character", character.itemsEquipped);
     
        const itemIds = Object.values(character.itemsEquipped).map(id => new ObjectId(id));

        if (!character || !character.itemsEquipped || character.itemsEquipped.length === 0) {
            return { equippedItems: [], message: "No items equipped" };
        }
        const equippedItems = await itemCollection.find({
            _id: { $in: itemIds }
        }).toArray();

       
        // Map equipped items to an object with slot as key and weapon data as value
        const enrichedEquippedItems = {};
        Object.entries(character.itemsEquipped).forEach(([slot, itemId]) => {
            const dbItem = equippedItems.find(item => item._id.toString() === itemId);
            if (dbItem) {
            const matched = items.find(p => p.id === dbItem.weaponid);
            enrichedEquippedItems[slot] = {
                ...dbItem,
                name: matched?.name || "Unknown Item",
                description: matched?.description || "",
                image: matched?.image || "",
                attributes: dbItem.attributes || "",
                slot: matched?.slot || "unknown",
            };
            }
        });

        console.log("enrichedEquippedItems", enrichedEquippedItems);
        return enrichedEquippedItems;
    } catch (error) {
        console.error("Error fetching equipped items:", error);
        throw new Error("Failed to fetch equipped items");

    }
};  

const itemTransferFromTo = async (SellerWallet, BuyerWallet, itemId) => {
    try {
        console.log(SellerWallet,BuyerWallet,itemId)
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


const characterUpdateLevel = async (UserID, newExp) => {
    try {
        await client.connect();
        const db = client.db("DungeonRunnerGame");
        const characterCollection = db.collection("Character");

        // Find the character by UserID
        const character = await characterCollection.findOne({ UserID: UserID });
        if (!character) {
            throw new Error("Character not found");
        }

        // Update exp and level
        const updatedCharacter = await characterCollection.updateOne(
            { UserID: UserID },
            { $set: { exp: newExp, level: calculateLevel(newExp),
              

             } }
        );

        if (updatedCharacter.modifiedCount === 0) {
            throw new Error("Failed to update character experience");
        }

        console.log("Character experience updated successfully");
        return { message: "Experience updated successfully" };
    } catch (error) {
        console.error("Error updating character experience:", error);
        throw new Error("Failed to update character experience");
    }
};
// Function to calculate level based on total experience
const calculateLevel = (totalExp) => {
    let level = 1;  
    let expThreshold = 0;

    // Loop through the level thresholds to find the correct level
    for (let i = 1; i <= 50; i++) {
        expThreshold += playerlevelModifer(i);
        if (totalExp < expThreshold) {
            break;
        }
        level = i;
    }

    return level;
};

const playerlevelModifer = (level) => {    
    if (level >= 1 && level <= 10) {
        return 120;
    } else if (level > 10 && level <= 20) {
        return 300;
    } else if (level > 20 && level <= 30) {
        return 600;
    } else if (level > 30 && level <= 40) {
        return 1200;
    } else if (level > 40 && level <= 50) {
        return 2400;
    } else {
        return 0; 
    }
}


const deleteItems = async (req,res) => {
    const { itemId ,userId} = req.body;
    console.log("deleteItems called with itemId:", itemId);
    try {
        await client.connect();
        const db = client.db("DungeonRunnerGame");
        const itemCollection = db.collection("Item");
        const characterCollection = db.collection("Character");
       
        // Delete items by their IDs
       
        const itemObjectId = new ObjectId(itemId);

        // Xóa item
        const itemdeleted = await itemCollection.deleteOne({ _id: itemObjectId });
      
        await characterCollection.updateMany(
            { inventory: itemId },
            { $pull: { inventory: itemId } }
        );
        if (itemdeleted.deletedCount === 0) {
            throw new Error("No items deleted");
        }

        console.log("Items deleted successfully");
        res.status(200).json({ success: true, message: "Items deleted successfully" });
    } catch (error) {
        console.error("Error deleting items:", error);
        res.status(500).json({ error: "Failed to delete items" });
    }
};



module.exports = {
    CreateCharacter,
    GetuserCharacter,
    addItemtoServedAndChacracter,
    itemTransferFromTo,
    characterUpdateLevel,
    deleteItems,
    updateitemsEquipped,
    addItemFromLuckyChest
};