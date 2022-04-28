const mongoose = require('mongoose');

const authorScheme = new mongoose.Schema({
    email : {
        type: String,
        required: true,
        unique : true,
        lowercase: true,
    },
    name : {
        type: String,
        required: true,
    },
    password : {
        type: String,
        required: true
    },
    state : {
        type: Boolean,
        default : true,
    },
    img : {
        type: String,
        required : true,
    },
    tickets : {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'Ticket',
        default: undefined
    },
    cr_tickets :{
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'Ticket',
        default : undefined,
    }
});

module.exports = mongoose.model('Author', authorScheme);