import React, { useState } from 'react'
import { Modal, Form, Button } from 'react-bootstrap'
import axios from 'axios'
import { getCookie } from '../components/Cookie'

const URL = "http://localhost:5000/"
export default function NewProfileModal({ closeProfileModal }) {

    async function handleUploadProfile(e) {
        console.log("e", e)
        const data = new FormData();
        data.append('file', e.target.files[0]);

        const response = await axios.post(URL + 'profile/uploadProfile', data, {
            headers: {
                "Authorization": "Bearer " + getCookie("token")
            }
        })

        console.log(response)
    }

    return (
        <>
            <Modal.Header closeButton>Create Chat</Modal.Header>
            <Modal.Body>
                <Form >
                    <Button type="submit">Start Chating</Button>
                    <input type="file" onChange={(e) => handleUploadProfile(e)} />
                </Form>
            </Modal.Body>
        </>
    )
}
