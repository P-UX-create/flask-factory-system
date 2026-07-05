const { resetTokens } = require("../../stores/tokenStore");

const validateResetToken = (req, res, next) => {

  const { token } = req.body;

const tokenData = resetTokens.get(token);

console.log(token)
console.log(tokenData)
  if (!tokenData) {
    return res.status(400).json({
      message: "Invalid token",
    });
  }

  if (Date.now() > tokenData.expiresAt) {
    resetTokens.delete(token);

    return res.status(400).json({
      message: "Token has expired",
    });
  }

  // Make the token data available to the next middleware/controller
  req.tokenData = tokenData;

  next();
};

module.exports = validateResetToken;