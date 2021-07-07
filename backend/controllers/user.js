const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../models/user.js");
var sanitize = require("mongo-sanitize");

exports.signup = (req, res, next) => {
  console.log(req.body);
  var clean = sanitize(req.body);

  let regexpPassword = new RegExp(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{7,15}$/
  );
  let emailFilter = new RegExp(
    /^([a-zA-Z0-9_.-])+@(([a-zA-Z0-9-])+.)+([a-zA-Z0-9]{2,4})+$/
  );

  let ok = true;

  ok = ok && req.body && req.body.email;
  ok = ok && req.body && req.body.password;

  console.log("first ok : " + ok);
  console.log("current mail is : ", req.body.email);

  if (ok) {
    ok = ok && req.body.email.length > 0;
    ok = ok && req.body.password.length > 8;
    ok = ok && regexpPassword.test(req.body.password);
    ok = ok && emailFilter.test(req.body.email);

    console.log("second ok : " + ok);
    console.log("current mail is : ", req.body.email);

    if (ok) {
      bcrypt
        .hash(clean.password, 10)
        .then((hash) => {
          const user = new User({
            email: clean.email,
            password: hash,
          });
          user
            .save()
            .then(() => {
              res.status(201).json({ message: "Utilisateur créé !" });
            })
            .catch((error) => res.status(400).json({ error }));
        })
        .catch((error) => res.status(500).json({ error }));
    } else {
      res.status(500).json({ message: "Identifiants incorrects 2" });
    }
  } else {
    res.status(500).json({ message: "Identifiants incorrects" });
  }
};

exports.login = (req, res, next) => {
  var clean = sanitize(req.body);
  User.findOne({ email: clean.email })
    .then((user) => {
      if (!user) {
        return res.status(401).json({ error: "Utilisateur non trouvé !" });
      }
      bcrypt
        .compare(clean.password, user.password)
        .then((valid) => {
          if (!valid) {
            return res.status(401).json({ error: "Mot de passe incorrect !" });
          }
          res.status(200).json({
            userId: user._id,
            token: jwt.sign({ userId: user._id }, "RANDOM_TOKEN_SECRET", {
              expiresIn: "24h",
            }),
          });
        })
        .catch((error) => res.status(500).json({ error }));
    })
    .catch((error) => res.status(500).json({ error }));
};
