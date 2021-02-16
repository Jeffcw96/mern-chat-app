const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const User = require('../models/User');

router.get('/get', auth, async (req, res) => {
    try {
        const userProfile = await User.findById(req.user.id).select("-password -conversation -friends")
        res.json({ profile: userProfile })
    } catch (error) {
        console.error("error in getting profile", error.message);
        res.status(500).json({ error: error.message })
    }
})

module.exports = router