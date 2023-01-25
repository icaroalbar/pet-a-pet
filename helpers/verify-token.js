const jwt = require("jsonwebtoken");
const getToken = require("./get-token");

const checkToken = (req, res, next) => {
  if (!req.headers.authorization) return res.status(401).json({message: "Acesso negado! 1"});

  const token = getToken(req);

  if (!token) return res.status(401).json({message: "Acesso negado! 2"});

  try {
    const verifed = jwt.verify(token, "nossosecret");
    req.user = verifed;
    next();
  } catch (error) {
    return res.status(401).json({message: "Token inválido!"});
  }
};

module.exports = checkToken;
