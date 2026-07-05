const transport = require("./mailer");
const path = require("path");



module.exports = async (to, subject, html) => {
  
  try {
    await transport.sendMail({
  from: process.env.GMAIL_USER,
  to,
  subject,
  html
});

  } catch (error) {
    console.error(error.message)
    throw new Error(`Error sending mail: ${error.message}`);
  }
};
