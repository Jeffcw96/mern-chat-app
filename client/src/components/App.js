import React, { useState, useEffect } from 'react'
import Login from './Login'
import useLocalStorage from '../hooks/useLocalStorage'
import Dashboard from './Dashboard'
import { ContactsProvider } from '../contexts/ContactsProvider'
import { ConversationsProvider } from '../contexts/ConversationsProvider'
import { SocketProvider } from '../contexts/SocketProvider'
import { ProfileProvider } from '../contexts/ProfileProvider'
import { setCookie, getCookie, deleteCookie } from './Cookie'
import sorry from '../static/sorry.svg'
import axios from 'axios'
import '../App.css'


function App() {
  const [id, setId] = useLocalStorage("id")
  const [tokenValid, setTokenValid] = useState(false)
  const [allowScreenWidth, setAllowScreenWidth] = useState(false)

  async function verifyUser() {
    try {
      const getRefreshToken = getCookie('RefreshToken');
      const response = await axios.get("auth/verifyUser", {
        headers: {
          "Authorization": "Bearer " + getCookie('token'),
          "RefreshToken": getRefreshToken
        }
      })
      const { id, token, refreshToken } = response.data

      if (refreshToken) {
        setCookie("RefreshToken", refreshToken, 6);
        setCookie("token", token, 5);
        setCookie("userRole", "tempUser", 0.8);
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
    if (window.innerWidth >= 850) {
      setAllowScreenWidth(true)
    }

  }, [])


  const dashboard = (
    <SocketProvider id={id}>
      <ContactsProvider>
        <ConversationsProvider id={id}>
          <ProfileProvider>
            <Dashboard id={id} />
          </ProfileProvider>
        </ConversationsProvider>
      </ContactsProvider>
    </SocketProvider>
  )

  const notAllowScreenRender = (
    <div style={{ minHeight: '100vh', position: 'relative' }}>
      <div className="sorry-img-container">
        <img src={sorry} alt="sorry" style={{ width: '100%' }} />
      </div>
      <div className="window-size-not-allowed-msg">I'm apologized that currently the project is not supporting mobile view. <br />
            Stay tuned for coming mobile application
      </div>
    </div>
  )

  return (
    allowScreenWidth ?
      id && tokenValid ? dashboard : <Login onIdSubmit={setId} setTokenValid={setTokenValid} />
      : notAllowScreenRender
  );
}

export default App;
