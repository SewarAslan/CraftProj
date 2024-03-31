const connection = require('../../../../DB/connection');
const nodemailer = require('nodemailer');
const express = require('express');
const generateRandomString = (length) => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
};
 async function sendMaill(receiver){
const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: `${process.env.EMAIL}`,  
        pass:`${process.env.PASSWORD}`           
    }
});

const code = generateRandomString(10); 
 const  sendEmailWithRandomCode = await transporter.sendMail({

        from: 'Community of crafts',  
        to: receiver,                  
        subject: 'Password Recovery Code',  
        html: `<p>Your password recovery code is: <strong>${code}</strong></p>` 
});

}


function compareCodes(codeSentToEmail, providedCode) {
    
    return codeSentToEmail === providedCode;
}




module.exports = { sendMaill, compareCodes };