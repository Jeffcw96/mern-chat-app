import React, { useRef, useState, useEffect, useReducer } from 'react';
import { Button, Container, Form, Tab, Nav } from 'react-bootstrap'
import Google from './Google'
import axios from 'axios'
import { setCookie, deleteCookie } from './Cookie'

const REGISTER_KEY = "register"
const LOGIN_KEY = "login"
const FORGOT_KEY = "forgot"
const RESET_KEY = "reset"
const ERR = {
    REGISTER: 'cPassword',
    EMAIL: 'email',
    PASSWORD: 'password'
}

const InitialState = {
    email: "",
    password: "",
    cPassword: ""
}
export default function Login({ onIdSubmit, setTokenValid, setHideReset }) {
    const emailRef = useRef();
    const passwordRef = useRef();
    const cPasswordRef = useRef();
    const resetPasswordMsg = useRef();

    const [loginState, setLoginState] = useState({ email: "", password: "" });
    const [successMsg, setSuccessMsg] = useState("");
    const [activeKey, setActiveKey] = useState(LOGIN_KEY)
    const [state, dispatch] = useReducer(reducer, InitialState);
    const [forgotEmail, setForgotEmail] = useState("");
    const [resetToken, setResetToken] = useState("");
    const [isReset, setIsReset] = useState(false)
    const [resetState, setResetState] = useState({ password: "", cPassword: "" });
    const [resetResp, setResetResp] = useState({ error: "", success: "" });



    async function createTemporaryUser() {
        try {
            const response = await axios.get('auth/temporaryUser')
            const { refreshToken, token, id } = response.data

            setCookie("token", token, 5)
            setCookie("userRole", "tempUser", 0.8);
            setCookie("RefreshToken", refreshToken, 6)
            onIdSubmit(id)
            setTokenValid(true)

        } catch (error) {
            console.error(error.message)
        }
    }

    function enterLoginInfo(e, type) {
        setLoginState((prevLoginState) => {
            if (type === "email") {
                return { ...prevLoginState, email: e.target.value }

            } else if (type === "password") {
                return { ...prevLoginState, password: e.target.value }
            }
        })
    }

    function setResetPassword(e, type) {
        setResetState(prevResetState => {
            if (type === "password") {
                return { ...prevResetState, password: e.target.value }

            } else if (type === "cPassword") {
                return { ...prevResetState, cPassword: e.target.value }
            }
        })
    }

    function ResetInputAndMsg() {
        emailRef.current.value = ""
        passwordRef.current.value = ""
        passwordRef.current.classList.remove('err');
        setSuccessMsg("")
    }

    function ResetLoginState() {
        deleteCookie("RefreshToken");
        deleteCookie("token");
        deleteCookie("userRole");
        setTokenValid(false)
    }


    useEffect(() => {
        ResetInputAndMsg()
        dispatch({ type: 'RESET' })
    }, [activeKey])

    useEffect(() => {
        const query = (new URL(document.location)).searchParams;
        if (query.get('token')) {
            setResetToken(query.get('token'))
            setActiveKey(RESET_KEY)
            ResetLoginState()
        }

        if (query.get('action') === 'reset') {
            setIsReset(true)
            ResetLoginState()
        }

    }, [])


    function reducer(state, action) {
        switch (action.type) {
            case ERR.REGISTER:
                return { ...state, cPassword: action.payload }
            case ERR.EMAIL:
                return { ...state, email: action.payload }
            case ERR.PASSWORD:
                return { ...state, password: action.payload }
            case 'RESET':
                return InitialState
            default:
                return state
        }
    }
    async function UserLogin() {
        console.log("login")
        try {
            if (loginState.password === "") {
                dispatch({ type: ERR.PASSWORD, payload: 'Please Fill in your Password' });
                return
            }

            if (loginState.email === "") {
                dispatch({ type: ERR.EMAIL, payload: 'Please Fill in your Email' });
                return
            }

            let user = {}
            user.email = loginState.email
            user.password = loginState.password

            const response = await axios.post("auth/login", user);
            console.log("response", response)
            const { token, id } = response.data;
            setCookie("userRole", "normalUser", 0.8);
            setCookie("token", token, 0.8);
            onIdSubmit(id)
            setTokenValid(true)


        } catch (error) {
            console.error("error", error)
            console.log(error.response);
            const errorResult = error.response.data
            passwordRef.current.classList.add('err');
            errorResult.error.forEach(result => {
                dispatch({ type: result.param, payload: result.msg })
            });
        }
    }

    async function Register() {
        try {
            dispatch({ type: 'RESET' });

            if (passwordRef.current.value !== cPasswordRef.current.value) {
                passwordRef.current.classList.add('err');
                cPasswordRef.current.classList.add('err');
                dispatch({ type: ERR.REGISTER, payload: 'Please make sure the password is matched' })
                return
            }

            if (emailRef.current.value === "") {
                emailRef.current.classList.add('err');
                dispatch({ type: ERR.EMAIL, payload: 'Please Fill in your Email' })
                return
            }

            let user = {}
            user.email = emailRef.current.value;
            user.password = cPasswordRef.current.value;
            const response = await axios.post("auth/register", user);

            if (response.status === 200) {
                cPasswordRef.current.value = ""
                cPasswordRef.current.classList.remove('err');
                setSuccessMsg(response.data.status);
            }

        } catch (error) {
            console.log(error.response);
            const errorResult = error.response.data
            cPasswordRef.current.classList.add('err');
            errorResult.error.forEach(result => {
                dispatch({ type: result.param, payload: result.msg })
            });
        }

    }

    async function ForgotPassword() {
        try {
            let user = {}
            user.email = forgotEmail
            const response = await axios.post("auth/forgotPassword", user);

            if (response.status === 200) {
                resetPasswordMsg.current.value = "Please check you email for reset password"
                resetPasswordMsg.current.classList.remove("err-message")
                resetPasswordMsg.current.classList.add("success-message")
            }
        } catch (error) {
            resetPasswordMsg.current.value = error.response.data
            resetPasswordMsg.current.classList.remove("err-message")
            resetPasswordMsg.current.classList.add("success-message")
        }
    }

    async function ResetPassword() {
        console.log("reset password")
        try {
            if (resetState.password.trim() !== resetState.cPassword.trim()) {
                setResetResp(prevResetResp => {
                    return { ...prevResetResp, error: "Please ensure the password is matched" }
                })
                return
            }

            if (resetState.password.trim().length == 0 || resetState.cPassword.trim().length == 0) {
                setResetResp(prevResetResp => {
                    return { ...prevResetResp, error: "Please ensure password is not blank" }
                })
                return
            }

            let jsonBody = {}
            jsonBody.password = resetState.cPassword;

            const response = await axios.post("auth/resetPassword", jsonBody, {
                headers: {
                    "Authorization": "Bearer " + resetToken
                }
            })

            if (response.status === 200) {
                setResetResp({ success: "Reset Password Successful !", error: "" })
                return
            }

        } catch (error) {
            setResetResp(prevResetResp => {
                return { ...prevResetResp, error: error.response.data.error }
            })
        }
    }

    return (
        <Container className="align-items-center d-flex" style={{ height: '100vh' }}>
            {/* onSubmit={handleSubmit} */}
            <Form className="w-100" >
                <Tab.Container activeKey={activeKey} onSelect={setActiveKey}>
                    <Nav variant="tabs" className="justify-content-left">
                        <Nav.Item>
                            <Nav.Link eventKey={LOGIN_KEY}>Login</Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link eventKey={REGISTER_KEY}>Register</Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link eventKey={FORGOT_KEY}>Forgot Password</Nav.Link>
                        </Nav.Item>
                        {
                            isReset && resetToken ?
                                <Nav.Item>
                                    <Nav.Link eventKey={RESET_KEY}>Reset Password</Nav.Link>
                                </Nav.Item>
                                : null
                        }
                    </Nav>
                    <Tab.Content>
                        <Tab.Pane eventKey={LOGIN_KEY} className="mt-3">
                            <Form.Group>
                                <Form.Label>Email</Form.Label>
                                <Form.Control type="email" value={loginState.email} required placeholder="Enter your email address" onChange={(e) => enterLoginInfo(e, 'email')} />
                                <p className="err-message">{state.email}</p>
                            </Form.Group>
                            <Form.Group>
                                <Form.Label>Password</Form.Label>
                                <Form.Control type="password" value={loginState.password} required placeholder="Enter your password" onChange={(e) => enterLoginInfo(e, 'password')} />
                                <p className="err-message">{state.password}</p>
                            </Form.Group>
                        </Tab.Pane>

                        <Tab.Pane eventKey={REGISTER_KEY} className="mt-3">
                            <Form.Group>
                                <Form.Label>Email</Form.Label>
                                <Form.Control type="email" ref={emailRef} required placeholder="Enter your email address" />
                                <p className="err-message">{state.email}</p>
                            </Form.Group>
                            <Form.Group>
                                <Form.Label>Password</Form.Label>
                                <Form.Control type="password" ref={passwordRef} required placeholder="Enter your password" />
                                <p className="err-message">{state.password}</p>
                            </Form.Group>
                            <Form.Group>
                                <Form.Label>Comfirm Password</Form.Label>
                                <Form.Control type="password" ref={cPasswordRef} required placeholder="Enter your confirm password" />
                                <p className="err-message">{state.cPassword}</p>
                            </Form.Group>
                            <p className="success-message">{successMsg}</p>
                        </Tab.Pane>

                        <Tab.Pane eventKey={FORGOT_KEY} className="mt-3">
                            <Form.Group>
                                <Form.Label>Email</Form.Label>
                                <Form.Control type="email" value={forgotEmail} required placeholder="Enter your email address" onChange={(e) => setForgotEmail(e.target.value)} />
                            </Form.Group>
                            <p className="success-message" ref={resetPasswordMsg}></p>
                        </Tab.Pane>

                        <Tab.Pane eventKey={RESET_KEY} className="mt-3">
                            <Form.Group>
                                <Form.Label>New Password</Form.Label>
                                <Form.Control type="password" value={resetState.password} required placeholder="Enter your new password" onChange={(e) => setResetPassword(e, 'password')} />
                            </Form.Group>
                            <Form.Group>
                                <Form.Label>Comfirm Password</Form.Label>
                                <Form.Control type="password" value={resetState.cPassword} required placeholder="Enter your confirm password" onChange={(e) => setResetPassword(e, 'cPassword')} />
                                <p className="err-message">{resetResp.error}</p>
                            </Form.Group>
                            <p className="success-message">{resetResp.success}</p>
                        </Tab.Pane>
                    </Tab.Content>
                    <Tab.Content>
                        <Tab.Pane eventKey={LOGIN_KEY}>
                            <Button type="submit" className="mr-2" onClick={() => { UserLogin() }}>Login</Button>
                            <Button variant="secondary" className="mr-2" onClick={createTemporaryUser}>Login as a guest</Button>
                            <Google label={"Sign In with Google"} onSubmit={onIdSubmit} setTokenValid={setTokenValid} />
                        </Tab.Pane>
                        <Tab.Pane eventKey={REGISTER_KEY}>
                            <Button type="button" className="mr-2" onClick={() => { Register() }}>Register</Button>
                            <Google label={"Sign Up with Google"} onSubmit={onIdSubmit} setTokenValid={setTokenValid} />
                        </Tab.Pane>
                        <Tab.Pane eventKey={FORGOT_KEY}>
                            <Button type="button" className="mr-2" onClick={() => { ForgotPassword() }}>Submit</Button>
                        </Tab.Pane>
                        <Tab.Pane eventKey={RESET_KEY}>
                            <Button type="button" className="mr-2" onClick={() => { ResetPassword() }}>Submit</Button>
                        </Tab.Pane>
                    </Tab.Content>
                </Tab.Container>
            </Form>
        </Container>
    )
}
