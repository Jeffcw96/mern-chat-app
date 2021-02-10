const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
    },
    password: {
        type: String,
    },
    name: {
        type: String,
    },
    friends: {
        type: Array
    },
    bio: {
        type: String,
    },
    picture: {
        type: String
    },
    conversation: {
        type: Array
    }
})

module.exports = mongoose.model('user', UserSchema)