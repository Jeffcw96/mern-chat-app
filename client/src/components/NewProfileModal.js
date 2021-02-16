import React, { useState } from 'react'
import { Modal, Form, Button } from 'react-bootstrap'

export default function NewProfileModal({ closeProfileModal }) {
    return (
        <>
            <Modal.Header closeButton>Create Chat</Modal.Header>
            <Modal.Body>
                <Form >
                    <Button type="submit">Start Chating</Button>
                </Form>
            </Modal.Body>
        </>
    )
}
