const connection = require('../../../../DB/connection.js');
const express = require('express');

const app = express();
app.use(express.json());

app.post('/save-info', (req, res) => {
 
  const { company_name, job_title, description, skillsneeded, company_email } = req.body;

  // Check if all required fields are present in the request body
  if (!company_name || !job_title || !description || !skillsneeded || !company_email) {
    return res.status(400).json({ message: 'Missing required fields.' });
  }

  const sql = `INSERT INTO jobs (company_name, job_title, description, skillsneeded, company_email) VALUES (?, ?, ?, ?, ?)`;

  connection.query(sql, [company_name, job_title, description, skillsneeded, company_email], (err, result) => {
    if (err) {
      console.error('Error saving information:', err);
      return res.status(500).json({ message: 'An error occurred while saving information.' });
    }
    
    console.log('Information saved successfully');
    res.status(200).json({ message: 'Information saved successfully' });
  });
});
app.get('/get-info', (req, res) => {
    // Execute SELECT query to fetch information from the database
    const sql = 'SELECT * FROM jobs';
    connection.query(sql, (err, rows) => {
      if (err) {
        console.error('Error fetching information:', err);
        return res.status(500).json({ message: 'An error occurred while fetching information.' });
      }
      
      // Return fetched information as a response
      res.status(200).json(rows);
    });
  });
  

module.exports = app;