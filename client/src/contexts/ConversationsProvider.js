import React, { useContext, useState, useEffect, useCallback } from 'react'
import { useContacts } from './ContactsProvider';
import { useSocket } from './SocketProvider';
import { getCookie } from '../components/Cookie'
import axios from 'axios'

const ConversationsContext = React.createContext()
const URL = "http://localhost:5000/"
export function useConversations() {
    return useContext(ConversationsContext)
}

export function ConversationsProvider({ id, children }) {
    // const [conversations, setConversations] = useLocalStorage('conversations', [])
    const [conversations, setConversations] = useState([])
    const [selectedConversationIndex, setSelectedConversationIndex] = useState(0)
    const { contacts } = useContacts()
    const socket = useSocket()

    useEffect(() => {
        getConversation()
    }, [])

    async function getConversation() {
        const response = await axios.get("chat/getConversation", {
            headers: {
                "Authorization": "Bearer " + getCookie("token")
            }
        })
        const chat = response.data.conversation;
        setConversations(chat)
    }

    async function createConversation(recipients) {
        setConversations(prevConversations => {
            return [...prevConversations, { recipients, messages: [] }]
        })
        let conversationJson = {};
        conversationJson.recipients = recipients;
        conversationJson.messages = [];

        const response = await axios.post("chat/addConversation", conversationJson, {
            headers: {
                "Authorization": "Bearer " + getCookie("token")
            }
        })

        if (response.data.conversations) {
            const conversations = response.data.conversations
            setConversations(conversations)
        }
    }

    const addMessageToConversation = useCallback(({ recipients, text, sender }) => {
        setConversations(prevConversations => {
            let existingConversation = false
            const newMessage = { sender, text }
            const newConversations = prevConversations.map(conversation => {
                if (arrayEquality(conversation.recipients, recipients)) {
                    existingConversation = true
                    return {
                        ...conversation,
                        messages: [...conversation.messages, newMessage],
                        seen: false
                    }
                }

                return conversation
            })

            if (existingConversation) {
                return newConversations
            } else {
                return [
                    ...prevConversations,
                    { recipients, messages: [newMessage] }
                ]
            }
        })
    }, [setConversations])

    useEffect(() => {
        if (socket == null) return

        socket.on('receive-message', addMessageToConversation)

        return () => socket.off('receive-message')
    }, [socket, addMessageToConversation])

    function sendMessage(recipients, text) {
        socket.emit('send-message', { recipients, text })

        addMessageToConversation({ recipients, text, sender: id })
    }

    const formattedConversations = conversations.map((conversation, index) => {
        const recipients = conversation.recipients.map(recipient => {
            const contact = contacts.find(contact => {
                return contact.id === recipient
            })
            const name = (contact && contact.name) || recipient
            return { id: recipient, name }
        })

        const messages = conversation.messages.map(message => {
            const contact = contacts.find(contact => {
                return contact.id === message.sender
            })
            const name = (contact && contact.name) || message.sender
            const fromMe = id === message.sender
            return { ...message, senderName: name, fromMe }
        })

        const selected = index === selectedConversationIndex


        const lastSent = messages[messages.length - 1]
        return { ...conversation, messages, recipients, selected, lastSent, seen: true }
    })

    const value = {
        conversations: formattedConversations,
        selectedConversation: formattedConversations[selectedConversationIndex],
        sendMessage,
        selectConversationIndex: setSelectedConversationIndex,
        createConversation
    }

    return (
        <ConversationsContext.Provider value={value}>
            {children}
        </ConversationsContext.Provider>
    )
}

function arrayEquality(a, b) {
    if (a.length !== b.length) return false

    a.sort()
    b.sort()

    return a.every((element, index) => {
        return element === b[index]
    })
}