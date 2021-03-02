const express = require("express")
const router = express.Router();
const auth = require('../middleware/auth')
const User = require('../models/User');

router.post('/addContact', auth, async (req, res) => {
    console.log("add Contact")
    try {
        const userId = req.user.id
        console.log('userId', userId)

        const isIdExist = await User.findOne({ _id: req.body.id })
        console.log("isIdExist", isIdExist)
        if (!isIdExist) {
            res.status(400).json({ error: 'Id not found' })
            return
        }

        //$elemMatch used to find if the object key is matched inside the array
        const allFriends = await User.findById({ _id: userId }, { friends: { $elemMatch: { id: req.body.id } } })
        if (allFriends.friends.length !== 0) {
            res.status(400).json({ error: 'duplicated Id' })
            return
        }


        //setting {new: true} will get the latest docs after update the document
        const response = await User.findByIdAndUpdate({ _id: userId }, { $addToSet: { friends: req.body } }, { new: true })
        res.json({ contactList: response.friends })

    } catch (error) {
        console.error(error.message)
        res.status(400).json({ error: "Id not found" })
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

router.post('/updateName', auth, async (req, res) => {
    console.log("update Contact name")
    try {
        const userId = req.user.id;
        const friendId = req.body.id;
        const updatedName = req.body.name;
        const response = await User.findOneAndUpdate({ $and: [{ _id: userId }, { "friends.id": friendId }] }, { "friends.$.name": updatedName }, { new: true })

        console.log("response.friends", response)
        res.json({ friends: response.friends })

    } catch (error) {
        console.error(error.message)
        res.status(500).json({ error: "Server error" })
    }
})

router.post('/deleteContact', auth, async (req, res) => {
    try {
        const response = await User.findByIdAndUpdate({ _id: req.user.id }, { $pull: { friends: req.body } }, { new: true })
        res.json({ friends: response.friends })

    } catch (error) {
        console.error(error.message)
        res.status(500).json({ error: "Server error" })
    }
})

module.exports = router;