import React, { useState, useEffect } from 'react'
import { Tab, Nav, Button, Modal, Image } from 'react-bootstrap'
import Conversations from './Conversations'
import Contacts from './Contacts'
import NewContactModal from './NewContactModal'
import NewConversationModal from './NewConversationModal'
import NewProfileModal from './NewProfileModal'
import chatImg from '../static/chat.svg'
import contactImg from '../static/contact-book.svg'
import userImg from '../static/user.svg'
import { useProfile } from '../contexts/ProfileProvider'

const CONVERSATION_KEY = "conversations"
const CONTACTS_KEY = "contacts"

export default function Sidebar({ setConversationActive }) {
    const [activeKey, setActiveKey] = useState(CONVERSATION_KEY)
    const [modalOpen, setModalOpen] = useState(false)
    const [profileModalOpen, setProfileModalOpen] = useState(false)
    const { profile } = useProfile()
    const [profilePic, setProfilePic] = useState(() => {
        if (profile.picture !== "" && profile.picture !== undefined && profile.picture !== null) {
            return profile.picture
        } else {
            return userImg
        }
    })

    useEffect(() => {
        if (profile.picture !== "" && profile.picture !== undefined && profile.picture !== null) {
            setProfilePic(profile.picture)
        }
    }, [profile.picture])

    //return true if activeKey equal to conversation key
    const conversationOpen = activeKey === CONVERSATION_KEY

    useEffect(() => {
        setConversationActive(activeKey === CONVERSATION_KEY)
    }, [activeKey])

    function closeModal() {
        setModalOpen(false)
    }

    function closeProfileModal() {
        setProfileModalOpen(false)
    }

    return (
        <div style={{ width: '250px' }} className="d-flex flex-column">
            <Tab.Container activeKey={activeKey} onSelect={setActiveKey}>
                <Nav className="justify-content-left">
                    <Nav.Item>
                        <Nav.Link eventKey={CONVERSATION_KEY}>
                            <Image src={chatImg} width="25" />
                        </Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link eventKey={CONTACTS_KEY}>
                            <Image src={contactImg} width="25" />
                        </Nav.Link>
                    </Nav.Item>
                    <Nav.Item className="d-flex align-items-center ml-4">
                        <Nav.Link onClick={() => setProfileModalOpen(true)}>
                            <Image src={profilePic} width="25" />
                        </Nav.Link>
                    </Nav.Item>
                </Nav>
                <Tab.Content className='border-right border-top overflow-auto flex-grow-1'>
                    <Tab.Pane eventKey={CONVERSATION_KEY}>
                        <Conversations />
                    </Tab.Pane>
                    <Tab.Pane eventKey={CONTACTS_KEY}>
                        <Contacts />
                    </Tab.Pane>
                </Tab.Content>
                <Button className="rounded-0" onClick={() => setModalOpen(true)}>
                    New {conversationOpen ? 'Chat' : 'Contact'}
                </Button>
            </Tab.Container>
            <Modal show={modalOpen} onHide={closeModal}>
                {conversationOpen ?
                    <NewConversationModal closeModal={closeModal} /> :
                    <NewContactModal closeModal={closeModal} />}
            </Modal>
            <Modal show={profileModalOpen} onHide={closeProfileModal}>
                {profileModalOpen ? <NewProfileModal closeProfileModal={closeProfileModal} /> : null}
            </Modal>

        </div>
    )
}
