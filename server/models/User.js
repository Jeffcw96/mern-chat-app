const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    name: {
        type: String,
    },
    friends: {
        type: Array
    },
    request: {
        type: Array
    },
    bio: {
        type: String,
    },
    picture: {
        type: String
    },
    chatTicket: {
        type: Array
    }
})

module.exports = mongoose.model('user', UserSchema)