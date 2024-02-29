const express = require('express');
const connection = require('../../../DB/connection.js');
const {addCrafter,getCrafter,deactivateUser,featured} = require('./admin.controller.js');
const { authenticateJWT } = require('../middleware/middleware.js');
const notification = require('../services/notification.js');
const { updateuser } = require('../users/user.controller.js');
const app = express();

app.post('/crafter',authenticateJWT,addCrafter);
app.get('/crafters',authenticateJWT,getCrafter);//view users 
app.put('/userinfo',authenticateJWT,updateuser); //update user 
app.put('/status',authenticateJWT,deactivateUser);
app.get('/notification',authenticateJWT,notification);
app.get('/featured projects.',authenticateJWT,featured);


module.exports= app ;
