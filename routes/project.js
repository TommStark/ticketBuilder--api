const express = require('express');
const route = express.Router();
const Project = require('../models/project_model');
const verifyToken = require('../middleware/auth');


route.get('/', verifyToken, (_req,res) => {
    const result = getprojects();
    result
    .then( project => res.json(project))
    .catch(err => {
        res.status(400).json({
            msg :'Bad Request',
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
            msg :'Bad Request',
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
            msg :'Bad Request',
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

route.get('/by/author', verifyToken, (req,res) => {
    const result = getProjectByAuthor(req.author._id);
    result
    .then( project => res.json(project))
    .catch(err => {
        res.status(400).json({
            msg :'Bad Request',
            err
        })
    });
})

route.put('/update/:id', verifyToken, (req,res) => {
    const result = updateProject(req.params.id, req.body.color);
    result
    .then( ticket => {
        ticket
        res.json({ticket})
    })
    .catch(err => {
        res.status(400).json({
            msg :'Bad Request',
            err
        })
    });
});

async function getprojects(){
    return Project.find({state:true}).populate('tickets','author')
}

async function getProjectById(id){
    return Project.find({state:true, _id:id}).populate('tickets','author')
}

async function getProjectByAuthor(id){
        const teamProject = await getprojects();

        const filteredProjects =  teamProject.map( pro => {
            const tickets = pro.tickets.filter( t => t.author.equals(id));
            const ticketlength = tickets.length;
            return {name:pro.name,color:pro.color, tickets:{tickets,count:ticketlength}};
        })
        
        const FilteredteamProjectdata = teamProject.map( project => {
            return {
                B: project.tickets.length
            };
        });
        
        const pieChart = filteredProjects.map(project => {
            return  {'name': project.name, 'value': project.tickets.count, 'color': project.color};
        });
        
        const colors = filteredProjects.map( project => {
            return project.color;
        });
        
        const graph = filteredProjects.map(project => {
            return {
                subject  : project.name,
                A        : project.tickets.count,
                fullMark : 150
            };
        });
        

        const radarChart = graph.map( (pro, index) => {
            return {...pro, ...FilteredteamProjectdata[index]};
        });
        


        return { stats:{
            radarChart,
            pieChart,
            colors,
        } };
}

async function createProject(req){
    let project = new Project({
        name          : req.body.name,
        state         : req.body.state,
        icon          : req.body.icon,
    });
    return project.save();
}

async function updateProjectList(ticketId, projectId){
    if(!ticketId){
        throw new Error(err);
    }

    return Project.findOneAndUpdate({_id:projectId}, {
        $push:{
            tickets : ticketId
        }
    },{new:true});
    }


async function updateProject(projectId, color){
    if(!projectId ||!color ){
        throw new Error(err);
    }

    return Project.findOneAndUpdate({_id:projectId}, { color },{new:true});
}
module.exports = route