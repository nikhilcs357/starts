import React from 'react'
import { Eye, MessageSquare, UserPlus } from 'lucide-react'
import { useNavigate, Link } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { useAuth } from '@clerk/clerk-react'
import { fetchConversations } from '../features/messages/messagesSlice'


const Messages = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { getToken } = useAuth();
  const { conversations } = useSelector((state) => state.messages); // Select conversations

  React.useEffect(() => {
    getToken().then((token) => {
      if (token) {
        dispatch(fetchConversations(token))
      }
    })
  }, [])

  return (
    <div className='min-h-screen relative bg-slate-50'>
      <div className='max-w-3xl mx-auto p-4 sm:p-6'>
        {/* title */}
        <div className='mb-6 flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100'>
          <div>
            <h1 className='text-2xl font-bold text-slate-800'>Messages</h1>
            <p className='text-slate-500 text-sm'>Recent conversations</p>
          </div>
          <button
            onClick={() => navigate('/connections')}
            className='flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition shadow-md text-sm font-medium'
          >
            <UserPlus className='size-4' />
            <span>New Chat</span>
          </button>
        </div>

        {/* Conversation List */}
        <div className='bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden'>
          {conversations && conversations.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {conversations.map((conv) => {
                const lastMessageTime = new Date(conv.lastMessage?.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                return (
                  <div
                    key={conv._id}
                    className="flex items-center gap-4 p-4 hover:bg-gray-50 transition cursor-pointer group"
                    onClick={() => navigate(`/messages/${conv.userDetails?._id}`)}
                  >
                    {/* Avatar */}
                    <img
                      src={conv.userDetails?.profile_picture}
                      alt=""
                      className="size-12 rounded-full object-cover border border-gray-100 group-hover:scale-105 transition-transform"
                    />

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline mb-0.5">
                        <h3 className="font-semibold text-slate-800 truncate pr-2">
                          {conv.userDetails?.full_name}
                        </h3>
                        <span className="text-xs text-gray-400 whitespace-nowrap">
                          {lastMessageTime}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <p className="text-sm text-gray-500 truncate pr-4">
                          {conv?.lastMessage?.text || (conv?.lastMessage?.message_type === 'image' ? '📷 Image' : 'No message')}
                        </p>
                        {/* Optional Unread Badge could go here */}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-gray-500 text-center py-16 flex flex-col items-center">
              <MessageSquare className="size-12 text-gray-300 mb-3" />
              <p className="mb-4 text-lg font-medium text-gray-600">No messages yet</p>
              <Link to="/connections" className="text-indigo-600 font-medium hover:text-indigo-700 transition">
                Start a conversation
              </Link>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}

export default Messages