const blackListedTokens = require('../../stores/tokenBlacklist');
const { verify } = require("jsonwebtoken");
const secret = process.env.JWT_SECRET

async function validate(req, res, next) {

    try{
        
        const token = req.cookies?.token
   
    if( !token || blackListedTokens.has(token) ){
        res.status(401).json({
            message: "Unauthorized"
        });

        return;
    }

const user =  verify(token,secret);

req.user = user

next();

    }catch (e) {
        res.status(401).json({
            message: "Invalid token"
        })
    }
}

module.exports = validate