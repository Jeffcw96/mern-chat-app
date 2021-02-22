import React, { useContext, useState, useEffect } from 'react'
import { getCookie } from '../components/Cookie'
import axios from 'axios'

const ProfileContext = React.createContext()
const URL = "http://localhost:5000/"
export function useProfile() {
    return useContext(ProfileContext)
}


export function ProfileProvider({ children }) {
    const [profile, setProfile] = useState({})

    useEffect(() => {
        getUserProfile()
    }, [])

    async function getUserProfile() {
        const response = await axios.get("profile/get", {
            headers: {
                "Authorization": "Bearer " + getCookie("token")
            }
        })
        const userProfile = response.data.profile;
        console.log("userProfile", userProfile)
        setProfile(userProfile)
    }


    return (
        <ProfileContext.Provider value={{ profile, setProfile }}>
            {children}
        </ProfileContext.Provider>
    )
}
