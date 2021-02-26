import React, { useEffect, useState, useCallback } from 'react'
import { useContacts } from '../contexts/ContactsProvider'
import { ListGroup, Modal } from "react-bootstrap"
import axios from 'axios'
import { getCookie } from './Cookie'
import userImg from '../static/user.svg'
import FriendDetailModal from './FriendDetailModal'

export default function Contacts() {
    const { contacts, setContacts } = useContacts()
    const [latestContacts, setLatestContact] = useState(null)
    const [friendModalOpen, setFriendModalOpen] = useState(false)
    const [friendDetails, setFriendDetails] = useState(null)
    const [name, setName] = useState("")

    function closeFriendModal() {
        setFriendModalOpen(false)
    }

    async function openFriendDetailModal(id, name) {
        try {
            const response = await axios.get("profile/friendDetails?id=" + id, {
                headers: {
                    "Authorization": "Bearer " + getCookie("token")
                }
            })

            setFriendDetails(response.data.friend)
            setName(name)
            setFriendModalOpen(true)
        } catch (error) {
            console.error("error", error.message)
        }
    }


    async function getFriendsProfilePic() {
        try {
            let jsonBody = {}
            jsonBody.contacts = contacts
            const response = await axios.post("profile/friendsProfile", jsonBody, {
                headers: {
                    "Authorization": "Bearer " + getCookie("token")
                }
            })
            return response.data.contacts

        } catch (error) {
            console.error("error in getting friends profile", error.message)
        }

    }

    const memoizedCallback = useCallback(
        async () => {
            const response = await getFriendsProfilePic()
            if (response) {
                console.log("responseeee", response)
                setLatestContact(response)
            }
        },
        [contacts],
    );

    useEffect(() => {
        memoizedCallback()
    }, [contacts])


    return (
        <>
            <ListGroup variant="flush">
                {latestContacts !== null ?
                    latestContacts.map(contact => (
                        <>
                            <ListGroup.Item key={contact.id} onClick={() => openFriendDetailModal(contact.id, contact.name)} className="contact-info">
                                <div className="d-flex align-items-center">
                                    <div className="avatar-container">
                                        {
                                            contact.avatar ?
                                                <img src={contact.avatar} className="avatar" /> :
                                                <img src={userImg} className="avatar" />
                                        }
                                    </div>
                                    <div className="friend-info">
                                        <p>{contact.name}</p>
                                        {
                                            contact.bio ?
                                                <small>{contact.bio}</small>
                                                : null
                                        }
                                    </div>
                                </div>
                            </ListGroup.Item>
                        </>
                    ))
                    : null
                }
            </ListGroup>
            <Modal show={friendModalOpen} onHide={setFriendModalOpen}>
                {friendModalOpen ? <FriendDetailModal friend={friendDetails} name={name} closeFriendModal={closeFriendModal} /> : null}
            </Modal>
        </>
    )
}
