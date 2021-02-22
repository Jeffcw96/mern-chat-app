import React, { useState, useRef, useEffect } from 'react'
import { Modal, Form, Button, Tab, Nav } from 'react-bootstrap'
import axios from 'axios'
import { getCookie } from '../components/Cookie'
import { useProfile } from '../contexts/ProfileProvider'
import userProfilePic from '../static/user.svg'
import uploadPhotoIcon from '../static/camera.svg'
import authIcon from '../static/auth.svg'

const PROFILE_CONTENT = "profile_modal"
const AUTH_CONTENT = "auth_modal"
const URL = "http://localhost:5000/"
export default function NewProfileModal({ closeProfileModal }) {
    const [activeKey, setActiveKey] = useState(PROFILE_CONTENT)
    const { profile, setProfile } = useProfile()
    const [updatedProfile, setUpdatedProfile] = useState(profile)
    const saveBtn = useRef();
    const confirmPassword = useRef();
    const authIconTab = useRef();
    const profileIconTab = useRef();

    const [profilePic, setProfilePic] = useState(() => {
        if (profile.picture !== "" && profile.picture !== undefined) {
            return profile.picture
        } else {
            return userProfilePic
        }
    })

    function ObjectEqual(object1, object2) {
        const keys1 = Object.keys(object1);
        const keys2 = Object.keys(object2);

        if (keys1.length !== keys2.length) {
            return false;
        }

        for (let key of keys1) {
            if (object1[key] !== object2[key]) {
                return false;
            }
        }
        return true;
    }

    async function handleUploadProfile(e) {
        console.log("e", e)
        const data = new FormData();
        data.append('file', e.target.files[0]);

        const response = await axios.post('profile/uploadProfile', data, {
            headers: {
                "Authorization": "Bearer " + getCookie("token")
            }
        })
        setProfilePic(response.data.location)
        setProfile((prevProf) => {
            return { ...prevProf, picture: response.data.location }
        })
        console.log(response)
    }

    async function handleSubmit(e) {
        e.preventDefault()
        let jsonBody = {}
        jsonBody.name = updatedProfile.name;
        jsonBody.bio = updatedProfile.bio;


    }

    async function handleUserInfo(e, type) {
        setUpdatedProfile(prevProfileVal => {
            if (type == "name") {
                return { ...prevProfileVal, name: e.target.value }
            } else if (type == "bio") {
                return { ...prevProfileVal, bio: e.target.value }
            }
        })
        saveBtn.current.classList.add("d-block");
    }

    useEffect(() => {

        if (ObjectEqual(updatedProfile, profile)) {
            console.log('no change')
            saveBtn.current.classList.remove("d-block");
        }

    }, [updatedProfile])

    useEffect(() => {
        if (activeKey === PROFILE_CONTENT) {
            authIconTab.current.classList.add('d-block');
            authIconTab.current.classList.remove('d-none');
            profileIconTab.current.classList.remove('d-block');
            profileIconTab.current.classList.add('d-none');

        } else {
            authIconTab.current.classList.remove('d-block');
            authIconTab.current.classList.add('d-none');
            profileIconTab.current.classList.add('d-block');
            profileIconTab.current.classList.remove('d-none');
        }

    }, [activeKey])

    return (
        <>
            <Modal.Header closeButton>Your Profile</Modal.Header>
            <Modal.Body>
                <Tab.Container activeKey={activeKey} onSelect={setActiveKey}>
                    <div className="swap-icon-container">
                        <Nav.Link eventKey={AUTH_CONTENT} className="swap-icon-link" ref={authIconTab}>
                            <img src={authIcon} className="swap-profile-modal-icon" alt="profile picture" />
                        </Nav.Link>
                        <Nav.Link eventKey={PROFILE_CONTENT} className="swap-icon-link d-none" ref={profileIconTab}>
                            <img src={userProfilePic} className="swap-profile-modal-icon" alt="profile picture" />
                        </Nav.Link>
                    </div>
                    <Tab.Content>
                        <Tab.Pane eventKey={PROFILE_CONTENT}>
                            <div className="profile-pic-container">
                                <img src={profilePic} className="profile-pic" alt="profile picture" />
                                <label htmlFor="profilePic" className="upload-profile-pic-container">
                                    <img src={uploadPhotoIcon} className="upload-profile-pic-logo" alt="update profile picture icon" />
                                </label>
                                <input type="file" onChange={(e) => handleUploadProfile(e)} id="profilePic" style={{ display: 'none' }} />
                            </div>
                            <Form onSubmit={handleSubmit}>
                                <Form.Group className="d-flex justify-content-between align-items-center my-4 px-5">
                                    <Form.Label className="w-25">Id:</Form.Label>
                                    <Form.Control type="text" className="w-75" disabled value={updatedProfile._id} />
                                </Form.Group>
                                <Form.Group className="d-flex justify-content-between align-items-center my-4 px-5">
                                    <Form.Label className=" w-25">Email:</Form.Label>
                                    <Form.Control type="text" className="w-75" disabled value={updatedProfile.email} />
                                </Form.Group>
                                <Form.Group className="d-flex justify-content-between align-items-center my-4 px-5">
                                    <Form.Label className="w-25">Name:</Form.Label>
                                    <Form.Control type="text" className="w-75" onChange={(e) => handleUserInfo(e, 'name')} value={updatedProfile.name} />
                                </Form.Group>
                                <Form.Group className="d-flex justify-content-between align-items-center my-4 px-5">
                                    <Form.Label className="w-25">Bio:</Form.Label>
                                    <Form.Control type="text" className="w-75" onChange={(e) => handleUserInfo(e, 'bio')} value={updatedProfile.bio} />
                                </Form.Group>
                                <Form.Group className="d-none text-right my-4 px-5" ref={saveBtn}>
                                    <Button type="submit">Save</Button>
                                </Form.Group>
                            </Form>
                        </Tab.Pane>
                        <Tab.Pane eventKey={AUTH_CONTENT}>
                            <p>Auth content</p>
                        </Tab.Pane>
                    </Tab.Content>
                </Tab.Container>
            </Modal.Body>
        </>
    )
}
