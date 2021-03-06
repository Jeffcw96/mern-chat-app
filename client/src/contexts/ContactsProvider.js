import React, { useContext, useState, useEffect } from 'react'
import axios from 'axios'
import { getCookie } from '../components/Cookie'

const ContactsContext = React.createContext()

export function useContacts() {
    return useContext(ContactsContext)
}

export function ContactsProvider({ children }) {
    // const [contacts, setContacts] = useLocalStorage('contacts', [])
    const [contacts, setContacts] = useState([])

    useEffect(() => {
        getContacts()
    }, [])

    async function getContacts() {
        const response = await axios.get("social/getContact", {
            headers: {
                "Authorization": "Bearer " + getCookie("token")
            }
        })
        const friends = response.data.friends;
        setContacts(friends)
    }


    async function createContact(id, name) {
        try {
            let contactJson = {};
            contactJson.id = id;
            contactJson.name = name;

            const response = await axios.post("social/addContact", contactJson, {
                headers: {
                    "Authorization": "Bearer " + getCookie("token")
                }
            })

            if (response.data.contactList) {
                const contactList = response.data.contactList
                setContacts(contactList)
            }

        } catch (error) {
            return error.response.data.error
        }
    }

    return (
        <ContactsContext.Provider value={{ contacts, createContact, setContacts }}>
            {children}
        </ContactsContext.Provider>
    )
}
