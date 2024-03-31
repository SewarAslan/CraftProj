const connection = require('../../../../DB/connection.js');

function updateUserPasswordByEmail(email, newPassword, callback) {
    const sql = `UPDATE users SET password = ? WHERE email = ?`;
    connection.query(sql, [newPassword, email], function (err, result) {
        if (err) {
            console.error('Error updating password:', err);
            callback(err, null);
        } else {
            callback(null, result);
        }
    });
}

module.exports = { updateUserPasswordByEmail };
