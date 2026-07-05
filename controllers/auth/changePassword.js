const { resetTokens } = require("../../stores/tokenStore");
const { findByEmail, updatePassword } = require("../../models/userModel");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const sendEmail = require("../../services/sendMail");
const resetTemplate = require("../../services/templates/tokenTemplate");


const forgotPassword = async (req, res) => {

    try{

    const { email } = req.body;

    if (!email) {
        return res.status(400).json({
            message: "Email required"
        });
    }


const user = await findByEmail(email)
    
    if(!user){
        return res.status(404).json({
            message: "Email doesn't exist"
        });
    }
    
    const token = crypto.randomBytes(32).toString("hex");

    resetTokens.set(token, {
        userId: user.id,
        expiresAt: Date.now() + 1000 * 60 * 5
    });
    
    const domain = `${req.protocol}://${req.get("host")}/reset?token=${token}`;

    await sendEmail(email, "Password Reset", resetTemplate(domain));
    res.status(201).json({
        message: "Reset link generated."
    });


    }catch (e) {
        res.status(500).json({
            message: "Internal server error"
        })
        console.error(`Error requesting link out, ${e.message}`)
    }
}


const resetPassword =  async (req, res) => {

    try{


    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
        return res.status(400).json({
            message: "Required fields missing"
        });
    }

    const data = resetTokens.get(token);

    if (!data) {
        return res.status(400).json({
            message: "Token is invalid or expired. Please request a fresh link"
        });
    }

    if (Date.now() > data.expiresAt) {

        resetTokens.delete(token);

        return res.status(400).json({
            message: "Token expired"
        });

    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

  const result =  await updatePassword(hashedPassword, data.userId);

    resetTokens.delete(token);

    res.status(200).json({
        message: "Password changed successfully, please re-login."
    });

    }catch (e) {
        res.status(500).json({
            message: "Internal server error"
        })
        console.error(`Error reseting password, ${e.message}`)
    }
}

module.exports = {
    resetPassword,
    forgotPassword
}