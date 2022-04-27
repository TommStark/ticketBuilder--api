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
        lowercase: true
    },
    password : {
        type: String,
        required: true
    },
    state : {
        type: Boolean,
        default : true,
    },
    image : {
        type: String,
        required : false,
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