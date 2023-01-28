exports.tokenVerify = async (req, res, next) => {
  try {
    const authorization = req.headers.authorization;
    if (!authorization) return res.status(401).send("Access denied");

    const token = authorization.split(" ")[1];
    if (!token) return res.status(401).send("Access denied");

    const decoded = await jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    next();
  } catch (error) {
    res.status(400).send("Invalid token");
  }
};
