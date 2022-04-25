const express = require('express');
const jwt = require('jsonwebtoken');
const route = express.Router();
const Author = require('../models/author_model');
const bcrypt = require('bcrypt');
const config = require('config');
const verifyToken = require('../middleware/auth');

route.post('/',(req,res) => {
    Author.findOne({email:req.body.email}, (err,user) => {
        if(err)
            return res.status(500).json({error:'internal server error'});
        if(user){
            const validPass = bcrypt.compareSync(req.body.password, user.password);
            
            if(!validPass)
                return res.status(400).json({
                            error: 'ok',
                            msj: 'user or password incorrect',
                });

            const jwToken = jwt.sign({_id:user._id, name:user.name, email:user.email}, config.get('configToken.SEED'), { expiresIn:  config.get('configToken.exp')});
            
            res.json({
                author:{
                    _id : user._id,
                    name: user.name,
                    email: user.email,
                    jwToken
                }
            });
        }else{
            res.status(400).json({
                error: 'ok',
                msj: 'user or password incorrect',
            })
        }

    })
})

route.put('/login', (req,res) => {
    console.log('req: ', req.body);
    Author.findOne({email:req.body.email})
    .then(author => {
        console.log('author: ', author);
        if(author){
            const token = req.get('Authorization');
                jwt.verify(token, config.get('configToken.SEED'),(err, decoded) => {
            if(err){
                return res.status(200).json({
                    logged_in: false,
                    msg:'you are not logged in',
                });
            }
            return res.status(200).json({
                logged_in: true,
                author:{
                    _id : author._id,
                    name: author.name,
                    email: author.email,
                }
            });
        })}
        else {
            res.status(400).json({
                msg :'user not found',
                err : err
            })
        }
    })
    .catch(err => {
        res.status(400).json({
            msg :'Bad Request',
            err : err
        })
    });
})

module.exports = route;