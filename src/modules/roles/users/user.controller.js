const connection = require('../../../../DB/connection');
const bcrypt = require('bcrypt');

const updateuser = async (request, response) => {
    const {...otherUpdates} = request.body;
    const userEmail = request.params.email; // Correctly access email from request parameters

    if (request.user.role === 'organizer') {
        return response.status(401).json("You cannot access this page");
    }
     else if (request.user.role === 'crafter') {
        const sql = `UPDATE users SET ${Object.entries(otherUpdates).map(([key, value]) => `${key} = "${value}"`).join(', ')} WHERE email = '${request.user.email}';`;
        connection.execute(sql,  (error, results) => {
            if (error) {
                return response.status(500).json(error)
            }
            return response.status(200).json({ message: "Updated successfully" });
        })
    } else {
        return response.status(400).json("Unknown role");
    }
};

const join = async (req, res) => {
    try{
        const user_email = req.user.email;
    const {project_title } = req.body;
    if(req.user.role !='crafter'){
        return response.json("you cannot access this page")
    }
    const sqll= `select skills from users where email = "${user_email}"`
    connection.execute(sqll,(err,ressl)=>{
        
        const sqll2= `select skills from project where title = "${project_title }"`
        connection.execute(sqll2,(err,ress2)=>{
              if(ressl[0].skills==ress2[0].skills){
                const sql2 = `SELECT NumofMem, size FROM project WHERE title="${project_title}"`;
      
    connection.execute(sql2, (err, result) => {
      if (err) {
        return res.json(err);
      }
  
      if (result[0].size > result[0].NumofMem) {
       
        const sql = 'INSERT INTO collaboration (user_email, project_title) VALUES (?, ?)';
        const values = [user_email, project_title];
    
        connection.execute(sql,values, (error, resultt) => {
            if (error) {
               if (error.errno==1062){
                return res.json({massege : "You already sent join request"})
               }
                    return res.json( error) ;
            }
            return res.status(201).json({ message: 'Join request sent successfully' });
        });
      }
    else
      return res.json({ message: 'this project is full'})
})
              }else 
              return res.json({massege: "you dont have the required skills"})
        })
    })
    
}
catch(err){
    const error =err.stack ;
    return res.json({error});

}
};

