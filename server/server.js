const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const cors = require('cors');
const bodyParser = require('body-parser');
const DB = require('./routes/db');
const app = express();
const User = require('../server/models/User')
require('dotenv').config()

DB();
app.use(express.json({ extended: false }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());
app.use("/auth", require('./routes/auth'));
app.use("/social", require('./routes/social'));
app.use("/chat", require('./routes/chat'));
app.use("/profile", require('./routes/profile'))

const server = http.createServer(app);
const io = socketio(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});

function arrayEquality(a, b) {
    if (a.length !== b.length) return false

    a.sort()
    b.sort()

    return a.every((element, index) => {
        return element === b[index]
    })
}

io.on('connection', socket => {
    const id = socket.handshake.query.id
    console.log("join id", id)
    socket.join(id)

    socket.on('send-message', async ({ recipients, text }) => {
        console.log("recipients", recipients)
        let messageJson = {}
        messageJson.sender = id;
        messageJson.text = text;
        let messageArr = []
        messageArr.push(messageJson)

        // if the ObjectId is matched and the 'recipients' object inside conversation array is matched with the given array (recipients), push new message. the $ is representing current index of the matched case
        await User.findOneAndUpdate({ $and: [{ _id: id }, { "conversation.recipients": recipients }] }, { $push: { "conversation.$.messages": messageJson } })

        for (let recipient of recipients) {
            let existingConversation = false
            const newRecipients = recipients.filter(r => r !== recipient)
            newRecipients.push(id)
            //const response = await User.findOneAndUpdate({ $and: [{ _id: recipient }, { "conversation.recipients": newRecipients }] })
            const allChat = await User.findById(recipient);
            for (let conversation of allChat.conversation) {
                let conversationExist = arrayEquality(conversation.recipients, newRecipients)
                if (conversationExist) {
                    existingConversation = true;
                    break
                }
            }

            if (!existingConversation) {
                let conversationJson = {}
                conversationJson.recipients = newRecipients;
                conversationJson.messages = [];
                await User.findByIdAndUpdate({ _id: recipient }, { $addToSet: { conversation: conversationJson } })
            }

            await User.findOneAndUpdate({ $and: [{ _id: recipient }, { "conversation.recipients": newRecipients }] }, { $push: { "conversation.$.messages": messageJson } })
            console.log("id", id, "newRecipients", newRecipients, "text", text, "recipient", recipient)

            // const response = await User.findByIdAndUpdate({ _id: userId }, { $addToSet: { conversation: req.body } }, { new: true })

            socket.broadcast.to(recipient).emit('receive-message', {
                recipients: newRecipients, sender: id, text
            })
        }
    })
})

server.listen(process.env.PORT || 5000, () => console.log(`Server has started. at PORT 5000`));