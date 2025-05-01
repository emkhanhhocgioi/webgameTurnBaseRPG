const fs = require('fs');
const { arch } = require('os');
const path = require('path');

function getRandomNumberBetween(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
// Danh sách item bạn muốn tạo metadata

  const items = [
    {
        id: 0,
        name: "Wooden Practice Sword",
        description: "A sword made out of wood.",
        image: "https://yourdomain.com/images/sword.png",
        attributes: [
            {
                hp: 0,
                mp: 0,
                dmg: 5,
                armor: 0,
                agility: 0,
            }
        ],
    },
    {
        id: 1,
        name: "Iron Longsword",
        description: "A sturdy longsword forged from iron.",
        image: "https://yourdomain.com/images/iron_longsword.png",
        attributes: [
            {
                hp: 0,
                mp: 0,
                dmg: 15,
                armor: 0,
                agility: 2,
            }
        ],
    },
    {
        id: 2,
        name: "Steel Dagger",
        description: "A lightweight dagger made of steel.",
        image: "https://yourdomain.com/images/steel_dagger.png",
        attributes: [
            {
                hp: 0,
                mp: 0,
                dmg: 10,
                armor: 0,
                agility: 5,
            }
        ],
    },
    {
        id: 3,
        name: "Golden Battle Axe",
        description: "A heavy battle axe adorned with gold.",
        image: "https://yourdomain.com/images/golden_battle_axe.png",
        attributes: [
            {
                hp: 0,
                mp: 0,
                dmg: 25,
                armor: 5,
                agility: -2,
            }
        ],
    },
    {
        id: 4,
        name: "Crystal Staff",
        description: "A magical staff imbued with crystal energy.",
        image: "https://yourdomain.com/images/crystal_staff.png",
        attributes: [
            {
                hp: 0,
                mp: 20,
                dmg: 8,
                armor: 0,
                agility: 3,
            }
        ],
    },
    {
        id: 5,
        name: "Shadow Bow",
        description: "A bow crafted from the shadows, silent and deadly.",
        image: "https://yourdomain.com/images/shadow_bow.png",
        attributes: [
            {
                hp: 0,
                mp: 0,
                dmg: 18,
                armor: 0,
                agility: 7,
            }
        ],
    }
];


function generateMetadata() {
  const outputDir = path.join(__dirname, 'metadata');

  // Kiểm tra folder metadata, nếu chưa có thì tạo
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }

  // Tạo file metadata cho từng item
  items.forEach(item => {
    const metadata = {
      name: item.name,
      description: item.description,
      image: item.image,
      attributes: item.attributes
    };

    const filePath = path.join(outputDir, `${item.id}.json`);
    fs.writeFileSync(filePath, JSON.stringify(metadata, null, 2));
    console.log(`Generated metadata for ID ${item.id}`);
  });
}

generateMetadata();
