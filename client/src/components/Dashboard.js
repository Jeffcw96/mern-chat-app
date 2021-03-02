import React, { useState } from 'react'
import OpenConversation from './OpenConversation'
import Sidebar from './Sidebar'
import { useConversations } from '../contexts/ConversationsProvider'
import { useContacts } from '../contexts/ContactsProvider'
import logout from '../static/logout.svg'
import { deleteCookie } from '../components/Cookie'

export default function Dashboard({ id }) {
    const { conversations, selectedConversation } = useConversations()
    const { contacts } = useContacts()
    const [conversationActive, setConversationActive] = useState(true)

    function handleLogOut() {
        deleteCookie("token");
        window.location.reload();
    }
    return (
        <div className="d-flex w-75 p-3 border border-2 mx-auto mt-3 bg-light" style={{ height: '95vh', position: "relative" }}>
            <img src={logout} alt="log out" className="logout" onClick={() => handleLogOut()} />
            <Sidebar setConversationActive={setConversationActive} />
            {selectedConversation ? <OpenConversation /> : null}
            {conversations.length === 0 && conversationActive ?
                <div className="position-absolute border hints-box">
                    <div className="position-relative">
                        <small className="px-3" style={{ fontWeight: "bold" }}>Start chating with your friend now</small>
                        <div className="hints-box-arrow"></div>
                    </div>
                </div> :
                null
            }
            {contacts.length === 0 && !conversationActive ?
                <div className="position-absolute border hints-box">
                    <div className="position-relative">
                        <small className="px-3" style={{ fontWeight: "bold" }}>Start adding more friends now</small>
                        <div className="hints-box-arrow"></div>
                    </div>
                </div> :
                null
            }

        </div>

    )
}
