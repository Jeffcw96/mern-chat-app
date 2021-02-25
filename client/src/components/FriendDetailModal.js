import React from 'react'
import { Modal, Form } from 'react-bootstrap'
import userImg from '../static/user.svg'

export default function FriendDetailModal({ friend }) {
    return (
        <>
            <Modal.Header closeButton>{friend.name}</Modal.Header>
            <Modal.Body>
                <div className="profile-pic-container">
                    {
                        friend.picture ?
                            <img src={friend.picture} className="avatar" style={{ width: '200px', height: '200px' }} /> :
                            <img src={userImg} className="avatar" style={{ width: '200px', height: '200px' }} />
                    }
                </div>
                <Form>
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
                        <Form.Control type="text" className="w-75" value={friend.name} />
                    </Form.Group>
                    <Form.Group className="d-flex justify-content-between align-items-center my-4 px-5">
                        <Form.Label className="w-25">Bio:</Form.Label>
                        <Form.Control type="text" className="w-75" value={friend.bio} />
                    </Form.Group>
                </Form>
            </Modal.Body>
        </>
    )
}
