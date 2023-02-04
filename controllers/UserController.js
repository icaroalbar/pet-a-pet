const User = require("../models/User");
const { json } = require("express");
const bcrypt = require("bcrypt");
const createUserToken = require("../helpers/create-user-token");
const getToken = require("../helpers/get-token");
const jwt = require("jsonwebtoken");
const getUserByToken = require('../helpers/get-user-by-token')

module.exports = class UserController {
  static async register(req, res) {
    const { name, email, phone, password, confirmPassword } = req.body;

    if (!name) {
      res.status(422).json({ message: "O nome é obrigatório." });
      return;
    }

    if (!email) {
      res.status(422).json({ message: "O e-mail é obrigatório." });
      return;
    }

    if (!phone) {
      res.status(422).json({ message: "O telefone é obrigatório." });
      return;
    }

    if (!password) {
      res.status(422).json({ message: "A senha é obrigatória." });
      return;
    }

    if (!confirmPassword) {
      res
        .status(422)
        .json({ message: "A confirmação de senha é obrigatório." });
      return;
    }

    if (password !== confirmPassword) {
      res.status(422).json({
        message: "A senha e a confirmação de senha precisam ser iguais.",
      });
      return;
    }

    const userExists = await User.findOne({ email: email });

    if (userExists) {
      res.status(422).json({
        message: "O e-mail já está cadastrado. Por favor, utilize outro e-mail",
      });
      return;
    }

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = new User({
      name,
      email,
      phone,
      password: passwordHash,
    });

    try {
      const newUser = await user.save();
      await createUserToken(newUser, req, res);
    } catch (error) {
      res.status(500), json({ message: error });
    }
  }

  static async login(req, res) {
    const { email, password } = req.body;

    if (!email) {
      res.status(422).json({ message: "O e-mail é obrigatório." });
      return;
    }

    if (!password) {
      res.status(422).json({ message: "A senha é obrigatória." });
      return;
    }

    const user = await User.findOne({ email: email });

    if (!user) {
      res.status(422).json({
        message: "O e-mail não está cadastrado.",
      });
      return;
    }

    const checkPassword = await bcrypt.compare(password, user.password);

    if (!checkPassword) {
      res.status(422).json({
        message: "Senha inválida!",
      });
      return;
    }

    await createUserToken(user, req, res);
  }

  static async checkUser(req, res) {
    let currentUser;

    if (req.headers.authorization) {
      const token = getToken(req);
      const decoded = jwt.verify(token, "nossosecret");

      currentUser = await User.findById(decoded.id);

      currentUser.password = undefined;
      return
    } else {
      currentUser = null;
    }

    res.status(200).send(currentUser);
  }

  static async getUserById(req, res) {
    const id = req.params.id;
    const user = await User.findById(id).select("-password");

    if (!user) {
      res.status(422).json({ message: "Usuário não encontrado!" });
      return;
    } else {
      res.status(200).json({ user });
    }
  }

  static async editUser(req, res) {
    req.params.id;

    const token = getToken(req);
    const user = await getUserByToken(token);

    const { name, password, phone, confirmPassword } = req.body;

    let image = "";

    if (req.file) {
      image = req.file.filename;
      return
    }

    user.name = name;
    user.phone = phone;

    if (image) {
      const imageName = req.file.filename;
      user.image = imageName;
      return
    }

    if (password !== confirmPassword) {
      res
        .status(422)
        .json({
          message: "O campo senha e confirmação de senha precisam ser iguais",
        });
        return
    } else if (password === confirmPassword && password != null) {
      const salt = await bcrypt.genSalt(12);
      const passwordHash = await bcrypt.hash(password, salt);

      user.password = passwordHash;
    }

    if (confirmPassword !== password) {
      res
        .status(422)
        .json({
          message: "O campo senha e confirmação de senha precisam ser iguais",
        });
        return
    } else if (password === confirmPassword && password != null) {
      const salt = await bcrypt.genSalt(12);
      const passwordHash = await bcrypt.hash(password, salt);

      user.password = passwordHash;
    }

    try {
      await User.findOneAndUpdate(
        { _id: user._id },
        { $set: user },
        { new: true }
      );

      res.status(200).json({message: "Usuário atualizado com sucesso!"});
    } catch (error) {
      res.staus(500).console.log(error);
      return;
    }
  }
};