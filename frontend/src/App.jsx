import React, { useEffect, useRef } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { useUser, useAuth } from "@clerk/clerk-react";

import Feed from "./pages/Feed";
import Messages from "./pages/Messages";
import ChatBox from "./pages/ChatBox";
import Connections from "./pages/Connections";
import Discover from "./pages/Discover";
import Profile from "./pages/Profile";
import CreatePost from "./pages/CreatePost";
import Login from "./pages/Login";
import Layout from "./pages/Layout";
import toast, { Toaster } from "react-hot-toast";
import { useDispatch } from "react-redux";
import { fetchUser } from "./features/user/userSlice";
import { fetchConnections } from "./features/connection/connectionsSlice";
import { addMessage } from "./features/messages/messagesSlice";
import Notification from "./components/Notification";

const App = () => {
  const { user } = useUser()
  const { getToken } = useAuth()
  const { pathname } = useLocation()
  const pathnameRef = useRef(pathname)

  const dispatch = useDispatch();

  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        const token = await getToken();
        dispatch(fetchUser(token))
        dispatch(fetchConnections(token))   
      }
    };

    fetchData();
  }, [user, getToken, dispatch]);

  useEffect(()=>{
    pathnameRef.current = pathname
  },[pathname])  

  useEffect(()=>{
    if(user){
      const eventSource = new EventSource(import.meta.env.VITE_BASEURL + '/api/message/' + user._id);

      eventSource.onmessage = (event)=>{
        const message =JSON.parse(event.data)

        if(pathnameRef.current === ('/messages/' + message.from_user_id._id)){
          dispatch(addMessage(message))
        }else{
        toast.custom((t)=>(
          <Notification t={t} message={message}/>
        ), {position: "bottom-right"})
        }
    }
    return()=>{
      eventSource.close()
    }
  }
},[user, dispatch])

  return (
    <>
      <Toaster />

      <Routes>
        <Route path="/" element={!user ? <Login /> : <Layout />}>
          <Route index element={<Feed />} />
          <Route path="Messages" element={<Messages />} />
          <Route path="Messages/:userId" element={<ChatBox />} />
          <Route path="Connections" element={<Connections />} />
          <Route path="Discover" element={<Discover />} />
          <Route path="Profile" element={<Profile />} />
          <Route path="Profile/:ProfileId" element={<Profile />} />
          <Route path="/create-post" element={<CreatePost />} />
        </Route>
      </Routes>
    </>
  );
};

export default App;
