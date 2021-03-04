import React, { useState, useCallback } from 'react'
import { Form, InputGroup, Button } from 'react-bootstrap'
import { useConversations } from '../contexts/ConversationsProvider'
import useEventListener from '../hooks/useEventListener'
import sendIcon from '../static/send.svg'

export default function OpenConversation() {
    const [isTyping, setIsTyping] = useState(false)
    const [text, setText] = useState('')
    const { sendMessage, selectedConversation } = useConversations()
    const setRef = useCallback(node => {
        if (node) {
            node.scrollIntoView({ smooth: true })
        }
    }, [])

    function handleSubmit(e) {
        e.preventDefault()
        sendMessage(selectedConversation.recipients.map(r => r.id), text)
        setText('')
    }

    useEventListener('keypress', (e) => {
        if (!e.shiftKey) {
            if (e.key === "Enter" && isTyping && text.trim().length !== 0) {
                e.preventDefault()
                sendMessage(selectedConversation.recipients.map(r => r.id), text)
                setText('')
            }
        }
    })






    return (
        <div className="d-flex flex-column flex-grow-1">
            <div className="flex-grow-1 overflow-auto">
                <div className="d-flex flex-column align-items-start justify-content-end px-3">
                    {selectedConversation.messages.map((message, index) => {
                        const lastMessage = selectedConversation.messages.length - 1
                        return (
                            <div
                                ref={lastMessage ? setRef : null}
                                key={index}
                                className={`my-1 d-flex flex-column position-relative ${message.fromMe ? 'align-self-end align-items-end' : "align-items-start"}`}
                            >
                                <div className={`${message.fromMe ? 'chat-sender-triangle' : 'chat-receiver-triangle'}`}></div>
                                <div className={`rounded px-2 py-1 ${message.fromMe ? 'bg-primary text-white' : 'border bg-white'}`}>
                                    {message.text}
                                </div>
                                <div className={`text-muted small ${message.fromMe ? 'text-right' : ''}`}>
                                    {message.fromMe ? "You" : message.senderName}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
            <Form onSubmit={handleSubmit}>
                <Form.Group className="m-0 mx-3">
                    <InputGroup>
                        <Form.Control
                            as="textarea"
                            required
                            value={text}
                            onChange={e => setText(e.target.value)}
                            onFocus={() => setIsTyping(true)}
                            onBlur={() => setIsTyping(false)}
                            style={{ height: '50px', resize: 'none' }} />
                        <InputGroup.Append>
                            <Button type="submit" variant="secondary" style={{ padding: '0px 15px' }}><img src={sendIcon} style={{ width: '20px' }} /></Button>
                        </InputGroup.Append>
                    </InputGroup>
                </Form.Group>
            </Form>

        </div>
    )
}
