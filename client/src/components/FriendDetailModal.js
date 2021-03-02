import React, { useState, useRef, useEffect } from 'react'
import { Modal, Form, Button } from 'react-bootstrap'
import userImg from '../static/user.svg'
import axios from 'axios'
import { getCookie } from './Cookie'
import { useContacts } from '../contexts/ContactsProvider'

export default function FriendDetailModal({ friend, name, closeFriendModal }) {
    const saveBtn = useRef();
    const [friendName, setFriendName] = useState(name)
    const { setContacts } = useContacts()

    async function updateFriendName(e) {
        console.log("l;alalal")
        try {
            e.preventDefault()
            let jsonBody = {}
            jsonBody.id = friend._id;
            jsonBody.name = friendName;

            const response = await axios.post("social/updateName", jsonBody, {
                headers: {
                    "Authorization": "Bearer " + getCookie('token')
                }
            })

            if (response.status === 200) {
                setContacts(response.data.friends)
                closeFriendModal()
            }

        } catch (error) {
            console.error(error.message)
        }
    }

    async function deleteFriend() {
        try {
            let jsonBody = {}
            jsonBody.id = friend._id;
            jsonBody.name = friendName;

            const response = await axios.post("social/deleteContact", jsonBody, {
                headers: {
                    "Authorization": "Bearer " + getCookie('token')
                }
            })

            if (response.status === 200) {
                setContacts(response.data.friends);
                closeFriendModal()
            }
        } catch (error) {
            console.error(error.response.data.error);
        }
    }

    function handleFriendName(e) {
        setFriendName(e.target.value)
    }

    useEffect(() => {
        if (friendName !== name) {
            saveBtn.current.classList.add("d-block");
        } else {
            saveBtn.current.classList.remove("d-block");
        }
    }, [friendName])


    return (
        <>
            <Modal.Header closeButton>{name}</Modal.Header>
            <Modal.Body className="position-relative">
                <Button type="button" variant="danger" className="position-absolute top-0 left-0" size="sm" onClick={() => { deleteFriend() }}>Delete</Button>
                <div className="profile-pic-container">
                    {
                        friend.picture ?
                            <img src={friend.picture} className="avatar" style={{ width: '200px', height: '200px' }} /> :
                            <img src={userImg} className="avatar" style={{ width: '200px', height: '200px' }} />
                    }
                </div>
                <Form onSubmit={updateFriendName}>
                    <Form.Group className="d-flex justify-content-between align-items-center my-4 px-5">
                        <Form.Label className="w-25">Id:</Form.Label>
                        <Form.Control type="text" className="w-75" disabled value={friend._id} />
                    </Form.Group>
                    <Form.Group className="d-flex justify-content-between align-items-center my-4 px-5">
                        <Form.Label className=" w-25">Email:</Form.Label>
                        <Form.Control type="text" className="w-75" disabled value={friend.email} />
                    </Form.Group>
                    <Form.Group className="d-flex justify-content-between align-items-center my-4 px-5">
                        <Form.Label className="w-25">Name:</Form.Label>
                        <Form.Control type="text" className="w-75" value={friendName} onChange={(e) => handleFriendName(e)} />
                    </Form.Group>
                    <Form.Group className="d-flex justify-content-between align-items-center my-4 px-5">
                        <Form.Label className="w-25">Bio:</Form.Label>
                        <Form.Control type="text" className="w-75" disabled value={friend.bio} />
                    </Form.Group>
                    <Form.Group className="d-none text-right my-4 px-5" ref={saveBtn}>
                        <Button type="submit">Save</Button>
                    </Form.Group>
                </Form>
            </Modal.Body>
        </>
    )
}
