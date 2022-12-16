const userModel = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

require("dotenv").config();
const SECRET_KEY = process.env.SECRET_KEY;

const signup = async (req, res) => {
	const { firstname, lastname, username, email, password } = req.body;
	try {
		// Check for existing User
		const existingUser = await userModel.findOne({ email: email });
		if (existingUser) {
			//return res.status(400).json({ message: "User already exixts." });
			req.flash("message", "User Already Exists");
			return res.status(400).redirect("/signup");
		} else {
			// Hash password
			const hashedPassword = await bcrypt.hash(password, 10);

			// User creation
			const newUser = await userModel.create({
				firstname: firstname,
				lastname: lastname,
				username: username,
				email: email,
				password: hashedPassword,
			});

			// Token generation
			const token = jwt.sign(
				{ email: newUser.email, id: newUser._id },
				SECRET_KEY
			);

			// Send response
			// res.status(201).json({ user: newUser, token: token });
			req.flash("message", "Successfully Registered");
			res.status(201).redirect("/signin");
		}
	} catch (error) {
		console.log(error);
		// res.status(500).json({ message: "Somethig went wrong." });
		req.flash("message", "Something Went Wrong");
		res.status(500).redirect("/signup");
	}
};

const signin = async (req, res) => {
	const { email, password } = req.body;
	try {
		// Check for existing User
		const existingUser = await userModel.findOne({ email: email });
		if (existingUser) {
			// Match hashed password
			const matchPassword = await bcrypt.compare(
				password,
				existingUser.password
			);
			if (matchPassword) {
				currentSession = req.session;
				currentSession.firstname = existingUser.firstname;
				currentSession.lastname = existingUser.lastname;
				currentSession.email = existingUser.email;
			} else {
				// return res.status(400).json({ message: "Invalid credentials." });
				req.flash("message", "Invalid Credentials");
				res.status(400).redirect("/signin");
			}
		} else {
			// return res.status(404).json({ message: "User not found." });
			req.flash("message", "User Not Found");
			return res.status(404).redirect("/signin");
		}

		// Token generation
		const token = jwt.sign(
			{ email: existingUser.email, id: existingUser._id },
			SECRET_KEY
		);

		// Send response
		// res.status(201).json({ user: existingUser, token: token });
		req.flash("message", "Successfully Logged In");
		res.status(201).render("index.ejs", {
			name: existingUser.firstname + " " + existingUser.lastname,
		});
	} catch (error) {
		console.log(error);
		res.status(500).redirect("/signin");
	}
};

const signout = (req, res) => {
	req.session.destroy((error) => {
		if (error) {
			console.log(error);
		} else {
			res.status(200).redirect("/signin");
		}
	});
};

module.exports = { signup, signin, signout };
