const mongoose = require('mongoose');

const authorScheme = new mongoose.Schema({
    email : {
        type: String,
        required: true,
        unique : true
    },
    name : {
        type: String,
        required: true
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
    }
});

module.exports = mongoose.model('Author', authorScheme);