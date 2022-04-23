const express = require('express');
const Joi = require('joi');
const bcrypt = require('bcrypt');
const route = express.Router();
const Author = require('../models/author_model');
const verifyToken = require('../middleware/auth');

const schema = Joi.object({
    name: Joi.string()
        .min(3)
        .max(10)
        .required(),

    password: Joi.string()
        .pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')),

    email: Joi.string()
        .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } })
})

route.get('/', verifyToken, (req,res) => {
    const result = getAuthors();

    result
    .then( authors => res.json({authors}))
    .catch(err => {
        res.status(400).json({
            err
        })
    });
})

route.get('/:id', verifyToken, (req,res) => {
    const result = getAuthorById(req.params.id);
    result
    .then( author => res.json({author}))
    .catch(err => {
        res.status(400).json({
            err
        })
    });
})

route.post('/', (req,res) => {
    const body = req.body;
    
    Author.findOne({email: body.email}, (err,auth) => {
        if(err)
            return res.status(500).json({error:'internal server error'});
        if(auth){
            return res.status(400).json({
                msj:'Author already exists'
            })
        }
    
        const {error,value} = schema.validate({ name: body.name, email: body.email });

        if(!error){
            const result = createAuthor(body);
            result
            .then( data => res.json({name: data.name, email: data.email}))
            .catch(err => {
                res.status(400).json({
                    err
                })
            });
        }else{
            res.status(400).json({error});
        }
    })
});

route.put('/:id', verifyToken,(req, res) => {
    const ticketId = req.params.id;
    const authorEmail = req.author.email;

    let result = updateAuthor(ticketId, authorEmail);
    
    result.then( data => {
        res.json ({ data });
    }).catch(err => {
        res.status(400).json({
            err :'Bad Request'
        })
    });

});

route.delete('/:email', verifyToken,(req, res) => {
    const param = req.params.email;

    let result = deactivateAuthor(param);
    
    result.then( data => {
        res.json ({ name:data[0].name, email:data[0].email });
    }).catch(err => {
        res.status(400).json({
            err
        })
    });

});

async function getAuthors(){
    return await Author.find({state:true}).select('name email tickets').populate('tickets','-author');
}
async function getAuthorById(id){
    return await Author.findOne({state:true, _id:id}).select('name email tickets').populate('tickets','-author');
}

async function deactivateAuthor( id ){
    let author = await Author.find({email:id});
    author[0].state = false;  
    return author;
}

async function updateAuthor(ticketId, authorEmail){
    console.log('authorEmail: ', authorEmail);
    if(!ticketId){
        throw new Error(err);
    }

    let author = await Author.findOneAndUpdate({email: authorEmail}, {
        $push:{
            tickets : ticketId
        }
    },{new:true});
    
    console.log('author: ', author);
    return author;
}

async function createAuthor(body){
    let author = new Author({
        email    : body.email,
        name     : body.name,
        password : bcrypt.hashSync('arzion123',10)
        
    });
    return await author.save();
}



module.exports = route;