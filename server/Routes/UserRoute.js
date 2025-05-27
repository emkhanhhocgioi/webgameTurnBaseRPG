const express = require('express');
const router = express.Router();
const {getUserProfile,registerUserProfile, testApiCall }  = require('../controllers/UserControllers');
const { CreateCharacter, GetuserCharacter ,characterUpdateLevel ,deleteItems,updateitemsEquipped,addItemFromLuckyChest} = require('../controllers/CharacterController');
const {authenticateToken} = require('../midlewares');

router.post('/auth/register', registerUserProfile )
router.post('/auth/login', getUserProfile ) 
router.get('/test', testApiCall )
router.post('/create/character', authenticateToken,  CreateCharacter )
router.post('/get/user/character', authenticateToken, GetuserCharacter )
router.post('/character/update/level', authenticateToken, characterUpdateLevel )
router.post('/delete/items', authenticateToken, deleteItems )
router.post('/update/items/equipped', authenticateToken, updateitemsEquipped )
router.post('/add/item/luckychest', authenticateToken, addItemFromLuckyChest )


module.exports = router;