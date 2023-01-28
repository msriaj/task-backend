const { ObjectId } = require("mongodb");
const { getDb } = require("../database/db");
const { createToken } = require("../utils/createToken");
const { timeStamp } = require("../utils/timestamp");
const { authValidate, registerValidate, loginValidate } = require("../validators/validate");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
  try {
    const User = await getDb().collection("users");

    const isDataValid = registerValidate(req.body);
    if (isDataValid.error) return res.status(400).send(isDataValid.error.details[0].message);

    const { email, password } = isDataValid.value;

    // check if email already exist
    const isExist = await User.findOne({ email });
    if (isExist) return res.status(400).send("Email already exist");

    // hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // save user
    const save = await User.insertOne({ email, password: hashedPassword, createdAt: timeStamp() });
    if (!save) return res.status(400).send("Something went wrong");

    // create token
    const token = await createToken({ email }, { expiresIn: "30d" });
    const decode = await jwt.verify(token, process.env.JWT_SECRET);

    const userInfo = { email, token, expiresAt: decode.exp };

    res.send({ status: "success", userInfo, message: "User registered successfully" });
  } catch (error) {
    res.status(500).send(error.message);
  }
};

exports.login = async (req, res) => {
  try {
    const User = await getDb().collection("users");

    const isDataValid = loginValidate(req.body);
    if (isDataValid.error) return res.status(400).send(isDataValid.error.details[0].message);

    const { email, password } = isDataValid.value;

    // check if email exist
    const isExist = await User.findOne({ email });
    if (!isExist) return res.status(400).send("Invalid  Email/password");

    // compare password
    const isPasswordValid = await bcrypt.compare(password, isExist.password);
    if (!isPasswordValid) return res.status(400).send("Invalid Email/password");

    // create token
    const token = await createToken({ email }, { expiresIn: "30d" });
    const decode = await jwt.verify(token, process.env.JWT_SECRET);

    const userInfo = { email, token, expiresAt: decode.exp };

    res.send({ status: "success", userInfo, message: "User logged in successfully" });
  } catch (error) {
    res.status(500).send(error.message);
  }
};
