import React, { useContext } from 'react'
import useLocalStorage from '../hooks/useLocalStorage'

const ContactsContext = React.createContext()

export function useContacts() {
    return useContext(ContactsContext)
}

export function ContactsProvider({ children }) {
    const [contacts, setContacts] = useLocalStorage('contacts', [])

    function createContact(id, name) {
        setContacts((prevContact) => {
            return [...prevContact, { id, name }]
        })
    }

    return (
        <ContactsContext.Provider value={{ contacts, createContact }}>
            {children}
        </ContactsContext.Provider>
    )
}
