import React, { useState } from 'react'
import { useConversations } from '../contexts/ConversationsProvider'
import { ListGroup } from "react-bootstrap"

export default function Conversations() {
    const { conversations, selectConversationIndex } = useConversations()

    return (
        <ListGroup variant="flush">
            {conversations.map((conversation, ind) => (
                <ListGroup.Item
                    className="p-relative"
                    key={ind}
                    action
                    onClick={() => selectConversationIndex(ind)}
                    active={conversation.selected}
                >
                    <div>{conversation.recipients.map(r => r.name).join(', ')}</div>
                    <div>{conversation.lastSent.fromMe ? "You :" : conversation.lastSent.senderName + " :"} <span>{conversation.lastSent.text}</span></div>
                </ListGroup.Item>
            ))}
        </ListGroup>

    )
}
