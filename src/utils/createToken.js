const jwt = require("jsonwebtoken");

exports.createToken = async (data, options) => {
  const token = jwt.sign(data, process.env.JWT_KEY, options);

  return token;
};
