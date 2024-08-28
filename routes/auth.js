//the files in here are going to be all the routes for all the different html pages 
//this is focused on authenthication actions like register, login, logout, gym

const authController = require('../controllers/auth'); 

const express = require('express');

const router = express.Router();

router.post('/register', authController.register);

router.post('/login', authController.login);

router.get('/logout', authController.logout);

router.post('/gym', authController.gym); 

module.exports = router; //this is to make sure we can use the routes in other files, we need to export em that's what we doing in this line