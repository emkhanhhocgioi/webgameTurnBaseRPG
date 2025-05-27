const randomNumber = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

const items = [
    {
        id: 0,
        name: "Wooden Practice Sword",
        description: "A sword made out of wood.",
        image: "https://yourdomain.com/images/sword.png",
        slot: "weapon",
        attributes: [
            {
                hp: randomNumber(0, 5),
                mp: randomNumber(0, 5),
                dmg: randomNumber(5, 11),
                armor: randomNumber(0, 3),
                agility: randomNumber(0, 3),
            }
        ],
    },
    {
        id: 1,
        name: "Iron Longsword",
        description: "A sturdy longsword forged from iron.",
        image: "https://yourdomain.com/images/iron_longsword.png",
        slot: "weapon",
        attributes: [
            {
                hp: randomNumber(0, 10),
                mp: randomNumber(0, 5),
                dmg: randomNumber(10, 15),
                armor: randomNumber(0, 5),
                agility: randomNumber(1, 3),
            }
        ],
    },
    {
        id: 2,
        name: "Steel Dagger",
        description: "A lightweight dagger made of steel.",
        image: "server/assest/weapon/dagger.jfif c",
        slot: "weapon",
        attributes: [
            {
                hp: randomNumber(0, 5),
                mp: randomNumber(0, 5),
                dmg: randomNumber(8, 12),
                armor: randomNumber(0, 2),
                agility: randomNumber(4, 6),
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
                hp: randomNumber(0, 10),
                mp: randomNumber(0, 5),
                dmg: randomNumber(20, 30),
                armor: randomNumber(3, 7),
                agility: randomNumber(-3, 0),
            }
        ],
    },
    {
        id: 4,
        name: "Crystal Staff",
        description: "A magical staff imbued with crystal energy.",
        image: "https://yourdomain.com/images/crystal_staff.png",
        slot: "weapon",
        attributes: [
            {
                hp: randomNumber(0, 5),
                mp: randomNumber(15, 25),
                dmg: randomNumber(6, 10),
                armor: randomNumber(0, 2),
                agility: randomNumber(2, 4),
            }
        ],
    },
    {
        id: 5,
        name: "blood katana",
        description: "A katana infused with the power of blood.",
        image: "server/assest/weapon/blood_katana.png",
        slot: "weapon",
        attributes: [
            {
                hp: randomNumber(0, 5),
                mp: randomNumber(0, 5),
                dmg: randomNumber(15, 20),
                armor: randomNumber(0, 3),
                agility: randomNumber(6, 8),
            }
        ],
    }
];

module.exports = items;