import React, { useState } from 'react'
import { useConversations } from '../contexts/ConversationsProvider'
import { ListGroup } from "react-bootstrap"

export default function Conversations() {
    const { conversations, selectConversationIndex } = useConversations()
    console.log('conversations', conversations)
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
                    <small>{conversation.lastSent ?
                        conversation.lastSent.fromMe ? "You :" : conversation.lastSent.senderName + " :"
                        : null}
                        <span>{conversation.lastSent ?
                            conversation.lastSent.text
                            : null}</span></small>
                </ListGroup.Item>
            ))}
        </ListGroup>

    )
}
