const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ticketScheme = new mongoose.Schema({
    prLink : {
        type: String,
        required: true
    },
    ticketLink : {
        type: String,
        required: true
    },
    project : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true
    },
    details : {
        type: String,
        required: true
    },
    checks : {
        type: Number,
        required: true
    },
    author  : {
        type: Schema.Types.ObjectId,
        ref: 'Author',
        required: true
    },
    start_date    : {
        type:Date, 
        default:Date.now
    },
    end_date    : {
        type:Date, 
        default: null
    },
    isDone  : {
        type:Boolean, 
        default:false
    },
    reviewers :{
        type: [String],
        default : [],
    }
});

module.exports = mongoose.model('Ticket', ticketScheme);