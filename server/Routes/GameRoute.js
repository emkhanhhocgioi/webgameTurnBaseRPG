const express = require('express');
const GameGenerateApi = express.Router();
const {spawnRedBox,MobRandomTurn } = require('../controllers/GameController');
const {getMobEvent} = require('../models/MobEvent'); // Import dữ liệu mob từ file mobdata.js

GameGenerateApi.post('/game/generate-mob-level',spawnRedBox)
GameGenerateApi.post('/game/generate-mob-event', getMobEvent);
GameGenerateApi.post('/game/mob-random-turn', MobRandomTurn)


module.exports = GameGenerateApi;