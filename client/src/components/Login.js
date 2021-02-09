import React, { useRef, useState, useEffect, useReducer } from 'react';
import { Button, Container, Form, Tab, Nav } from 'react-bootstrap'
import { v4 as uuidV4 } from 'uuid'
import Google from './Google'
import Authentication from './Authentication'
import axios from 'axios'
import { setCookie } from './Cookie'

const REGISTER_KEY = "register"
const LOGIN_KEY = "login"
const ERR = {
    REGISTER: 'cPassword',
    EMAIL: 'email',
    PASSWORD: 'password'
}
const URL = "http://localhost:5000/"

const InitialState = {
    email: "",
    password: "",
    cPassword: ""
}
export default function Login({ onIdSubmit }) {
    const idRef = useRef()
    const emailRef = useRef();
    const passwordRef = useRef();
    const cPasswordRef = useRef();

    const [successMsg, setSuccessMsg] = useState("")
    const [activeKey, setActiveKey] = useState(LOGIN_KEY)
    const [state, dispatch] = useReducer(reducer, InitialState);


    function handleSubmit(e) {
        e.preventDefault()
        onIdSubmit(idRef.current.value);
    }

    function createNewId() {
        onIdSubmit(uuidV4)
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
    async function Login() {
        console.log("login")
        try {
            if (passwordRef.current.value === "") {
                passwordRef.current.classList.add('err');
                dispatch({ type: ERR.PASSWORD, payload: 'Please Fill in your Password' });
                return
            }

            if (emailRef.current.value === "") {
                emailRef.current.classList.add('err');
                dispatch({ type: ERR.EMAIL, payload: 'Please Fill in your Email' });
                return
            }

            let user = {}
            user.email = emailRef.current.value;
            user.password = passwordRef.current.value;

            const response = await axios.post(URL + "auth/login", user);
            console.log("response", response)
            const token = response.data.token;

            setCookie("token", token, 0.8);

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
            const response = await axios.post(URL + "auth/register", user);

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
                            <Authentication type={LOGIN_KEY} emailRef={emailRef} passwordRef={passwordRef} errorRef={state} />
                        </Tab.Pane>
                        <Tab.Pane eventKey={REGISTER_KEY}>
                            <Authentication type={REGISTER_KEY} emailRef={emailRef} passwordRef={passwordRef} cPasswordRef={cPasswordRef} errorRef={state} />
                            <p className="success-message">{successMsg}</p>
                        </Tab.Pane>
                    </Tab.Content>
                    <Tab.Content>
                        <Tab.Pane eventKey={LOGIN_KEY}>
                            <Button type="submit" className="mr-2" eventKey={LOGIN_KEY} onClick={() => { Login() }}>Login</Button>
                            <Button variant="secondary" className="mr-2" onClick={createNewId}>Login as a guest</Button>
                            <Google label={"Sign In with Google"} onSubmit={onIdSubmit} />
                        </Tab.Pane>
                        <Tab.Pane eventKey={REGISTER_KEY}>
                            <Button type="button" className="mr-2" eventKey={LOGIN_KEY} onClick={() => { Register() }}>Register</Button>
                            <Google label={"Sign Up with Google"} onSubmit={onIdSubmit} />
                        </Tab.Pane>
                    </Tab.Content>
                </Tab.Container>

                {/* <Button type="submit" className="mr-2">Login</Button> */}

            </Form>
        </Container>
    )
}
