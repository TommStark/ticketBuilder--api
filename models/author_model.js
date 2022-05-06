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
    lastName : {
        type: String,
        required: false,
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
    },
    phone : {
        type: String,
        required : false,
    },
    country : {
        type: String,
        required : false,
    },
    state_code : {
        type: String,
        required : false,
    },
});

module.exports = mongoose.model('Author', authorScheme);