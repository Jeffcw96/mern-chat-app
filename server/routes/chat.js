const express = require("express")
const router = express.Router();
const auth = require('../middleware/auth')
const User = require('../models/User');

function arrayEquality(a, b) {
    if (a.length !== b.length) return false

    a.sort()
    b.sort()

    return a.every((element, index) => {
        return element === b[index]
    })
}

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
        const recipients = req.body.recipients
        console.log('userId', userId)

        //$elemMatch used to find if the object key is matched inside the array
        const allChat = await User.findById({ _id: userId })

        for (let conversation of allChat.conversation) {
            let conversationExist = arrayEquality(conversation.recipients, recipients)
            if (conversationExist) {
                res.json({ error: 'duplicated Id' })
                return
            }
        }

        //setting {new: true} will get the latest docs after update the document
        // const response = await User.findOneAndUpdate({ $and: [{ _id: userId }, { "conversation.recipients": { $in: req.body.recipients } }] }, { $addToSet: { "conversation.$.messages": [] } }, { new: true })
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