const express = require('express');
const { updateUserPasswordByEmail } = require('./passwordcontroller'); 

const app = express();
app.use(express.json()); // Parse JSON request bodies

// Define route to reset password
app.post('/reset-password', (req, res) => {
    const { email, newPassword } = req.body;
    if (!newPassword || !newPassword.match(/^(?=.*[a-zA-Z])(?=.*[0-9])/)) {
        return res.status(400).json({ message: 'Password must contain both letters and numbers' });
    }
    updateUserPasswordByEmail(email, newPassword, (err, result) => {
        if (err) {
            console.error('Error updating password:', err);
            return res.status(500).json({ message: 'An error occurred while updating the password.' });
        }
   
        // Check if the password was successfully updated
        if (result.affectedRows > 0) {
            res.status(200).json({ message: 'Password changed successfully.' });
        } else {
            res.status(404).json({ message: 'User not found or password not updated.' });
        }
    });
});

module.exports = app;