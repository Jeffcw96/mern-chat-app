import React, { useEffect, useState } from 'react'
import { useContacts } from '../contexts/ContactsProvider'
import { ListGroup } from "react-bootstrap"
import axios from 'axios'
import { getCookie } from './Cookie'

export default function Contacts() {
    const { contacts, setContacts } = useContacts()
    const [updatedProfile, setUpdatedProfile] = useState(false)

    async function getFriendsProfilePic() {
        try {
            let jsonBody = {}
            jsonBody.contacts = contacts
            const response = await axios.post("profile/friendsProfile", jsonBody, {
                headers: {
                    "Authorization": "Bearer " + getCookie("token")
                }
            })
            setContacts(response.data.contacts)
            setUpdatedProfile(true)
        } catch (error) {
            console.error("error in getting friends profile", error.message)
        }

    }

    useEffect(() => {
        getFriendsProfilePic()
    }, [contacts])


    return (
        <ListGroup variant="flush">
            {contacts.map(contact => (
                <>
                    <ListGroup.Item key={contact.id}>
                        {contact.name}
                    </ListGroup.Item>
                    <ListGroup.Item>
                        <p>{contact.avatar}</p>
                        {
                            contact.avatar ?
                                <img src={contact.avatar} /> :
                                null
                        }
                    </ListGroup.Item>
                </>
            ))}
        </ListGroup>
    )
}
