async function logOut(req, res) {

    try{
        console.log("logging out")

    res.clearCookie("token", {
        httpOnly: true,
        secure: true,
        sameSite: "strict"
    });

    res.status(204).json({
        message: "Logged out successfully."
    });

    }catch (e) {
        res.status(500).json({
            message: "Internal server error"
        })
        console.error(`Error Logging out, ${e.message}`)
    }
}

module.exports = {
    logOut
}