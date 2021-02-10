const express = require("express")
const router = express.Router();
const auth = require('../middleware/auth')
const User = require('../models/User');

router.get("/getConversation", auth, async (req, res) => {
    console.log("get conversation")
    try {
        const userId = req.user.id
        const response = await User.findById(userId).select("-password");
        res.json({ conversation: response.conversation })

    } catch (error) {
        console.error(error.message)
        res.status(500).json({ error: "Server error" })
    }
})

router.post('/addConversation', auth, async (req, res) => {
    console.log("add Conversation")
    try {
        const userId = req.user.id
        console.log('userId', userId)

        //$elemMatch used to find if the object key is matched inside the array
        const allChat = await User.findById({ _id: userId }, { conversation: { $elemMatch: { id: req.body.id } } })
        if (allChat.conversation.length !== 0) {
            res.json({ error: 'duplicated Id' })
            return
        }

        //setting {new: true} will get the latest docs after update the document
        const response = await User.findByIdAndUpdate({ _id: userId }, { $addToSet: { conversation: req.body } }, { new: true })
        res.json({ conversations: response.conversation })

    } catch (error) {
        console.error(error.message)
        res.status(500).json({ error: "Server error" })
    }
})

router.post('/updateConversation', auth, async (req, res) => {
    console.log("update Conversation")
    try {

    } catch (error) {
        console.error(error.message)
        res.status(500).json({ error: "Server error" })
    }
})


module.exports = router