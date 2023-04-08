const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const requireLogin = require("../middleware/requireLogin");
const Post = mongoose.model("Post");
const User = mongoose.model("User");

router.get(`/user/:id`, requireLogin, (req, res) => {
  User.findOne({ _id: req.params.id })
    .select("-password")
    .then((user) => {
      Post.find({ postedBy: req.params.id })
        .populate("postedBy", "_id name")
        .then((posts) => {
          res.json({ user, posts });
        })
        .catch((err) => {
          return res.status(422).json(err);
        });
    })
    .catch((err) => {
      return res.status(404).json({ error: "User Not Found" });
    });
});

router.put("/follow", requireLogin, (req, res) => {
  User.findByIdAndUpdate(
    req.body.followId,
    {
      $push: { followers: req.user._id },
    },
    { new: true }
  )
    .then((result) => {
      User.findByIdAndUpdate(
        req.user._id,
        {
          $push: { following: req.body.followId },
        },
        { new: true }
      )
        .select("-password")
        .then((result) => {
          res.json(result);
        })
        .catch((err) => {
          return res.status(422).json({ error: err });
        });
    })
    .catch((err) => {
      return res.status(422).json({ error: err });
    });
});

router.put("/unfollow", requireLogin, (req, res) => {
  User.findByIdAndUpdate(
    req.body.unfollowId,
    {
      $pull: { followers: req.user._id },
    },
    { new: true }
  )
    .then((result) => {
      User.findByIdAndUpdate(
        req.user._id,
        {
          $pull: { following: req.body.unfollowId },
        },
        { new: true }
      )
        .select("-password")
        .then((result) => {
          res.json(result);
        })
        .catch((err) => {
          return res.status(422).json({ error: err });
        });
    })
    .catch((err) => {
      return res.status(422).json({ error: err });
    });
});

router.put("/updatepic", requireLogin, (req, res) => {
  User.findByIdAndUpdate(
    req.user._id,
    { $set: { pic: req.body.pic } },
    { new: true }
  )
    .then((result) => {
      res.json(result);
    })
    .catch((err) => {
      return res.status(422).json({ error: "Pic cannot post" });
    });
});

router.put("/edituser/:userId", requireLogin, (req, res) => {
  const { name, email, password, pic } = req.body;
  const { userId } = req.params;

  if (!email || !password || !name) {
    return res.status(422).json({ error: "Please add all the fields" });
  }
  User.findOne({ email: email })
    .then((savedUser) => {
      if (savedUser) {
        return res
          .status(422)
          .json({ error: "User already exists with that email" });
      }
      bcrypt.hash(password, 10).then((hashedpassword) => {
        const update = {
          email,
          password: hashedpassword,
          name,
          pic,
        };

        User.findOneAndUpdate(userId, update, { new: true })
          .then((user) => {
            res.json({ message: "User Edited successfully" });
          })
          .catch((err) => {
            console.log(err);
          });
      });
    })
    .catch((err) => {
      console.log(err);
    });
});

router.delete(`/deleteuser`, requireLogin, (req, res) => {
  User.deleteOne({ _id: req.user._id })
    .then((result) => {
      Post.deleteMany({ postedBy: req.user._id })
        .then((result) => {
          return res.json({ message: "User Deleted" });
        })
        .catch((err) => {
          console.log(err);
        });
    })
    .catch((err) => {
      console.log(err);
    });
});

module.exports = router;
