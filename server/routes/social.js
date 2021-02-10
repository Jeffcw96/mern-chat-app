const express = require("express")
const router = express.Router();
const auth = require('../middleware/auth')
const User = require('../models/User');

router.post('/addContact', auth, async (req, res) => {
    console.log("add Contact")
    try {
        const userId = req.user.id
        console.log('userId', userId)

        //$elemMatch used to find if the object key is matched inside the array
        const allFriends = await User.findById({ _id: userId }, { friends: { $elemMatch: { id: req.body.id } } })
        if (allFriends.friends.length !== 0) {
            res.json({ error: 'duplicated Id' })
            return
        }

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