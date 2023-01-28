const { ObjectId } = require("mongodb");
const { getDb } = require("../database/db");
const { createToken } = require("../utils/createToken");
const { timeStamp } = require("../utils/timestamp");
const { authValidate } = require("../validators/validate");

exports.register = async (req, res) => {
  try {
    const User = await getDb().collection("users");

    const isDataValid = authValidate(req.body);
    if (isDataValid.error) return res.status(400).send(isDataValid.error.details[0].message);

    const data = isDataValid.value;

    // check if email already exist
    const isExist = await User.findOne({ email: data.email });
    if (isExist) return res.status(400).send("Email already exist");

    // hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(data.password, salt);

    // save user
    const save = await User.insertOne({ ...data, password: hashedPassword, createdAt: timeStamp() });
    if (!save) return res.status(400).send("Something went wrong");

    res.send({ status: "success", message: "User registered successfully" });
  } catch (error) {
    res.status(500).send(error.message);
  }
};
