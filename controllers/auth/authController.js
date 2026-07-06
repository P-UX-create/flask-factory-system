const bcrypt = require("bcrypt");
const { createUser, findByEmail, deleteAccount } = require("../../models/userModel");
const { sign }= require("jsonwebtoken");
const secret = process.env.JWT_SECRET;
const sendEmail = require("../../services/sendMail");
const loginTemplate = require("../../services/templates/loginTemplate");


const signUp = async(req, res) =>{

    try{
        
    const { email, password, username } = req.body;

    if(!email || !password || !username){
        res.status(400).json({
            message: "Required fields missing"
        });
        return;
    }

    const user = await findByEmail(email);


    if(user){
        return res.status(400).json({
            message: "Account already exists, please login"
        })
    }

    const hashPassword = await bcrypt.hash(password, 10);

  const { id, name, role } = await createUser({username: username, email: email, passwordHash: hashPassword})

  const token = sign({
    id,
    username
  },
secret,
{expiresIn: "30d"});

res.cookie("token", token, {
httpOnly: true,
secure: true,
sameSite: "strict",
maxAge: 30 * 24 * 60 * 60 * 1000
});

 res.status(201).json({
    message: "User created successfully",
 });
    }catch(e){
        res.status(500).json({
            message: "Internal server Error"
        });
        console.error(`Error creating user, ${e.message}`)
    }


}

// Login
const login = async (req, res) => {
    try {
        
        const { email, password } = req.body;

        if (!email || !password) {
            res.status(400).json({ message: "Required field missing" });
            return;
        }

        const user = await findByEmail(email);

        if (!user) {
            res.status(401).json({ message: "Account doesn't exist or has been deleted" });
            return;
        }
        
        const isMatched = await bcrypt.compare(password, user.password_hash);
        if (!isMatched) {
            res.status(401).json({ message: "Invalid credentials" });
            return;
        }

        const token = sign(
            { id: user.id, username: user.username, role: user.role },
            secret,
            { expiresIn: "30d" }
        );

        res.cookie("token", token, {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            maxAge: 30 * 24 * 60 * 60 * 1000
        });


const loginTime = new Date().toLocaleString("en-US", { timeZone: "UTC" }) + " UTC";
const device = req.headers["user-agent"] || "Unknown device";

let ipAddress = "Unknown";
const forwardedFor = req.headers["x-forwarded-for"];

if (forwardedFor) {

    ipAddress = forwardedFor.split(',')[0].trim();
} else {
    ipAddress = req.ip || req.socket.remoteAddress || "Unknown";
}


if (ipAddress.includes("::ffff:")) {
    ipAddress = ipAddress.replace("::ffff:", "");
}

let location = "Unknown";


const isLocalhost = ipAddress === "::1" || ipAddress === "127.0.0.1" || ipAddress === "Unknown";

if (!isLocalhost) {
    try {
        const geoRes = await fetch(`https://ipapi.co/${ipAddress}/json/`);
        
        if (geoRes.ok) {
            const geoData = await geoRes.json();
          
            if (geoData.city && geoData.country_name) {
                location = `${geoData.city}, ${geoData.country_name}`;
            } else if (geoData.error) {
                console.error("GeoIP API Error:", geoData.reason);
            }
        }
    } catch (error) {
        console.error("Geolocation fetch failed:", error);
        // location stays "Unknown"
    }
}

     sendEmail(email, "New Login Detected", loginTemplate({
            loginTime,
            device,
            ipAddress,
            location,
        })).catch((err) => {
            console.error("Login email failed to send:", err.message);
        });

        res.status(200).json({
            message: "Login successful"
        });

    } catch (e) {
        res.status(500).json({ message: "Internal server error" });
        console.error("Error logging in:", e.message);
    }
};

const deleteUser = async (req, res) => {
  try {
    await deleteAccount(req.user.id);

    res.clearCookie("token", {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
    });

    return res.redirect("/");
  } catch (error) {
    console.error("Error deleting user:", error);

    return res.status(500).json({
      message: "Failed to delete account",
    });
  }
};

module.exports = {signUp, login, deleteUser}
