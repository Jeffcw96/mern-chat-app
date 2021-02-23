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
const PASSWORD = "password"
const NEWPASSWORD = "newPassword"
const NAME = "name"
const BIO = "bio"
const authInit = {
    password: "",
    newPassword: ""
}

export default function NewProfileModal({ closeProfileModal }) {
    const [activeKey, setActiveKey] = useState(PROFILE_CONTENT)
    const { profile, setProfile } = useProfile()
    const [updatedProfile, setUpdatedProfile] = useState(profile)
    const [passwordErr, setPasswordErr] = useState("");
    const [authInfo, setAuthInfo] = useState(authInit)
    const saveBtn = useRef();
    const updateBtn = useRef();
    const authIconTab = useRef();
    const iconTabContainer = useRef();
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
        try {
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
        } catch (error) {
            console.error("error", error.message)
        }

    }

    async function handleProfileSubmit(e) {
        try {
            e.preventDefault()
            let jsonBody = {}
            jsonBody.name = updatedProfile.name;
            jsonBody.bio = updatedProfile.bio;

            const response = await axios.post('profile/updateInfo', jsonBody, {
                headers: {
                    "Authorization": "Bearer " + getCookie("token")
                }
            })

            setProfile(response.data.user)
            saveBtn.current.classList.remove("d-block");
        } catch (error) {
            console.error("error", error.message)
        }
    }

    async function handlePasswordSubmit(e) {
        try {
            e.preventDefault()
            let jsonBody = {}
            jsonBody.password = authInfo.password;
            jsonBody.newPassword = authInfo.newPassword;

            const response = await axios.post('profile/updatePassword', jsonBody, {
                headers: {
                    "Authorization": "Bearer " + getCookie("token")
                }
            })

            if (response.status === 200) {
                setPasswordErr("")
                closeProfileModal()
            }

        } catch (error) {
            console.error("error", error.message)
            setPasswordErr(error.response.data.error)
        }
    }


    function handleUserInfo(e, type) {
        setUpdatedProfile(prevProfileVal => {
            if (type === NAME) {
                return { ...prevProfileVal, name: e.target.value }
            } else if (type === BIO) {
                return { ...prevProfileVal, bio: e.target.value }
            }
        })
        saveBtn.current.classList.add("d-block");
    }

    function handlePasswordInput(e, type) {
        setAuthInfo(prevAuthInfo => {
            if (type === PASSWORD) {
                return { ...prevAuthInfo, password: e.target.value }
            } else if (type === NEWPASSWORD) {
                return { ...prevAuthInfo, newPassword: e.target.value }
            }
        })
        updateBtn.current.classList.add("d-block");
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

            updateBtn.current.classList.remove("d-block");
            setAuthInfo(authInit)
            setPasswordErr("")

        } else {
            authIconTab.current.classList.remove('d-block');
            authIconTab.current.classList.add('d-none');
            profileIconTab.current.classList.add('d-block');
            profileIconTab.current.classList.remove('d-none');
        }
    }, [activeKey])

    useEffect(() => {
        if (getCookie("userRole") === "google") {
            iconTabContainer.current.classList.add("d-none");
        }
    }, [])

    return (
        <>
            <Modal.Header closeButton>Your Profile</Modal.Header>
            <Modal.Body>
                <Tab.Container activeKey={activeKey} onSelect={setActiveKey}>
                    <div className="swap-icon-container" ref={iconTabContainer}>
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
                            <Form onSubmit={handleProfileSubmit}>
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
                                    <Form.Control type="text" className="w-75" onChange={(e) => handleUserInfo(e, NAME)} value={updatedProfile.name} />
                                </Form.Group>
                                <Form.Group className="d-flex justify-content-between align-items-center my-4 px-5">
                                    <Form.Label className="w-25">Bio:</Form.Label>
                                    <Form.Control type="text" className="w-75" onChange={(e) => handleUserInfo(e, BIO)} value={updatedProfile.bio} />
                                </Form.Group>
                                <Form.Group className="d-none text-right my-4 px-5" ref={saveBtn}>
                                    <Button type="submit">Save</Button>
                                </Form.Group>
                            </Form>
                        </Tab.Pane>
                        <Tab.Pane eventKey={AUTH_CONTENT}>
                            <Form onSubmit={handlePasswordSubmit}>
                                <Form.Group className="d-flex justify-content-between align-items-center my-4 px-5">
                                    <Form.Label className="w-25">Current Password:</Form.Label>
                                    <Form.Control type="password" className="w-75" value={authInfo.password} onChange={(e) => handlePasswordInput(e, PASSWORD)} />
                                </Form.Group>
                                <Form.Group className="d-flex justify-content-between align-items-center my-4 px-5">
                                    <Form.Label className=" w-25">New Password:</Form.Label>
                                    <Form.Control type="password" className="w-75" value={authInfo.newPassword} onChange={(e) => handlePasswordInput(e, NEWPASSWORD)} />
                                </Form.Group>
                                <p className="px-5" style={{ color: "red" }}>{passwordErr}</p>
                                <Form.Group className="d-none text-right my-4 px-5" ref={updateBtn}>
                                    <Button type="submit">Update</Button>
                                </Form.Group>
                            </Form>
                        </Tab.Pane>
                    </Tab.Content>
                </Tab.Container>
            </Modal.Body>
        </>
    )
}
