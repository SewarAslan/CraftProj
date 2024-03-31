const connection = require('./../../../DB/connection.js');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

const filter = async function(req, res) {
    const { skills, materials, size ,level} = req.query;

    let sql = 'SELECT * FROM project'; 
    const params = [];

    if (skills) {
        const skillList = skills.split(',').map(skill => skill.trim());
        const placeholders = skillList.map(() => '?').join(','); 
        sql += ` AND (`;
        sql += skillList.map(() => `FIND_IN_SET(?, skills)`).join(' OR '); 
        sql += `)`;
        params.push(...skillList); // Add each skill to parameters array
    }

    if (materials) {
        sql += ` AND FIND_IN_SET('${materials}', materials)`;
        params.push(materials);
        console.log(materials)
    }

    if (size) {
        sql += ` AND size = ?`;
        params.push(size);
    }

    if(level){
        if (level=='beginner'){
        sql += ' ORDER BY level ASC'; }
        else if(level=='advanced'){
            sql += ' ORDER BY level DESC'; }
        params.push(level); 
    }


    connection.execute(sql, params, function(error, results) {
        if (error) {
            return res.status(500).json({ error: 'Internal server error' });
        }

        if (results.length === 0) {
            console.log('No projects found matching the filter criteria');
            return res.status(404).json({ message: 'No projects found matching the filter criteria' });
        }

        return res.json(results);
    });
};

module.exports={filter}