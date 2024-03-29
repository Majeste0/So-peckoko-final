const Sauce = require("../models/sauce");
const fs = require("fs");

exports.createSauce = (req, res, next) => {
  const sauceObject = JSON.parse(req.body.sauce);
  delete sauceObject._id;
  const sauce = new Sauce({
    ...sauceObject,
    imageUrl: `${req.protocol}://${req.get("host")}/images/${
      req.file.filename
    }`,
    likes: 0,
    dislikes: 0,
    usersLiked: [],
    usersDisliked: [],
  });
  sauce
    .save()
    .then(() => res.status(201).json({ message: "Sauce enregistré !" }))
    .catch((error) => res.status(400).json({ error }));
};

exports.getOneSauce = (req, res, next) => {
  Sauce.findOne({
    _id: req.params.id,
  })
    .then((sauce) => {
      res.status(200).json(sauce);
    })
    .catch((error) => {
      res.status(404).json({
        error: error,
      });
    });
};

exports.modifySauce = (req, res, next) => {
  const sauceObject = req.file
    ? {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get("host")}/images/${
          req.file.filename
        }`,
      }
    : { ...req.body };
  Sauce.updateOne(
    { _id: req.params.id },
    { ...sauceObject, _id: req.params.id }
  )
    .then(() => res.status(200).json({ message: "Sauce modifié !" }))
    .catch((error) => res.status(400).json({ error }));
};

exports.deleteSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      const filename = sauce.imageUrl.split("/images/")[1];
      fs.unlink(`images/${filename}`, () => {
        Sauce.deleteOne({ _id: req.params.id })
          .then(() => res.status(200).json({ message: "Sauce supprimé !" }))
          .catch((error) => res.status(400).json({ error }));
      });
    })
    .catch((error) => res.status(500).json({ error }));
};

exports.getAllStuff = (req, res, next) => {
  Sauce.find()
    .then((things) => {
      res.status(200).json(things);
    })
    .catch((error) => {
      res.status(400).json({
        error: error,
      });
    });
};

exports.like = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id }).then((sauce) => {
    if (req.body.like === 1) {
      Sauce.updateOne(
        {
          _id: req.params.id,
        },
        {
          $push: {
            usersLiked: req.body.userId,
          },
          $inc: {
            likes: +1,
          },
        }
      )
        .then(() =>
          res.status(200).json({
            message: "j'aime ajouté !",
          })
        )
        .catch((error) =>
          res.status(400).json({
            error,
          })
        );
    }
    if (req.body.like === -1) {
      Sauce.updateOne(
        {
          _id: req.params.id,
        },
        {
          $push: {
            usersDisliked: req.body.userId,
          },
          $inc: {
            dislikes: +1,
          },
        }
      )
        .then(() => {
          res.status(200).json({
            message: "Dislike ajouté !",
          });
        })
        .catch((error) =>
          res.status(400).json({
            error,
          })
        );
    }
    if (req.body.like === 0) {
      Sauce.findOne({
        _id: req.params.id,
      })
        .then((sauce) => {
          if (sauce.usersLiked.includes(req.body.userId)) {
            Sauce.updateOne(
              {
                _id: req.params.id,
              },
              {
                $pull: {
                  usersLiked: req.body.userId,
                },
                $inc: {
                  likes: -1,
                },
              }
            )
              .then(() =>
                res.status(200).json({
                  message: "Like retiré !",
                })
              )
              .catch((error) =>
                res.status(400).json({
                  error,
                })
              );
          }
          if (sauce.usersDisliked.includes(req.body.userId)) {
            Sauce.updateOne(
              {
                _id: req.params.id,
              },
              {
                $pull: {
                  usersDisliked: req.body.userId,
                },
                $inc: {
                  dislikes: -1,
                },
              }
            )
              .then(() =>
                res.status(200).json({
                  message: "Dislike retiré !",
                })
              )
              .catch((error) =>
                res.status(400).json({
                  error,
                })
              );
          }
        })
        .catch((error) =>
          res.status(404).json({
            error,
          })
        );
    }
  });
};
