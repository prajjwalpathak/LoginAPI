const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const session = require("express-session");
const flash = require("express-flash");
const { signup, signin, signout } = require("./controllers/userController");
const app = express();

require("dotenv").config();
const PORT = process.env.PORT;
const SESSION_KEY = process.env.SESSION_KEY;

// middlewares
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname + "/public")));
app.use(flash());
app.use(
	session({
		secret: SESSION_KEY,
		resave: true,
		saveUninitialized: false,
	})
);

app.set("views", "./views");
app.set("view-engine", "ejs");
mongoose.set("strictQuery", true);

// db Connection
mongoose
	.connect("mongodb://localhost:27017/login_api_db")
	.then(() => {
		app.listen(PORT, () => {
			console.log(`Server runnung on port ${PORT}`);
		});
	})
	.catch((error) => {
		console.log(error);
	});

// routes
app.get("/", (req, res) => {
	if (req.session.email) {
		res.render("index.ejs", {
			name: "World",
			message: req.flash("message"),
		});
	} else {
		res.status(500).redirect("/signin");
	}
});

app.get("/signup", (req, res) => {
	res.render("signup.ejs", { message: req.flash("message") });
});

app.get("/signin", (req, res) => {
	res.render("signin.ejs", { message: req.flash("message") });
});

app.get("/logout", signout);
app.post("/signup", signup);
app.post("/signin", signin);
