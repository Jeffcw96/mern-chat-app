import React, { useState, useEffect } from 'react'
import Login from './Login'
import useLocalStorage from '../hooks/useLocalStorage'
import Dashboard from './Dashboard'
import { ContactsProvider } from '../contexts/ContactsProvider'
import { ConversationsProvider } from '../contexts/ConversationsProvider'
import { SocketProvider } from '../contexts/SocketProvider'
import { setCookie, getCookie, deleteCookie } from './Cookie'
import axios from 'axios'
import '../App.css'

const URL = "http://localhost:5000/"
function App() {
  const [id, setId] = useLocalStorage("id")
  const [tokenValid, setTokenValid] = useState(false)

  async function verifyUser() {
    try {
      const getRefreshToken = getCookie('RefreshToken');
      const response = await axios.get(URL + "auth/verifyUser", {
        headers: {
          "Authorization": "Bearer " + getCookie('token'),
          "RefreshToken": getRefreshToken
        }
      })
      const { id, token, refreshToken } = response.data

      if (refreshToken) {
        setCookie("RefreshToken", refreshToken, 6);
        setCookie("token", token, 5);
        console.log("id")
        setId(id)
        setTokenValid(true)
        return
      }

      setId(id)
      setTokenValid(true);
    } catch (error) {
      console.log("error", error)
      setTokenValid(false);
      deleteCookie("token");
      deleteCookie("RefreshToken");
    }
  }


  useEffect(() => {
    verifyUser()
  }, [])


  const dashboard = (
    <SocketProvider id={id}>
      <ContactsProvider>
        <ConversationsProvider id={id}>
          <Dashboard id={id} />
        </ConversationsProvider>
      </ContactsProvider>
    </SocketProvider>
  )

  return (
    id && tokenValid ? dashboard : <Login onIdSubmit={setId} setTokenValid={setTokenValid} />
  );
}

export default App;
