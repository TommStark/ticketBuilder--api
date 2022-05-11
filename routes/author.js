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

const EmailSchema = Joi.object({
    email: Joi.string()
    .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } })
})

const passSchema = Joi.object({
    password: Joi.string()
        .pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')),

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


route.get('/others', verifyToken, (req,res) => {
    const result = getOtherAuthors();
    
    result
    .then( authors => {
        res.json(authors)
    })
    .catch(err => {
        res.status(400).json({
            err
        })
    });
})

route.get('/myUser',verifyToken,(req,res)=>{
    const authorId = req.author._id;

    const result = getAuthorByIdFiltered(authorId);
    result
    .then( author => res.json(author))
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
                msj:'user already exists'
            })
        }

        const {error,value} = schema.validate({ name: body.name, email: body.email, password:body.password });

        if(!error){
            const result = createAuthor(body);
            result
            .then( data => res.json({name: data.name, email: data.email, img: data.img}))
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


route.put('/updateInfo', verifyToken, async (req,res)=>{
    const authorId = req.author._id;
    const { email} = req.body;

    const {error,_value} = EmailSchema.validate({ email: email});

    if(!error){
        const updatedUser = await Author.findOneAndUpdate( {_id:authorId}, req.body, { new: true }).catch(error => {
            return res.status(500).send(error);
        });

        return res.status(200).json({
        message : "Updated user",
        data: updatedUser
        });
    }else{
        res.status(400).json({error});
    }
})

route.put('/appVersion', verifyToken,(req, res) => {
    const authorEmail = req.author.email;
    const version = req.body.version;

    const result = updateAppVersion(authorEmail,version);
    
    result.then( data => res.json(data))
    .catch(err => {
        res.status(400).json({
            err
        })
    });
});

route.put('/updateInfo/pass', verifyToken, async (req,res)=>{
    const authorId = req.author._id;
    const { password } = req.body;
    
    const {error,_value} = passSchema.validate({ password: password});

    const encyptedPass = bcrypt.hashSync(password,10)

    if(!error){
        const updatedUser = await Author.findOneAndUpdate( {_id:authorId}, encyptedPass, { new: true }).catch(error => {
            return res.status(500).send(error);
        });

        return res.status(200).json({
        message : "Updated user",
        data: {name: updatedUser.name, email: updatedUser.email}
        });
    }else{
        res.status(400).json({error});
    }
})


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

route.put('/:email', verifyToken,(req, res) => {
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

route.delete('/:id', verifyToken, (req, res) => {
    const { authorId } = req.body;
    const result = removeTicket(authorId,req.params.id);
    result.then( data => {
        res.json ({
            "msg":'Ticket deleted',
            data
        });
    }).catch(err => {
        res.status(400).json({
            err
        })
    });

});

async function updateAppVersion(id,version){
    return await Author.findOneAndUpdate({email:id},{appVersion: version },{new:true})
}

async function removeTicket(id,ticketId){
    return await Project.updateOne({_id: id},{
        $pullAll: {
            tickets: [{_id: ticketId}],
        },
    })
}

async function getOtherAuthors(id){
    return await Author.find({state:true}).select('-tickets -password');
}

async function getAuthors(){
    return await Author.find({state:true}).select('name email tickets').populate('tickets','-author');
}
async function getAuthorById(id){
    return await Author.findOne({state:true, _id:id}).select('name email tickets').populate('tickets','-author');
}

async function getAuthorByIdFiltered(id){
    return await Author.findOne({state:true, _id:id}).select('-tickets -password');
}

async function deactivateAuthor( id ){
    let author = await Author.find({email:id});
    author[0].state = false;  
    return author;
}

async function updateAuthor(ticketId, authorEmail){
    if(!ticketId){
        throw new Error(err);
    }

    let author = await Author.findOneAndUpdate({email: authorEmail}, {
        $push:{
            tickets : ticketId
        }
    },{new:true});
        return author;
}

async function createAuthor(body){
    let author = new Author({
        email    : body.email,
        name     : body.name,
        img      : body.img,
        password : bcrypt.hashSync(body.password,10)
        
    });
    return await author.save();
}

module.exports = route;