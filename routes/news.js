const express = require('express');
const req = require('express/lib/request');
const route = express.Router();
const verifyToken = require('../middleware/auth');
const News = require('../models/news_model');



route.get('/', verifyToken, (req,res) => {
    const result = getNews();
    result
    .then( news => res.json(news))
    .catch(err => {
        res.status(400).json({
            err
        })
    });
})

route.post('/',verifyToken,(req,res) => {
    const result = createNews(req);
    result
    .then( data => res.json(data))
    .catch(err => {
        res.status(400).json({
            err
        })
    });
})

route.put('/:id', verifyToken, (req, res) => {
    const newsId = req.params.id;
    const data = req.body.id

    let result = updateNewsPosts(newsId,data);

    result.then( data =>
        res.json(data)
    )
    .catch(err => {
        res.status(400).json({
            msg :'Bad Request',
            err
        })
    });
});

route.put('/:version/:id', verifyToken,(req, res) => {
    const newsId = req.params.id;
    const version = req.params.version

    let result = updateVersion(newsId,version);

    result.then( data =>
        res.json(data)
    )
    .catch(err => {
        res.status(400).json({
            msg :'Bad Request',
            err
        })
    });
});

async function updateVersion(newsId, version){
    return await News.findOneAndUpdate({_id:newsId}, { version },{new:true})
}

async function getNews(){
    return await (await News.find().select('-__v').populate('posts'));
}

async function createNews(req){
    let paper = new News({
        title          : req.body.title,
        version        : req.body.version,
    });
    return await paper.save();
}

async function updateNewsPosts(newsId,postId){
    if(!newsId){
        throw new Error(err);
    }

    let paper = await News.findByIdAndUpdate({_id:newsId}, {
        $push:{
            posts : postId
        }
    },{new:true});
    
    return paper;
}

module.exports = {route,updateNewsPosts};