const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");

const mainRoute = require("./routes/mainRoute");
const authRoute = require ("./routes/authRoute");
const dashboardRoute = require ("./routes/dashboardRoute");
const historyRoute = require ("./routes/historyRoute");
const brandRoute = require ("./routes/brandRoute");
const productRoute = require ("./routes/productRoute");
const apiRoute = require("./routes/apiRoute");


const requireAuth = require("./middlewares/requireAuth")

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

app.use("/", mainRoute);
app.use("/auth", authRoute);
app.use("/dashboard",requireAuth, dashboardRoute);
app.use("/brands", requireAuth, brandRoute);
app.use("/history", requireAuth, historyRoute);
app.use("/products", requireAuth, productRoute);
app.use("/api", requireAuth, apiRoute);

module.exports = app;
