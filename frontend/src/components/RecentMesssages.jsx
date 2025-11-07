import React, { useEffect, useState } from "react";
import moment from "moment";
import { dummyRecentMessagesData } from "../assets/assets";
import { Link } from "react-router-dom";

const RecentMessages = () => {
  const [messages, setMessages] = useState([]);

  const fetchMessages = async () => {
    setMessages(dummyRecentMessagesData);
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  return (
    <div className="bg-white w-[320px] mt-4 p-5 rounded-2xl shadow-md text-sm text-slate-800 sticky top-4">
      <h3 className="font-semibold text-slate-800 mb-4 text-base">
        Recent Messages
      </h3>

      <div className="flex flex-col gap-3 max-h-80 overflow-y-auto no-scrollbar">
        {messages.length > 0 ? (
          messages.map((message, index) => (
            <Link
              to={`/messages/${message.from_user_id?._id || ""}`}
              key={index}
              className="flex items-center justify-between gap-3 py-2 px-3 hover:bg-slate-100 rounded-lg transition-all"
            >
              {/* Left Side - Profile Image */}
              <div className="flex items-center gap-3">
                <img
                  src={message.from_user_id?.profile_picture}
                  alt="user"
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className="flex flex-col">
                  <p className="font-semibold text-slate-700 text-[13px]">
                    {message.from_user_id?.full_name || "Unknown User"}
                  </p>
                  <p className="text-slate-500 text-[11px] truncate max-w-[170px]">
                    {message.text ? message.text : "📷 Media message"}
                  </p>
                </div>
              </div>

              {/* Right Side - Time & Unread Badge */}
              <div className="flex flex-col items-end justify-between h-full">
                <p className="text-[10px] text-slate-400">
                  {moment(message.createdAt).fromNow()}
                </p>

                {!message.seen && (
                  <span className="bg-indigo-500 text-white w-4 h-4 flex items-center justify-center rounded-full text-[10px]">
                    1
                  </span>
                )}
              </div>
            </Link>
          ))
        ) : (
          <p className="text-center text-slate-400 text-sm">
            No recent messages
          </p>
        )}
      </div>
    </div>
  );
};

export default RecentMessages;
