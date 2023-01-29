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
    //get total payable amount
    const Bill = await getDb().collection("bills");

    const totalPayable = await Bill.aggregate([
      {
        $match: {
          isDeleted: false,
        },
      },
      {
        $group: {
          _id: null,
          totalPayable: {
            $sum: "$payableAmount",
          },
        },
      },
    ]).toArray();

    console.log(totalPayable);
    userInfo.totalPayable = totalPayable[0].totalPayable;

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

    const Bill = await getDb().collection("bills");
    if (Bill) {
      const totalPayable = await Bill.aggregate([
        {
          $match: {
            isDeleted: false,
          },
        },
        {
          $group: {
            _id: null,
            totalPayable: {
              $sum: "$payableAmount",
            },
          },
        },
      ]).toArray();

      userInfo.totalPayable = totalPayable[0]?.totalPayable;
    }

    res.send({ status: "success", userInfo, message: "User logged in successfully" });
  } catch (error) {
    res.status(500).send(error.message);
  }
};

exports.checkToken = async (req, res) => {
  try {
    const authorization = req.headers.authorization;
    if (!authorization) return res.status(401).send("Access denied");

    const token = authorization.split(" ")[1];
    if (!token) return res.status(401).send("Access denied");

    const decode = await jwt.verify(token, process.env.JWT_SECRET);

    const { email, exp } = decode;
    const userInfo = { user: email, expiresAt: exp };
    const Bill = await getDb().collection("bills");
    const totalPaid = await Bill.aggregate([
      {
        $match: {
          isDeleted: false,
        },
      },
      {
        $group: {
          _id: null,
          totalPayable: {
            $sum: "$payableAmount",
          },
        },
      },
    ]).toArray();

    const totalPayable = totalPaid[0]?.totalPayable;

    res.send({ status: "success", ...userInfo, totalPayable, message: "User logged in successfully" });
  } catch (error) {
    console.log(error.message);
    res.status(400).send("Invalid token");
  }
};
