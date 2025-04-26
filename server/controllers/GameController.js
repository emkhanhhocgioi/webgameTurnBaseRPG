
const mobdata = require('../models/mobdata'); // Import dữ liệu mob từ file mobdata.js
const getMobEvent = require('../models/MobEvent'); // Import dữ liệu mob từ file mobdata.js
const {droptokentoplayer} = require('../controllers/BDChainController'); // Import hàm từ BDChainController.js
// Hàm lấy giá trị ngẫu nhiên trong khoảng min và max
const Character = require('../models/Character'); // Import dữ liệu mob từ file mobdata.js

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
            mob: { ...selectedMob },
            hp: hp,
            maxHp: hp,
            dmg: selectedMob.dmg + getRandomValue(0, 5),
            armor: selectedMob.armor + getRandomValue(0, 5),
            agility: selectedMob.agility + getRandomValue(0, 5),
            mobType: selectedMob.type,
            mobName: selectedMob.name,
            mobLevel: selectedMob.level,
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
        const redBoxCount = await RandomMobBaseOnDungeonLevel(dlevel);

        const randomIndexes = new Set();
        while (randomIndexes.size < redBoxCount) {
            randomIndexes.add(Math.floor(Math.random() * totalGrid));
        }

        const uniqueRandomIndexes = [...randomIndexes];
       

        const resData = getmobdataSpawn(dlevel, uniqueRandomIndexes);
        console.log("resData", resData);
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

const MobRandomTurn = async (req, res) => {
    const { gamestate } = req.body;
    console.log("GameState", gamestate);

    if (!gamestate) {
        console.log("⚠ Không có GameState trong request body");
        return res.status(400).json({ success: false, message: "Missing GameState" });
    }

    const mobdata = gamestate.mobstat;
    const playerdata = gamestate.playerStat;
    const userdata = gamestate.Userdata;
    console.log("userdata", userdata);

    try {
        const mobHPPercent = (mobdata.hp / mobdata.maxHp) * 100;
        const playerHPPercent = (playerdata.hp / playerdata.maxHp) * 100;
        console.log("Mob HP Percent:", mobHPPercent);
        console.log("Player HP Percent:", playerHPPercent);
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
            const resFinal  ={
                actionCode: actionCode,
                DroptokenJson: await droptokentoplayer(userdata.walletAddress,mobdata.mobLevel)
            } 
            console.log("🤖 Mob :", resFinal.DroptokenJson);
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

const playerExp = async (req, res) => {
    const { UserID, exp } = req.body;
    console.log("UserID", UserID);
    console.log("exp", exp);

    if (!UserID || !exp) {
        console.log("⚠ Không có UserID hoặc exp trong request body");
        return res.status(400).json({ success: false, message: "Missing UserID or exp" });
    }

    try {
        await client.connect();
        const db = client.db("DungeonRunnerGame");
        const doc = db.collection("Character");

        // Tìm kiếm người dùng theo UserID
        const existingCharacter = await doc.findOne({ UserID: UserID });
        if (!existingCharacter) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Tính toán tổng exp mới
        const newExp = existingCharacter.exp + exp;

        // Cập nhật exp cho người dùng
        const updatedCharacter = await doc.updateOne(
            { UserID: UserID },
            { $set: { exp: newExp, level: calculateLevel(newExp) } }
        );

        if (updatedCharacter.modifiedCount === 0) {
            return res.status(500).json({ success: false, message: "Failed to update user experience" });
        }

        res.status(200).json({ success: true, message: "Experience updated successfully" });
    } catch (error) {
        console.log("❌ Lỗi khi cập nhật exp:", error);
        return res.status(500).json({ success: false, message: "Lỗi server" });
    }
};

// Function to calculate level based on total experience
const calculateLevel = (totalExp) => {
    let level = 1;  // Starting at level 1
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
        return 0; // Default modifier if level is out of range
    }
}




module.exports = {
    spawnRedBox,
    getRandomValue,
    MobRandomTurn,
    playerExp

};