const shownotification = async (req, res) => {
    try {
        if (req.user.role !== 'crafter') {
            return res.json("You cannot access this page");
        }
        const userEmail = req.user.email;
        const sql = ` SELECT project_title, status  FROM collaboration WHERE user_email = ? `;

        connection.execute(sql, [userEmail], (err, results) => {
            if (err) {
                return res.status(500).json(err.stack);
            }
            if(results.length==0){
                return res.json({message:"no notification"})
            }
            // for task //
            const sql5= `select * from task`
            connection.execute(sql5,(erre,reu)=>{
                
                const matchingObjects = reu.filter(obj2 =>
                    results.some(obj1 => obj1.project_title === obj2.Project_title)
                  );
            const concatenatedArray = results.concat(matchingObjects);
            return res.json({ notification: concatenatedArray });
            })
            

            //end task 
        });
    } catch (err) {
        return res.status(500).json({ error: "Internal server error" });
    }
};
//
const match = async function (req, res) {
    try {
        if (req.user.role !== 'crafter') {
            return res.json("You cannot access this page");
        }

        const email = req.user.email;

        const sql1 = `SELECT skills, intrests FROM users WHERE email = "${email}"`;
        connection.execute(sql1, (err, rlt) => {
         
            if (err) {
                console.log("Error executing SQL query:", err);
                return res.status(500).json({ error: "Database error" });
            }

            const userskills = rlt[0].skills;
            const intrests = rlt[0].intrests;

            const sql2 = `SELECT email, skills FROM users WHERE skills = ? or intrests = ? AND email != ? AND role!="organizer"`;

            connection.execute(sql2, [userskills, intrests, email], (err, results) => {
                if (err) {
                    console.log("Error executing SQL query:", err);
                    return res.status(500).json({ error: "Database error" });
                }

                if (results.length === 0) {
                    return res.json({ message: "No matching crafters found" });
                }

                return res.json({ Matching_Crafters: results });
            });
        });
    } catch (err) {
        console.log("Internal server error:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
};
const informations=async function (req,res){
    const user_email=req.params.useremail
    const sql=`SELECT UserName,email,skills,intrests from users where email="${user_email}" AND role="crafter"`
    connection.execute(sql,(error,result)=>{
    if (error) {
        return response.json(error);
    }

else {
   return res.json({result});
}
  })

}
const LendCenter = async (req, res) => {
    if (req.user.role !== 'crafter') {
        return res.json("You cannot access this page");
    }
    
    const { Material, Quantity, title } = req.body;
    const email = req.user.email;
     
    const sql = `SELECT project_title FROM collaboration WHERE user_email='${email}'`;

    connection.execute(sql, (err, result) => {
        if (err) {
            return res.json({massege : "you are already added this material"});
        }

        // Check if the result array has at least one item
        if (result.length > 0) {
            // Check if the specified project is among the user's projects
            const joinedProjects = result.map(entry => entry.project_title);
            
            if (joinedProjects.includes(title)) {
                const sql2 = `INSERT INTO material (NameOfMaterial, Crafte_email, project_title, Quantity)
                              VALUES ('${Material}', '${email}', '${title}', '${Quantity}')`;

                connection.execute(sql2, (err, result) => {
                    if (err) {
                        return res.json(err.stack);
                    }
                    return res.json({ message: "Material added successfully" });
                });
            } else {
                return res.json({ message: "You haven't joined this project" });
            }
        } else {
            return res.json({ message: "You haven't joined any projects or your request pendding" });
        }
    });
}

const LendMaterial = async (req, res) => {
    if (req.user.role !== 'crafter') {
        return res.json("You cannot access this page");
    }

    const email = req.user.email;

    const sql1 = `SELECT project_title FROM collaboration WHERE user_email="${email}"`

    connection.execute(sql1, (err, projects) => {
        if (err) {
            console.error("Error fetching projects:", err);
            return res.status(500).json("Internal server error");
        }
        const projectTitles = projects.map(row => row.project_title);

        const materialsPromises = projectTitles.map(project_title => {
            const sql2 = `SELECT * FROM material WHERE project_title="${project_title}"`;
            return new Promise((resolve, reject) => {
                connection.execute(sql2, (err, materials) => {
                    if (err) {
                        console.error(`Error fetching materials for project ${project_title}`, err);
                        reject(err);
                    } else {
                        if(materials.length==0)return res.json({massege : "no one in your collaboration has lend any materials to me"})
                        resolve(materials);

                    }
                });
            });
        });

        // Resolve all promises
        Promise.all(materialsPromises)
            .then(materials => {
                // Combine materials from all projects into a single array
                const allMaterials = [].concat(...materials);
                res.json(allMaterials);
            })
            .catch(err => {
                console.error("Error fetching materials:", err);
                res.status(500).json("Internal server error");
            });
    });
}
const chooseMaterial = async (req, res) => {
    try {
        if (req.user.role !== 'crafter') {
            return res.json("You cannot access this page");
        }

        const { material, email } = req.body;

        // Check if the user already has the material
        const selectMaterialsSql = 'SELECT materials FROM users WHERE email = ?';
        connection.execute(selectMaterialsSql, [req.user.email], (err, result) => {
            if (err) {
                return res.json({ message: "Error checking user materials" });
            }

            const arrMat = result[0].materials.split(',');

            if (arrMat.includes(material)) {
                return res.json({ message: "You already have this material, and you cannot borrow it." });
            } else {
                // Update user materials
                arrMat.push(material);
                const resultString = arrMat.join(',');
                const updateMaterialsSql = 'UPDATE users SET materials = ? WHERE email = ?';
                connection.execute(updateMaterialsSql, [resultString, req.user.email], (err) => {
                    if (err) {
                        return res.json({ message: "Error updating user materials" });
                    }

                    // Update material quantity
                    const updateMaterialSql = 'UPDATE material SET Quantity = Quantity - 1 WHERE Crafte_email = ? and NameOfMaterial = ?';
                    connection.execute(updateMaterialSql, [email, material], (err) => {
                        if (err) {
                            return res.json({ message: "Error updating material quantity" });
                        }

                        // Check if the material quantity is now 0 and delete if necessary
                        const selectQuantitySql = 'SELECT Quantity FROM material WHERE Crafte_email = ? and NameOfMaterial = ?';
                        connection.execute(selectQuantitySql, [email, material], (err, re) => {
                            if (err) {
                                return res.json({ message: "Error checking material quantity" });
                            }

                            if (re[0].Quantity === 0) {
                                const deleteMaterialSql = 'DELETE FROM material WHERE Crafte_email = ? and NameOfMaterial = ?';
                                connection.execute(deleteMaterialSql, [email, material], (err) => {
                                    if (err) {
                                        return res.json({ message: "Error deleting material" });
                                    }
                                    return res.json({ message: "Material borrowed successfully!" });
                                });
                            } else {
                                return res.json({ message: "Material borrowed successfully!" });
                            }
                        });
                    });
                });
            }
        });
    } catch (err) {
        return res.json({ message: err.message });
    }
};
const statusTask = async (req, res) => {
    if (req.user.role !== 'crafter') {
        return res.status(401).json("You cannot access this page");
    }

    const { status, TaskName, Project_title } = req.body;

    try {
        if (status === 'done') {
            const s=`select NumofCrafterDoneTask from task where TaskName ="${TaskName}" and Project_title ="${Project_title}" `
            connection.execute(s,(err,re)=>{
                if(!re.affectedRows)return res.json({ massege:"no user found" });
                const sql = `update task set NumofCrafterDoneTask=(${re[0].NumofCrafterDoneTask} + 1 ) where TaskName ="${TaskName}" and Project_title ="${Project_title}"` 
                connection.execute(sql, (err, result) => {
                    
                    if (err) {
                        console.error('Error executing the query:', err);
                        return res.status(500).json({ error: 'Internal Server Error' });
                    }
                     if(!result.affectedRows){
                        return res.status(400).json({ massege:" no tasks associated with the specified parameters" });
                     }
                    return res.status(200).json({ message: "Good job!" });
                });
            })           
            
        } else {
            return res.json({ message: "Invalid status value" });
        }
    } catch (err) {
        console.error('Error in the try-catch block:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

module.exports = {statusTask,updateuser,join,shownotification,match,informations,LendCenter,LendMaterial,chooseMaterial} ;
