const mongoose = require('mongoose');

const ChatSchema = new mongoose.Schema({
    users: {
        type: Array,
        require: true
    },
    message: {
        type: Array
    }

})

module.exports = mongoose.model('chat', ChatSchema)