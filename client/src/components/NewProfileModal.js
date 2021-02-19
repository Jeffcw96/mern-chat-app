import React, { useState } from 'react'
import { Modal, Form, Button } from 'react-bootstrap'
import axios from 'axios'
import { getCookie } from '../components/Cookie'
import { useProfile } from '../contexts/ProfileProvider'
import userProfilePic from '../static/user.svg'
import uploadPhotoIcon from '../static/camera.svg'

const URL = "http://localhost:5000/"
export default function NewProfileModal({ closeProfileModal }) {

    const { profile } = useProfile()
    let profilePic = userProfilePic

    if (profile.picture !== "" && profile.picture !== undefined) {

        profilePic = profile.picture
    }
    console.log("profilePic", profilePic);

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
            <Modal.Header closeButton>Your Profile</Modal.Header>
            <Modal.Body>
                <Form >
                    <div className="profile-pic-container">
                        <img src={profilePic} className="profile-pic" />
                        <label for="profilePic" className="upload-profile-pic-container">
                            <img src={uploadPhotoIcon} className="upload-profile-pic-logo" />
                        </label>
                        <input type="file" onChange={(e) => handleUploadProfile(e)} id="profilePic" style={{ display: 'none' }} />
                    </div>

                    <Button type="submit">Start Chating</Button>

                </Form>
            </Modal.Body>
        </>
    )
}
