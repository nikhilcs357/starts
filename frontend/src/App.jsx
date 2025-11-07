import React from "react";
import { Layout as LayoutIcon, LogIn } from "lucide-react";
import { Route, Routes } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";

import Feed from "./pages/Feed";
import Messages from "./pages/Messages";
import ChatBox from "./pages/ChatBox";
import Connections from "./pages/Connections";
import Discover from "./pages/Discover";
import Profile from "./pages/Profile";
import CreatePost from "./pages/CreatePost";
import Login from "./pages/Login";
import Layout from "./pages/Layout";
import { Toaster } from "react-hot-toast";

const App = () => {
  const { user } = useUser();

  return (
    <>
    <Toaster/>
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
