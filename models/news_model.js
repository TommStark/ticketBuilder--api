const mongoose = require('mongoose');

const newsScheme = new mongoose.Schema({
    title : {
        type: String,
        required: true,
        lowercase: true,
    },
    version :{
        type: String,
        required: true,    
    },
    posts : {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'Post',
        default: undefined,
    }
});

module.exports = mongoose.model('News', newsScheme);