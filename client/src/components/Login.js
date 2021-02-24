import React, { useRef, useState, useEffect, useReducer } from 'react';
import { Button, Container, Form, Tab, Nav } from 'react-bootstrap'
import Google from './Google'
import axios from 'axios'
import { setCookie } from './Cookie'

const REGISTER_KEY = "register"
const LOGIN_KEY = "login"
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
export default function Login({ onIdSubmit, setTokenValid }) {
    const idRef = useRef()
    const emailRef = useRef();
    const passwordRef = useRef();
    const cPasswordRef = useRef();

    const [loginState, setLoginState] = useState({ email: "", password: "" })
    const [successMsg, setSuccessMsg] = useState("")
    const [activeKey, setActiveKey] = useState(LOGIN_KEY)
    const [state, dispatch] = useReducer(reducer, InitialState);



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

    function ResetInputAndMsg() {
        emailRef.current.value = ""
        passwordRef.current.value = ""
        passwordRef.current.classList.remove('err');
        setSuccessMsg("")
    }

    useEffect(() => {
        ResetInputAndMsg()
        dispatch({ type: 'RESET' })
    }, [activeKey])


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
            setCookie("token", token, 0.8);
            onIdSubmit(id)
            setTokenValid(true)

        } catch (error) {
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
                    </Nav>
                    <Tab.Content>
                        <Tab.Pane eventKey={LOGIN_KEY}>
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
                        <Tab.Pane eventKey={REGISTER_KEY}>
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
                    </Tab.Content>
                </Tab.Container>


            </Form>
        </Container>
    )
}
