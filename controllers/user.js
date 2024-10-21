const { response } = require("express");
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require('dotenv').config();
// var nodemailer = require('nodemailer');//importing node mailer
const jwtSecret = process.env.JWT_SECRET;

// console.log("jwtSecret is :", jwtSecret);
exports.getUser = async (req, res, next) => {
    try {
        const { userEmailId, password } = req.body;
        const user = await User.findOne({ userEmailId });
        if (!user) {
            return res.status(401).json({ error: "User does not exist" });
        }
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(400).json({ error: "Invalid password" });
        }
        const token = jwt.sign({ id: user._id, email: user.userEmailId }, jwtSecret, { expiresIn: '1h' });
        res.status(200).json({
            message: "Login successful",
            user: {
                userName: user.userName,
                userEmailId: user.userEmailId,
                groupsInvolved: user.groupsInvolved,
            },
            token
        });
    } catch (error) {
        next(error);
    }
};

exports.createUser = async (req, res, next) => {
    try {
        const { userEmailId, userName, mobileNumber, password } = req.body;
        if (!userEmailId || !userName || !mobileNumber || !password) {
            return res.status(400).json({ error: "All fields are required" });
        }
        const existingUser = await User.findOne({ userEmailId });
        if (existingUser) {
            return res.status(400).json({ error: "User already exists. Please log in." });
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newUser = await User.create({
            userEmailId,
            userName,
            mobileNumber,
            password: hashedPassword
        });
        const token = jwt.sign({ id: newUser._id, email: newUser.userEmailId }, jwtSecret, { expiresIn: '1h' });
        res.status(201).json({ message: "User created successfully", token });
    } catch (error) {
        next(error);
    }
};


exports.updateUser = async (req, res, next) => {
    await User.findOneAndUpdate({ userEmailId: req.body.userEmailId }, req.body, {
        new: true,
    })
        .then((response) => {
            res.status(200).json({
                code: 200,
                message: response
                    ? "User updated successfully"
                    : "Either User was not updated or UserId does not exist",
            });
        })
        .catch((err) => {
            res.json(err);
        });
};

