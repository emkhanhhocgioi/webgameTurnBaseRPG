
const mobdata = require('../models/mobdata'); // Import dữ liệu mob từ file mobdata.js
const getMobEvent = require('../models/MobEvent'); // Import dữ liệu mob từ file mobdata.js

// Hàm lấy giá trị ngẫu nhiên trong khoảng min và max
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

        return {
            index,
            mob: { ...selectedMob },
            hp: selectedMob.hp + getRandomValue(0, 5),
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



module.exports = {
    spawnRedBox,
    getRandomValue,
};