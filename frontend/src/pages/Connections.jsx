import React, { useEffect, useState } from "react";
import {
  Users,
  UserPlus,
  UserCheck,
  UserRoundPen,
  MessageSquare,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useAuth } from "@clerk/clerk-react";
import { fetchConnections } from "../features/connection/connectionsSlice";
import { fetchConversations } from "../features/messages/messagesSlice";
import api from "../api/axios";
import toast from "react-hot-toast";

const Connections = () => {
  const [currentTab, setCurrentTab] = useState("Followers");
  const navigate = useNavigate();
  const { getToken } = useAuth()
  const dispatch = useDispatch()

  const { connections, pendingConnections, followers, following } = useSelector((state) => state.connections)
  const { conversations } = useSelector((state) => state.messages);

  const dataArray = [
    { label: "Followers", value: followers, Icon: Users },
    { label: "Following", value: following, Icon: UserCheck },
    { label: "Pending", value: pendingConnections, Icon: UserRoundPen },
    { label: "Connections", value: connections, Icon: UserPlus },
  ];

  const handleUnfollow = async (userId) => {
    try {
      const { data } = await api.post('/api/user/unfollow', { id: userId }, {
        headers: { Authorization: `Bearer ${await getToken()}` }
      })
      if (data.success) {
        toast.success(data.message)
        dispatch(fetchConnections(await getToken()))
      } else {
        toast(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  const accceptConnection = async (userId) => {
    try {
      const { data } = await api.post('/api/user/accept', { id: userId }, {
        headers: { Authorization: `Bearer ${await getToken()}` }
      })
      if (data.success) {
        toast.success(data.message)
        dispatch(fetchConnections(await getToken()))
      } else {
        toast(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  useEffect(() => {
    getToken().then((token) => {
      dispatch(fetchConnections(token))
      dispatch(fetchConversations(token))
    })
  }, [])

  const currentData = dataArray.find(item => item.label === currentTab)?.value || []


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
      <div className="max-w-6xl mx-auto p-6">
        {/* Title */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-slate-900 mb-1">Connections</h1>
          <p className="text-slate-600">
            Manage your network and discover new people
          </p>
        </div>

        {/* Stats */}
        <div className="mb-8 flex flex-wrap justify-center gap-6">
          {dataArray.map((item, index) => (
            <div
              key={index}
              className="flex flex-col items-center justify-center gap-1 h-24 w-44 bg-white rounded-xl shadow-md hover:shadow-lg transition-transform hover:-translate-y-1"
            >
              <b className="text-xl text-indigo-600">{item.value.length}</b>
              <p className="text-slate-700 font-medium">{item.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap justify-center gap-3 border border-gray-200 rounded-xl bg-white shadow-sm p-2 mb-8">
          {dataArray.map((tab) => (
            <button
              key={tab.label}
              onClick={() => setCurrentTab(tab.label)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${currentTab === tab.label
                ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md"
                : "text-gray-600 hover:bg-gray-100"
                }`}
            >
              <tab.Icon className="w-4 h-4" />
              {tab.label}
              <span className="ml-2 text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">
                {tab.value.length}
              </span>
            </button>
          ))}
        </div>

        {/* Connection Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentData.map((user) => (
            <div
              key={user._id}
              className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all p-5 flex flex-col items-center text-center"
            >
              <img
                src={user.profile_picture}
                alt=""
                className="w-20 h-20 rounded-full shadow-md object-cover mb-3"
              />
              <h3 className="text-lg font-semibold text-slate-800">
                {user.full_name}
              </h3>
              <p className="text-slate-500 text-sm">@{user.username}</p>
              <p className="text-gray-500 text-sm mt-1">
                {user.bio?.slice(0, 40) || "No bio available"}
              </p>

              {currentTab === "Connections" && (
                <div className="mt-2 w-full">
                  {(() => {
                    const conversation = conversations?.find(c => c.userDetails._id === user._id);
                    if (conversation?.lastMessage) {
                      return (
                        <p className="text-xs text-gray-500 truncate w-full px-2">
                          <span className="font-semibold">Last: </span>
                          {conversation.lastMessage.text || (conversation.lastMessage.message_type === 'image' ? 'Image' : '')}
                        </p>
                      );
                    }
                    return null;
                  })()}
                </div>
              )}

              <div className="flex gap-2 mt-4 w-full">
                <button
                  onClick={() => navigate(`/profile/${user._id}`)}
                  className="flex-1 py-2 text-sm rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:opacity-90 active:scale-95 transition-all"
                >
                  View Profile
                </button>

                {currentTab === "Following" && (
                  <button onClick={() => handleUnfollow(user._id)} className="flex-1 py-2 text-sm rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 active:scale-95 transition">
                    Unfollow
                  </button>
                )}

                {currentTab === "Pending" && (
                  <button onClick={() => accceptConnection(user._id)} className="flex-1 py-2 text-sm rounded-lg bg-green-500 text-white hover:bg-green-600 active:scale-95 transition">
                    Accept
                  </button>
                )}

                {currentTab === "Connections" && (
                  <button
                    onClick={() => navigate(`/messages/${user._id}`)}
                    className="flex-1 py-2 text-sm rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 active:scale-95 flex items-center justify-center gap-1 transition"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Message
                  </button>
                )}
              </div>
            </div>
          ))}

          {currentData.length === 0 && (
            <p className="col-span-full text-center text-gray-500 italic">
              No {currentTab.toLowerCase()} yet 😅
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Connections;
