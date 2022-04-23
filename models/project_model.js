const mongoose = require('mongoose');

const projectScheme = new mongoose.Schema({
    name : {
        type: String,
        required: true
    },
    path : {
        type: String,
        required: true
    },
    state : {
        type: Boolean,
        default : true,
    },
    icon : {
        type: String,
        required : true,
    },
    tickets : {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'Ticket',
        default: undefined
    }
});

module.exports = mongoose.model('Project', projectScheme);