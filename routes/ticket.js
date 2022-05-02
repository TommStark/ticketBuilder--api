const express = require('express');
const route = express.Router();
const Ticket = require('../models/ticket_model');
const verifyToken = require('../middleware/auth');


route.get('/', verifyToken, (req,res) => {
    const result = getTickets();
    result
    .then( tickets => res.json({tickets}))
    .catch(err => {
        res.status(400).json({
            err
        })
    });
})

route.get('/:id', verifyToken, (req,res) => {
    const result = getTicketsById(req.params.id);
    result
    .then( ticket => res.json({ticket}))
    .catch(err => {
        res.status(400).json({
            err
        })
    });
})

route.post('/',verifyToken, (req,res) => {
    const result = createTicket(req);
    result
    .then( data => res.json({ticket: data}))
    .catch(err => {
        res.status(400).json({
            err
        })
    });

});

route.put('/:id', verifyToken, (req,res) => {
    const result = updateTicketDateAndStatus(req.params.id);
    result
    .then( ticket => {
        ticket
        res.json({ticket})
    })
    .catch(err => {
        res.status(400).json({
            err
        })
    });
});

route.get('/by/author', verifyToken, (req,res) => {
    const result = getTicketsByAuthor(req.author._id);
    result
    .then( tickets =>
        res.json(tickets))
    .catch(err => {
        res.status(400).json({
            err
        })
    });
})

async function getTicketsByAuthor(id){
    const teamTickets = await getTickets();
    const filteredTickets =  teamTickets.filter(ticket => ticket.author.id === id);

    return ({
        total: filteredTickets.length,
        tickets: filteredTickets
    })
    }

async function getTickets(){
    return await Ticket.find().populate('author','name ').populate('project', 'name color -_id');
}

async function getTicketsById(id){
    return await Ticket.find({_id:id}).populate('author', 'name').populate('project', 'name -_id');
}

async function createTicket(req){
    let ticket = new Ticket({
        prLink        : req.body.prLink,
        ticketLink    : req.body.ticketLink,
        project       : req.body.project,
        details       : req.body.details,
        checks        : req.body.checks,
        author        : req.author._id,        
    });
    return await ticket.save();
}

async function updateTicketDateAndStatus(ticketId,isDone,date){
    if(!ticketId){
        throw new Error('not working in updateTicketDateAndStatus ');
    }
    
    return await Ticket.findOneAndUpdate({_id:ticketId}, { isDone, end_date:date },{new:true});
}

async function pushReviewer(ticketId, reviewerId){
    if(!ticketId){
        throw new Error('not working in pushReviewer ');
    }
    return await Ticket.findOneAndUpdate({_id:ticketId}, { 
        $push:{
            reviewers : reviewerId
        }
    },{new:true});
}
async function pullReviewer(ticketId, reviewerId){
    if(!ticketId){
        throw new Error('not working in pullReviewer ');
    }
    return await Ticket.findOneAndUpdate({_id:ticketId}, { 
        $pull:{
            reviewers : reviewerId
        }
    },{new:true});
}

module.exports = {
    route,
    updateTicketDateAndStatus,
    pushReviewer,
    pullReviewer
}