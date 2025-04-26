const express = require('express');
const router = express.Router();
const {getUserProfile,registerUserProfile, testApiCall }  = require('../controllers/UserControllers');
const { CreateCharacter, GetuserCharacter } = require('../controllers/CharacterController');
const {authenticateToken} = require('../midlewares');

router.post('/auth/register', registerUserProfile )
router.post('/auth/login', getUserProfile ) 
router.get('/test', testApiCall )
router.post('/create/character', authenticateToken,  CreateCharacter )
router.post('/get/user/character', authenticateToken, GetuserCharacter )


module.exports = router;