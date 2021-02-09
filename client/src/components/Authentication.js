import React from 'react'
import { Button, Container, Form, Tab, Nav } from 'react-bootstrap'

export default function Authentication({ type, emailRef, passwordRef, cPasswordRef = null, errorRef }) {
    return (
        <>
            <Form.Group>
                <Form.Label>Email</Form.Label>
                <Form.Control type="email" ref={emailRef} required placeholder="Enter your email address" />
                <p className="err-message">{errorRef.email}</p>
            </Form.Group>
            <Form.Group>
                <Form.Label>Password</Form.Label>
                <Form.Control type="password" ref={passwordRef} required placeholder="Enter your password" />
                <p className="err-message">{errorRef.password}</p>
            </Form.Group>
            {type === "register" ?
                <Form.Group>
                    <Form.Label>Comfirm Password</Form.Label>
                    <Form.Control type="password" ref={cPasswordRef} required placeholder="Enter your confirm password" />
                    <p className="err-message">{errorRef.cPassword}</p>
                </Form.Group>
                : null
            }
        </>
    )
}
