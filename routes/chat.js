const path = require('path');

const express = require('express');

const chatController = require('../controllers/chat');

const isAuth = require('../middleware/is-auth');


const router = express.Router();


router.get('/', chatController.getHome);


router.get('/index', isAuth ,chatController.getIndex);

router.get('/chat', isAuth,chatController.getChat);


module.exports = router;
