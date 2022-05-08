const mongoose = require('mongoose');

const PostScheme = new mongoose.Schema({
    date  : {
        type:Date, 
        default:Date.now
    },
    body : {
        type: String,
        required: true
    },
    title :{
        type: String,
        required: true
    },
    color :{
        type: String,
        required: true
    }
});

module.exports = mongoose.model('Post', PostScheme);