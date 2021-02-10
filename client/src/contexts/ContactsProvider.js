import React, { useContext, useState, useEffect } from 'react'
import useLocalStorage from '../hooks/useLocalStorage'
import axios from 'axios'
import { getCookie } from '../components/Cookie'

const ContactsContext = React.createContext()
const URL = "http://localhost:5000/"

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
        const response = await axios.get(URL + "social/getContact", {
            headers: {
                "Authorization": "Bearer " + getCookie("token")
            }
        })
        const friends = response.data.friends;
        setContacts(friends)
    }


    async function createContact(id, name) {
        let contactJson = {};
        contactJson.id = id;
        contactJson.name = name;

        const response = await axios.post(URL + "social/addContact", contactJson, {
            headers: {
                "Authorization": "Bearer " + getCookie("token")
            }
        })

        const contactList = response.data.contactList

        setContacts(contactList)
    }

    return (
        <ContactsContext.Provider value={{ contacts, createContact }}>
            {children}
        </ContactsContext.Provider>
    )
}
