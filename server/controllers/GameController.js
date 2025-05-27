
const mobdata = require('../models/mobdata'); // Import dữ liệu mob từ file mobdata.js
const getMobEvent = require('../models/MobEvent'); // Import dữ liệu mob từ file mobdata.js
const {droptokentoplayer} = require('../controllers/BDChainController'); // Import hàm từ BDChainController.js
const items = require('../models/Item.js'); // Import dữ liệu item từ file gnmetadata.js
const client = require('../MongoDbConnection.js'); // Import client MongoDB
// Hàm lấy giá trị ngẫu nhiên trong khoảng min và max
const Character = require('../models/Character'); // Import dữ liệu mob từ file mobdata.js
const {addItemtoServedAndChacracter} = require(`../controllers/CharacterController`)
const getRandomValue = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


function RandomMobBaseOnDungeonLevel (dlevel)  { 
    const mobAmonut = {
        1: 3,
        2: 5,
        3: 7,
        4: 9,
        5: 11,
        6: 13,
        7: 15,
    }
    return mobAmonut[dlevel] || 0; 
}

const getmobdataSpawn = (dlevel, randomIndex) => {
    const mobs = mobdata.mobs.filter(mob => mob.level == dlevel); 
    if (mobs.length === 0) return [];

    // Shuffle mảng mobs để random nhưng không trùng
    const shuffledMobs = [...mobs].sort(() => Math.random() - 0.5);

    const resData = randomIndex.map((index, i) => {
        const selectedMob = shuffledMobs[i % shuffledMobs.length]; // nếu index dài hơn số mob, dùng vòng lặp
        const hp = selectedMob.hp + getRandomValue(0, 5); // Tăng HP ngẫu nhiên từ 0 đến 5
        return {
            index,
            hp: hp,
            maxHp: hp,
            dmg: selectedMob.dmg + getRandomValue(0, 5),
            armor: selectedMob.armor + getRandomValue(0, 5),
            agility: selectedMob.agility + getRandomValue(0, 5),
            mobType: selectedMob.type,
            mobName: selectedMob.name,
            mobLevel: selectedMob.level,
            mobXp: selectedMob.xp,
            dropitem:[{
                id  :selectedMob.dropitem.id,
                droprate : selectedMob.dropitem.droprate,
            }]
        };
    });

    return resData;
};




  



// Hàm sinh ra các ô đỏ ngẫu nhiên
const spawnRedBox = async (req, res) => {
    const { dlevel } = req.body;

    if (!dlevel) {
        console.log("⚠ Không có dlevel trong request body");
        return res.status(400).json({ success: false, message: "Missing dungeon level (dlevel)" });
    }

    try {
        const GRID_SIZE = 12;
        const totalGrid = GRID_SIZE * GRID_SIZE;
        const redBoxCount = Math.min(await RandomMobBaseOnDungeonLevel(dlevel)); // Ensure max 3 red boxes

        const randomIndexes = new Set();
        while (randomIndexes.size < redBoxCount) {
            randomIndexes.add(Math.floor(Math.random() * totalGrid));
        }

        const uniqueRandomIndexes = [...randomIndexes];

        const resData = getmobdataSpawn(dlevel, uniqueRandomIndexes);
        resData.forEach(mob => {
            // console.log("Drop item for mob:", JSON.stringify(mob, null, 2)); // Log detailed mob data
        });
        if (!resData) {
            console.log("⚠ Không tìm thấy mob nào cho dlevel:", dlevel);
            return res.status(404).json({ success: false, message: "No mobs found for the given dungeon level" });
        }
        res.status(200).json({ success: true, resData });

    } catch (error) {
        console.log("❌ Lỗi khi sinh ra ô đỏ:", error);
        res.status(500).json({ success: false, message: "Lỗi server" });
    }
};
const getRandomDropItem = async (mobdata) => {
    for (const item of mobdata.dropitem) {
        console.log("Drop Item ID:", item.id);
        console.log("Drop Chance:", item.droprate);

        const dropItem = items.find(i => i.id === item.id);
        if (dropItem) {
            const randomChance = Math.random() * 100; // Random percentage from 0 to 100
            if (randomChance <= item.droprate) {
                return dropItem;
            }
        }
    }
    return null; // No item dropped or no matching item found
};


const MobRandomTurn = async (req, res) => {
    const { gamestate } = req.body;
    console.log("GameState", gamestate);

    if (!gamestate) {
        console.log("⚠ Không có GameState trong request body");
        return res.status(400).json({ success: false, message: "Missing GameState" });
    }
    
    const mobdata = gamestate.mobstat;
    console.log("MobData:", mobdata);
    const playerdata = gamestate.playerStat;
    console.log(playerdata)
    const userdata = gamestate.Userdata;
    console.log("userdata:", userdata);

    try {
        const mobHPPercent = (mobdata.hp / mobdata.maxHp) * 100;
        const playerHPPercent = (playerdata.hp / playerdata.maxHp) * 100;
        console.log("test :" + mobdata);
        if (mobdata && mobdata.dropitem && mobdata.dropitem.length > 0) {
            mobdata.dropitem.forEach(item => {
                console.log("Drop Item ID:", item.id);
                console.log("Drop Chance:", item.droprate);
            });
        }
        let actionCode;

        if (mobHPPercent <= 20 && mobHPPercent > 0) {
            actionCode = 2; // ví dụ: "defend"
        console.log("🤖 Mob chọn hành động:", actionCode);
        res.status(200).json({  action: actionCode });
        } else if (playerHPPercent <= 20) {
            actionCode = 1; // ví dụ: "attack"
            
        console.log("🤖 Mob chọn hành động:", actionCode);
        res.status(200).json({  action: actionCode });
        } else if( mobHPPercent <= 0 ) {
            actionCode = 3;
            const itemjson = await getRandomDropItem(mobdata)
            const testItemimport = await addItemtoServedAndChacracter(itemjson,playerdata)
            console.log(testItemimport)
            const dropToken = await droptokentoplayer(userdata.walletAddress, mobdata.mobLevel);

            // Ví dụ dropToken có trường amount là BigInt:
            dropToken.amount = dropToken.amount.toString();
            await characterUpdateLevel(userdata._id, mobdata.mobXp);
            const resFinal  = ({
            actionCode: actionCode,
            item: itemjson,
            DroptokenJson: dropToken
            });
            
            console.log("🤖 Mob :", resFinal.DroptokenJson);
            console.log("🤖 Mob :", resFinal.item);
            res.status(200).json({ action: actionCode, resFinal });
            
            // ví dụ: "defend"
        }else {
            // Random số 1 đến 3
            actionCode = 1;
            
        console.log("🤖 Mob chọn hành động:", actionCode);
        res.status(200).json({  action: actionCode });
        }
        


    } catch (error) {
        console.log("❌ Lỗi khi xử lý lượt của Mob:", error);
        return res.status(500).json({ success: false, message: "Lỗi server" });
    }
};

const characterUpdateLevel = async (UserID, newExp) => {
    console.log("Updating character level for UserID:", UserID, "with newExp:", newExp);
    if (!UserID || !newExp) {
        throw new Error("UserID and newExp are required");
    }
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
        const newTotalExp = character.exp + newExp;
        const updatedCharacter = await characterCollection.updateOne(
            { UserID: UserID },
            { $set: { exp: newTotalExp, level: calculateLevel(newTotalExp) } }
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




module.exports = {
    spawnRedBox,
    getRandomValue,
    MobRandomTurn,


};