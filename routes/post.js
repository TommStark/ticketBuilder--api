const express = require('express');
const req = require('express/lib/request');
const route = express.Router();
const verifyToken = require('../middleware/auth');
const Post = require('../models/post_model');



route.get('/', verifyToken, (req,res) => {
    const result = getPosts();
    result
    .then( post => res.json(post))
    .catch(err => {
        res.status(400).json({
            err
        })
    });
})

route.post('/',verifyToken,(req,res) => {
    const result = createPost(req.body);
    result
    .then( data => res.json(data))
    .catch(err => {
        res.status(400).json({
            err
        })
    });
})

async function getPosts(){
    return await Post.find();
}

async function createPost(data){
    let post = new Post({
        body          : data.text,
        color         : data.color,
        title         : data.title,
    });

    return await post.save();
}

module.exports = route;