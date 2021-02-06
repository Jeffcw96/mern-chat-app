import React from 'react'
import { useConversations } from '../contexts/ConversationsProvider'
import { ListGroup } from "react-bootstrap"

export default function Conversations() {

    const { conversations, selectConversationIndex } = useConversations()

    return (
        <ListGroup variant="flush">
            {conversations.map((conversation, ind) => (
                <ListGroup.Item
                    key={ind}
                    action
                    onClick={() => selectConversationIndex(ind)}
                    active={conversation.selected}
                >
                    {conversation.recipients.map(r => r.name).join(', ')}
                </ListGroup.Item>
            ))}
        </ListGroup>

    )
}
