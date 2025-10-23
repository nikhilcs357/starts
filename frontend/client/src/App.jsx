
import { LogIn } from 'lucide-react'
import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Feed from './pages/Feed'
import Messages from './pages/Messages'
import ChatBox from './pages/ChatBox'
import Connections from './pages/Connections'
import Discover from './pages/Discover'
import Profile from './pages/Profile'
import CreatePost from './pages/CreatePost'

const App = () => {
  return (
    <>
       <Routes>

        <Route path='/' element ={<LogIn/>}>
          <Route index element ={<Feed/>}/>
            <Route path='Messages' index element ={<Messages/>}/>
                <Route path='Messages/:userId' index element ={<ChatBox/>}/>
                    <Route path='Connections' index element ={<Connections/>}/>
                     <Route path='Discover' index element ={<Discover/>}/>
                      <Route path='Profile' index element ={<Profile/>}/>
                        <Route path='Profile/:ProfileId' index element ={<Profile/>}/>
                          <Route path='CreatePost' index element ={<CreatePost/>}/>







        </Route>
       </Routes>
    </>
  )
}

export default App