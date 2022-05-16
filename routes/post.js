const express = require('express');
const req = require('express/lib/request');
const route = express.Router();
const verifyToken = require('../middleware/auth');
const Post = require('../models/post_model');
const { updateNewsPosts } = require('./news');



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

route.post('/:id',verifyToken,(req,res) => {
    const newsId = req.params.id;
    const result = createPost(req.body);
    result
    .then( post => {    
        const updated = updateNewsPosts(newsId,post._id)
        updated.then( data =>
            res.json({
                ok: 200,
                post: post,
                news: data,
            })
        )
    })    .catch(err => {
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