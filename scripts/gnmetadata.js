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
    name: "Legendary Sword",
    description: "A powerful sword forged by ancient heroes.",
    image: "https://yourdomain.com/images/sword.png",
    attributes: [
      {
        hp:10,
        mp:0,
        dmg:20,
        armor:0,
        agility:0,
      }
    ]
  },
  {
    id: 1,
    name: "Wooden Practice Sword",
    description: "A sword Made out of wood .",
    image: "https://yourdomain.com/images/sword.png",
    attributes: [
      {
        hp:0,
        mp:0,
        dmg:5,
        armor:0,
        agility:0,
      }
    ]
  },
  {
    id: 2,
    name: "Wooden Practice Sword",
    description: "A sword Made out of wood .",
    image: "https://yourdomain.com/images/sword.png",
    attributes: [
      {
        hp:0,
        mp:0,
        dmg:5,
        armor:0,
        agility:0,
      }
    ]
  },
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
