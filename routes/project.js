const express = require('express');
const route = express.Router();
const Project = require('../models/project_model');
const verifyToken = require('../middleware/auth');


route.get('/', verifyToken, (req,res) => {
    const result = getprojects();
    result
    .then( tickets => res.json({tickets}))
    .catch(err => {
        res.status(400).json({
            err
        })
    });
})

route.get('/:id', verifyToken, (req,res) => {
    const result = getProjectById(req.params.id);
    result
    .then( project => res.json({project}))
    .catch(err => {
        res.status(400).json({
            err
        })
    });
})

route.post('/',verifyToken, (req,res) => {
    const result = createProject(req);
    result
    .then( data => res.json({project: data}))
    .catch(err => {
        res.status(400).json({
            err
        })
    });

});

route.put('/:id', verifyToken,(req, res) => {
    const ticketId = req.params.id;
    const projectId = req.body.projectId;

    let result = updateProjectList(ticketId, projectId);
    
    result.then( data => {
        res.json ({ data });
    }).catch(err => {
        res.status(400).json({
            msg :'Bad Request',
            err
        })
    });

});

async function getprojects(){
    return await Project.find({state:true}).populate('tickets','-author -__v')
}

async function getProjectById(id){
    return await Project.find({state:true, _id:id}).populate('tickets','-author -__v')
}

async function createProject(req){
    let project = new Project({
        name          : req.body.name,
        state         : req.body.state,
        icon          : req.body.icon,
    });
    return await project.save();
}

async function updateProjectList(ticketId, projectId){
    if(!ticketId){
        throw new Error(err);
    }

    let author = await Project.findOneAndUpdate({_id:projectId}, {
        $push:{
            tickets : ticketId
        }
    },{new:true});
    
    return author;
}

module.exports = route