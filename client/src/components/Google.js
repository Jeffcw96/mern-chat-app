import React from 'react'
import { GoogleLogin } from 'react-google-login'
import { setCookie } from './Cookie'
import axios from 'axios'

export default function Google({ label, onSubmit, setTokenValid }) {
    const URL = 'http://localhost:5000/';
    async function googleSuccess(response) {
        try {
            console.log("success response", response);
            const { id_token } = response.tokenObj;
            const googleAcc = { id_token };

            const res = await axios.post(URL + 'auth/googleLogin', googleAcc);
            const { token, id } = res.data;
            setCookie("token", token, 0.8);
            onSubmit(id)
            setTokenValid(true)

        } catch (error) {
            console.error(error)
        }
    }

    function googleFailed(res) {
        console.log("failed response", res);
    }
    return (
        <span className="google-btn">
            <GoogleLogin
                clientId="453452665261-o94lt4oeikt9mfscc3vqul28e8r6fut5.apps.googleusercontent.com"
                buttonText={label}
                onSuccess={googleSuccess}
                onFailure={googleFailed}
                cookiePolicy={'single_host_origin'}
                style={{ marginLeft: "200px" }}
            />
        </span>
    )
}
