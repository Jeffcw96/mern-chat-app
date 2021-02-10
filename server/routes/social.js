const express = require("express")
const router = express.Router();
const auth = require('../middleware/auth')
const User = require('../models/User');

router.post('/addContact', auth, async (req, res) => {
    console.log("add Contact")
    try {
        const userId = req.user.id
        console.log('userId', userId)

        //setting {new: true} will get the latest docs after update the document
        const response = await User.findByIdAndUpdate({ _id: userId }, { $addToSet: { friends: req.body } }, { new: true })
        res.json({ contactList: response.friends })


    } catch (error) {
        console.error(error.message)
        res.status(500).json({ error: "Server error" })
    }
})

router.get('/getContact', auth, async (req, res) => {
    console.log("get Contact")
    try {
        const userId = req.user.id
        const response = await User.findById(userId).select("-password");
        res.json({ friends: response.friends })

    } catch (error) {
        console.error(error.message)
        res.status(500).json({ error: "Server error" })
    }
})

module.exports = router;