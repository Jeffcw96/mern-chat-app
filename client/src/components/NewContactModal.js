import React, { useRef, useState } from 'react'
import { Modal, Form, Button } from 'react-bootstrap'
import { useContacts } from '../contexts/ContactsProvider'

export default function NewContactModal({ closeModal }) {
    const [addFriendErr, setAddFriendErr] = useState("")
    const idRef = useRef();
    const nameRef = useRef();
    const { createContact } = useContacts()

    async function handleSubmit(e) {
        e.preventDefault()
        const addContactErr = await createContact(idRef.current.value, nameRef.current.value)

        if (!addContactErr) {
            closeModal()
            setAddFriendErr("")
            return
        }

        setAddFriendErr(addContactErr)
    }



    return (
        <>
            <Modal.Header closeButton>Create Contact</Modal.Header>
            <Modal.Body>
                <Form onSubmit={handleSubmit}>
                    <Form.Group>
                        <Form.Label>Id</Form.Label>
                        <Form.Control type="text" ref={idRef} required />
                    </Form.Group>
                    <Form.Group>
                        <Form.Label>Name</Form.Label>
                        <Form.Control type="text" ref={nameRef} required />
                    </Form.Group>
                    <p className="err-message">{addFriendErr}</p>
                    <Button type="submit">Create</Button>
                </Form>
            </Modal.Body>
        </>
    )
}
