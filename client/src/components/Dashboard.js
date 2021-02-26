import React from 'react'
import OpenConversation from './OpenConversation'
import Sidebar from './Sidebar'
import { useConversations } from '../contexts/ConversationsProvider'
import logout from '../static/logout.svg'
import { deleteCookie } from '../components/Cookie'

export default function Dashboard({ id }) {
    const { selectedConversation } = useConversations()

    function handleLogOut() {
        deleteCookie("token");
        window.location.reload();
    }
    return (
        <div className="d-flex w-75 p-3 border border-2 mx-auto mt-3 bg-light" style={{ height: '95vh', position: "relative" }}>
            <img src={logout} alt="log out" className="logout" onClick={() => handleLogOut()} />
            <Sidebar id={id} />
            {selectedConversation ? <OpenConversation /> : null}
        </div>

    )
}
