const connection1= require('../../../DB/connection.js');

const request = require('request');

const connection=  require('./../../../DB/connection.js')
function searchByTerm(req, res) {
  const { source, country, values } = req.body;
  const options = {
    method: 'POST',
    url: 'https://price-analytics.p.rapidapi.com/search-by-term',
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
      'X-RapidAPI-Key': '0f376ee3a1msh35eb8d384d222e9p136bb8jsncaa1998c71f8',
      'X-RapidAPI-Host': 'price-analytics.p.rapidapi.com'
    },
    form: {
      source,
      country,
      values
    }
  };

  request(options, function (error, response, body) {
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    res.status(response.statusCode).json(body);
  });
}
function getJob(req, res) {
  const jobId = req.body.id; // Extracting job ID from request body

  if (!jobId) {
    return res.status(400).json({ error: "Job ID is missing from the request." });
  }

  const options = {
    method: 'GET',
    url: 'https://linkedin-api8.p.rapidapi.com/get-job-details',
    qs: { id: jobId }, // Setting job ID in the query string
    headers: {
      'X-RapidAPI-Key': '0f376ee3a1msh35eb8d384d222e9p136bb8jsncaa1998c71f8',
      'X-RapidAPI-Host': 'linkedin-api8.p.rapidapi.com'
    }
  };

  request(options, function (error, response, body) {
    if (error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(response.statusCode).send(body);
    }
  });
}

function searchJobs(req, res) {
  const options = {
    method: 'GET',
    url: 'https://linkedin-api8.p.rapidapi.com/search-jobs',
   
    headers: {
      'X-RapidAPI-Key': '0f376ee3a1msh35eb8d384d222e9p136bb8jsncaa1998c71f8',
      'X-RapidAPI-Host': 'linkedin-api8.p.rapidapi.com'
    }
  };

  request(options, function (error, response, body) {
    if (error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(response.statusCode).send(body);
    }
  });
}
function getItem(req, res) {
    const jobId = req.body.jobId;
    const options = {
      method: 'GET',
      url: `https://price-analytics.p.rapidapi.com/poll-job/${jobId}`,
      headers: {
        'X-RapidAPI-Key': '0f376ee3a1msh35eb8d384d222e9p136bb8jsncaa1998c71f8',
        'X-RapidAPI-Host': 'price-analytics.p.rapidapi.com'
      }
    };
  
    request(options, function (error, response, body) {
      if (error) {
        return res.status(500).json({ error: error.message });
      }
      // Parse the JSON response
      let jsonResponse;
      try {
        jsonResponse = JSON.parse(body);
      } catch (parseError) {
        return res.status(500).json({ error: 'Failed to parse JSON response' });
      }
      // Format the JSON with indentation for readability
      const formattedJson = JSON.stringify(jsonResponse, null, 2);
      // Send the formatted JSON response
      res.status(response.statusCode).send(formattedJson);
    });
  }

  function chatGPT(req, res) {
    // Request body containing the data to be sent
    const requestBody = req.body;
     

  // Options for the external API call
  const options = {
      method: 'POST',
      url: 'https://chatgpt-api8.p.rapidapi.com/',
      headers: {
          'content-type': 'application/json',
          'X-RapidAPI-Key': '0f376ee3a1msh35eb8d384d222e9p136bb8jsncaa1998c71f8',
          'X-RapidAPI-Host': 'chatgpt-api8.p.rapidapi.com'
      },
      body: requestBody,
      json: true
  };

  // Make the external API call using the request library
  request(options, (error, response, body) => {
      if (error) {
          console.error('Error sending request:', error);
          res.status(500).json({ error: 'Internal Server Error' });
      } else {
          res.json(body);
      }
  });
}
const finishedproject = async (req,res)=>{
  const sql =`select organizer_email,title,description,CONCAT("http://localhost:3000", "/upload/images/", image_url) AS image_url FROM project where process_flow="finished"`;
  connection1.execute(sql,(err,result)=>{
  if(err){
   return  res.json(err)
  }
  return res.json(result)
  });
  
  }
  const featuredproject = async (req, res) => {
    const sql = `SELECT organizer_email, title, description, CONCAT("http://", ?, "/upload/images/", image_url) AS image_url FROM project WHERE featured IS NOT NULL ORDER BY featured DESC`;
    
    connection1.execute(sql, [req.hostname], (err, result) => {
      if (err) {
        return res.status(500).json({ error: "Internal server error" });
      }
      return res.json(result);
    });
  };
  const showevent = async (req, res) => {
    const sql = `SELECT EventName, addressOfevent FROM events`;
    try {
        connection1.execute(sql, (err, result) => {
            if (err) {
                return res.status(500).json(err);
            } else {
                return res.status(200).json(result);
            }
        });
    } catch (error) {
        return res.status(500).json(error);
    }
};

 

  let CommentArrays = {};
function addCommentToProj(projectName, message) {
    if (!CommentArrays[projectName]) {
      CommentArrays[projectName] = []; // Create a new dynamic array if it doesn't exist
    }
    CommentArrays[projectName].push(message); // Add the message to the dynamic array
}
const commentOnProj = async function(req, res) {
  const { projectName, content } = req.body;
  try {
      const allowedRoles = ['crafter', 'organizer', 'admin'];
      if (!allowedRoles.includes(req.user.role)) {
          return res.json("You cannot access this page");
      } else {
          const projectQuery = `SELECT process_flow FROM project WHERE title='${projectName}'`;

          connection.query(projectQuery, (error, results) => {
              if (error) {
                  return res.json(error);
              }

              if (results.length === 0) {
                  return res.json({ message: 'Project not found' });
              }

              const processFlow = results[0].process_flow;
              if (processFlow !== 'finished') {
                  return res.json({ message: 'Cannot comment on project until process_flow is finished' });
              }

              const Message = `${req.user.email}: ${content}`;
              addCommentToProj(projectName, Message);
              return res.json(`Commented On ${projectName} Successfully`);
          });
      }
  } catch (err) {
      return res.json(err);
  }
};

const getCommentsForProj = async function(req, res) {
  const { projectName } = req.body;
  try {
          const comments = CommentArrays[projectName] || [];
          return res.json(comments);
  } catch (err) {
      return res.json(err);
  }
};

module.exports = {
  searchByTerm,
  getItem,
  chatGPT,
  finishedproject,
  commentOnProj,
  getCommentsForProj,
  featuredproject,
  showevent,
  searchJobs,
  getJob
};
//sj