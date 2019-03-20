const express = require("express");
const router = express.Router();

const mongoose = require("mongoose");
const passport = require("passport");
//Post model
const Post = require("../../models/Post");
const Profile = require("../../models/Profile");
router.get("/test", (req, res) => {
 return res.json({ msg: "posts works" });
});
//Validation
const validatePostInput = require("../../validation/post");
//@route Delete api/posts
//@desc Get post
//@access Public
router.get("/", (req, res) => {
 Post.find()
  .sort({ data: -1 })
  .then(posts => {
   res.json(posts);
  })
  .catch(err => {
   res.status(404).json(err);
  });
});

//@route get api/posts/:id
//@desc get post by id
//@access Public
router.get("/:id", (req, res) => {
 Post.findById(req.params.id)
  .then(posts => {
   res.json(posts);
  })
  .catch(err => {
   res.status(404).json({ nopost: "No Post found" });
  });
});
//@route POST api/posts/:id
//@desc create post
//@access Public
router.post("/", passport.authenticate("jwt", { session: false }), (req, res) => {
 const { errors, isValid } = validatePostInput(req.body);
 //check validation
 if (!isValid) {
  return res.status(400).json(errors);
 }
 const newPost = new Post({
  text: req.body.text,
  name: req.body.name,
  avatar: req.body.avatar,
  user: req.user.id
 });
 newPost.save().then(post => {
  res.json(post);
 });
});

//@route Delete api/posts
//@desc delete post by id
//@access Private
router.delete("/:id", passport.authenticate("jwt", { session: false }), (req, res) => {
 Profile.findOne({ user: req.user.id }).then(profile => {
  Post.findById(req.params.id)
   .then(post => {
    //check for post owner
    if (post.user.toString() !== req.user.id) {
     return res.status(401).json({
      noauthorized: "You can only delete your own posts!"
     });
    }
    //delete
    post.remove().then(() => {
     res.json({ success: true });
    });
   })
   .catch(err => res.status(404).json({ postnotfound: "No post found" }));
 });
});

//@route POST api/posts/like/:id
//@desc like a post
//@access Private
router.post("/like/:id", passport.authenticate("jwt", { session: false }), (req, res) => {
 Profile.findOne({ user: req.user.id }).then(profile => {
  Post.findById(req.params.id)
   .then(post => {
    if (post.likes.filter(like => like.user.toString() === req.user.id).length > 0) {
     return res.status(400).json({ alreadyliked: "User already liked this post" });
    }
    //Add user id to likes array
    post.likes.unshift({ user: req.user.id });
    post.save().then(post => res.json(post));
   })
   .catch(err => res.status(404).json({ postnotfound: "No post found" }));
 });
});
//@route POST api/posts/unlike/:id
//@desc unlike a post
//@access Private
router.post("/unlike/:id", passport.authenticate("jwt", { session: false }), (req, res) => {
 Profile.findOne({ user: req.user.id }).then(profile => {
  console.log(profile);
  Post.findById(req.params.id)
   .then(post => {
    if (post.likes.filter(like => like.user.toString() === req.user.id).length == 0) {
     return res.status(400).json({ notliked: "You have not liked this post" });
    }
    //remove user id from likes array
    const removeIndex = post.likes.map(el => el.user.toString()).indexOf(req.user.id);
    //splice out of array
    post.likes.splice(removeIndex, 1);
    //post.status = "success";
    post.save().then(post => res.json(post));
   })
   .catch(err => res.status(404).json({ postnotfound: "No post found" }));
 });
});

//@route POST api/posts/comment/:id
//@desc add comment to a post
//@access Private
router.post("/comment/:id", passport.authenticate("jwt", { session: false }), (req, res) => {
 const { errors, isValid } = validatePostInput(req.body);
 //check validation
 if (!isValid) {
  return res.status(400).json(errors);
 }
 Post.findById(req.params.id).then(post => {
  const newComment = {
   text: req.body.text,
   name: req.body.name,
   avatar: req.body.avatar,
   user: req.user.id
  };
  //add to comments array
  post.comments.unshift(newComment);
  post
   .save()
   .then(post => {
    res.json(post);
   })
   .catch(err => res.status(404).json({ postnotfound: "No post found" }));
 });
});
//@route Delete api/posts/comment/:id
//@desc delete comment to a post
//@access Private
router.delete(
 "/comment/:id/:comment_id",
 passport.authenticate("jwt", { session: false }),
 (req, res) => {
  Post.findById(req.params.id).then(post => {
   if (post.comments.filter(el => el.user.toString() === req.user.id).length === 0) {
    res.status(404).json({ error: "You cannot delete other's comment" });
   }
   if (post.comments.filter(el => el.id.toString() === req.params.comment_id).length === 0) {
    return res.status(404).json({ commentnotexist: "Comment does not exist" });
   }
   const removeIndex = post.comments.map(el => el.toString()).indexOf(req.params.comment_id);
   post.comments.splice(removeIndex, 1);

   post
    .save()
    .then(post => {
     res.json(post);
    })
    .catch(err => res.status(404).json({ postnotfound: "No post found" }));
  });
 }
);
module.exports = router;
