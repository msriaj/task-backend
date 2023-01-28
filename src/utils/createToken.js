const jwt = require("jsonwebtoken");

exports.createToken = async (data, options) => {
  const token = await jwt.sign(data, process.env.JWT_SECRET, options);
  return token;
};
