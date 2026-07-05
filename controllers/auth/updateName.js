const { updateName } = require("../../models/userModel");

const updateUsername = async (req, res) =>{
 
    try {
           const user = req.user;
           const { username } = req.body;
           
           if(!username) {
            return res.status(400).json({
                message: "Required Field missing"
            });
           }

           await updateName(user.id, username);
        
           res.status(200).json({
            message: "Username updated successfully"
           })
    } catch (error) {
          res.status(500).json({
            message: "Internal server error"
        })
        console.error(`Error updating name, ${error.message}`)
    }
    }

    module.exports ={
        updateUsername
    }