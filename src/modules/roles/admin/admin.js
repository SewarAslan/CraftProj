const express = require('express');
const {addCrafter,getCrafter,deactivateUser, selectfeatured,  createEvent} = require('./admin.controller.js');
const {notification,chooseStatus} = require('../../services/notification.js');
const { updateuser } = require('../users/user.controller.js');
const { authenticateJWT } = require('../../middleware/middleware.js');
const app = express();
app.post('/crafter',authenticateJWT,addCrafter);
app.get('/crafters',authenticateJWT,getCrafter);//view users 
app.patch('/:email',authenticateJWT,updateuser); //update user 
app.put('/status',authenticateJWT,deactivateUser);
app.get('/notification',authenticateJWT,notification);
app.post('/chooseStatus',authenticateJWT,chooseStatus);
app.post('/selectfeatured',authenticateJWT,selectfeatured);
app.post('/createvent',authenticateJWT,createEvent)
module.exports= app 
////////////////////////////////
