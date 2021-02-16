import React from 'react'
import OpenConversation from './OpenConversation'
import Sidebar from './Sidebar'
import { useConversations } from '../contexts/ConversationsProvider'

export default function Dashboard({ id }) {
    const { selectedConversation } = useConversations()


    return (
        <div className="d-flex w-75 p-3 border border-2 mx-auto mt-3 bg-light" style={{ height: '95vh' }}>
            <Sidebar id={id} />
            {selectedConversation ? <OpenConversation /> : null}
        </div>

    )
}
