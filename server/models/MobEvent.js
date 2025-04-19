const MobMoveEvent = {
    MobEvent: [
        {
            name: 'Blood Moon',
            description: 'Every mob in the map becomes stronger for three turns',
            effect: 'All mobs gain +2% damage and +2% armor for the rest of the game', 
            chance: 5,
        },
        {
            name: 'Nothing Happens',
            description: 'Nothing happens',
            effect: 'Nothing happens',
            chance: 80,
        },
        {
            name: 'Increased Agreessiveness',
            description: 'All mobs in the map become more aggressive',
            effect: 'Move nearer to the player',
            chance: 10,
        },
        {
            name: 'Witches Gooo',
            description: 'All mobs in the map gain 2% health',
            effect: 'All mobs gain 2% health',
            chance: 5,
        },
        {
            name: 'Mobs are confused',
            description: 'All mobs in the map lose 2% health',
            effect: 'All mobs lose 2% health',
            chance: 5,
        }
    ]
};

const getRandomValue = (min, max) => {  
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
function potToCoord(pot, gridSize) {
    return {
      x: pot % gridSize,
      y: Math.floor(pot / gridSize)
    };
  }
  
  function coordToPot(x, y, gridSize) {
    return y * gridSize + x;
  }
  
  function moveMobCloser(playerPot, mobPot, gridSize, distance = 2) {
    const player = potToCoord(playerPot, gridSize);
    const mob = potToCoord(mobPot, gridSize);
  
    const dx = player.x - mob.x;
    const dy = player.y - mob.y;
  
    if (Math.abs(dx) + Math.abs(dy) <= distance) {
      return mobPot; // Đã gần sẵn rồi
    }
  
    let moveX = 0;
    let moveY = 0;
  
    if (Math.abs(dx) > Math.abs(dy)) {
      moveX = Math.sign(dx);
    } else {
      moveY = Math.sign(dy);
    }
  
    const newX = mob.x + moveX;
    const newY = mob.y + moveY;
  
    if (newX < 0 || newX >= gridSize || newY < 0 || newY >= gridSize) {
      return mobPot; // Không vượt biên
    }
  
    return coordToPot(newX, newY, gridSize);
  }
  
  // Modified getMobEvent
  const getMobEvent = async (req, res) => {
    const { CurrentState } = req.body;
    const mobState = CurrentState.MobData;
    const playerPot = CurrentState.playerPot;
    const gridSize = 12;
  
    const totalChance = MobMoveEvent.MobEvent.reduce((sum, event) => sum + event.chance, 0);
    const random = getRandomValue(0, totalChance);
  
    let currentChance = 0;
    let Turnevent;
    let Desc ; 
    let mobDataAfterEvent = [];
  
    for (const event of MobMoveEvent.MobEvent) {
      currentChance += event.chance;
      if (random < currentChance) {
        Turnevent = event.name;
        Desc = event.description;
        console.log(`Event triggered: ${Turnevent}`);
        break;
      }
    }
  
    if (Turnevent == 'Blood Moon') {
        mobDataAfterEvent = mobState.map(mob => {
          return {
            ...mob,
            armor: parseFloat((Number(mob.armor) + Number(mob.armor) * 0.02).toFixed(2)),
            dmg: parseFloat((Number(mob.dmg) + Number(mob.dmg) * 0.02).toFixed(2)),
          };
        });
      } else if (Turnevent == 'Increased Agreessiveness') {
        mobDataAfterEvent = mobState.map(mob => {
          return {
            ...mob,
            index: moveMobCloser(playerPot, mob.index, gridSize, 2)
          };
        });   
      } else if (Turnevent == 'Witches Gooo') {
        mobDataAfterEvent = mobState.map(mob => {
          return {
            ...mob,
            hp: parseFloat((Number(mob.hp) + Number(mob.hp) * 0.02).toFixed(2)),
          };
        });
      } else if (Turnevent == 'Mobs are confused') {
        mobDataAfterEvent = mobState.map(mob => {
          return {
            ...mob,
            hp: parseFloat((Number(mob.hp) - Number(mob.hp) * 0.02).toFixed(2)),
          };
        });
      } else if (Turnevent == 'Nothing Happens') {
        mobDataAfterEvent = mobState;
      }
      
    // Trả kết quả thành công
    res.status(200).json({
      success: true,
      Turnevent,
      Desc,
      mobDataAfterEvent
    });
  };
module.exports = {
    getMobEvent,
};
