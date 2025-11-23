import React, { useState } from "react";
import { BadgeCheck, MessageCircle, Share2, Heart } from "lucide-react";
import moment from "moment";
import { dummyUserData } from "../assets/assets";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useAuth } from "@clerk/clerk-react";
import api from "../api/axios";
import toast from "react-hot-toast";

const PostCard = ({ post }) => {

    const postWithHashtags = post.content?.replace(/(#\w+)/g,
    '<span class="text-indigo-600 font-medium cursor-pointer hover:underline">$1</span>');
  const [likes, setLikes] = useState(post.likes || []);
  const currentUser = useSelector((state) => state.user.value)


  const { getToken } = useAuth()


  const handleLike = async () => {
     try {
       const { data } = await api.post(`/api/post/like`, {postId: post._id},
        {headers: {Authorization: `Bearer ${await getToken()}`}})

      if (data.success){
        toast.success(data.message)
        setLikes(prev =>{
          if(prev.includes(currentUser._id)){
            return prev.filter(id=> id !== currentUser._id)
          }else{
            return [...prev, currentUser._id]
          }
        })
      }else{
        toast(data.message)
      }
     } catch (error) {
       toast.error(error.message)
     }
  }

  const navigate = useNavigate()

  return (
    <div className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 w-full max-w-2xl mx-auto p-5 space-y-5 border border-gray-100">
      {/* User Info */}
      <div onClick={()=> navigate(`/profile` + post.user._id)} className="flex items-center gap-3 cursor-pointer">
        <img
          src={post.user?.profile_picture}
          alt={post.user?.full_name || "User"}
          className="w-11 h-11 rounded-full object-cover shadow-sm"
        />
        <div className="flex flex-col">
          <div className="flex items-center gap-1">
            <span className="font-semibold text-gray-900 text-sm">
              {post.user?.full_name}
            </span>
            <BadgeCheck className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-xs text-gray-500">
            @{post.user?.username} • {moment(post.createdAt).fromNow()}
          </div>
        </div>
      </div>

      {/* Post Text */}
      {post.content && (
        <div
          className="text-gray-800 text-[14px] leading-relaxed whitespace-pre-line"
          dangerouslySetInnerHTML={{ __html: postWithHashtags }}
        />
      )}

      {/* Post Images */}
      {post.image_urls?.length > 0 && (
        <div
          className={`grid gap-3 ${
            post.image_urls.length === 1
              ? "grid-cols-1"
              : post.image_urls.length === 2
              ? "grid-cols-2"
              : "grid-cols-3"
          }`}
        >
          {post.image_urls.map((img, i) => (
            <div
              key={i}
              className="relative overflow-hidden rounded-xl group"
            >
              <img
                src={img}
                alt={`Post ${i + 1}`}
                className="w-full h-60 object-cover rounded-xl group-hover:scale-105 transition-transform duration-500"
              />
            </div>
          ))}
        </div>
      )}

      {/* Post Actions */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-200 text-sm text-gray-600">
        {/* Likes */}
        <div
          className="flex items-center gap-2 cursor-pointer select-none"
          onClick={handleLike}
        >
          <Heart
            className={`w-5 h-5 transition-transform duration-200 ${
              likes.includes(currentUser._id)
                ? "text-red-500 fill-red-500 scale-110"
                : "hover:text-red-500"
            }`}
          />
          <span className="font-medium">{likes.length}</span>
        </div>

        {/* Comments */}
        <div className="flex items-center gap-2 cursor-pointer hover:text-indigo-600 transition">
          <MessageCircle className="w-5 h-5" />
          <span className="font-medium">12</span>
        </div>

        {/* Share */}
        <div className="flex items-center gap-2 cursor-pointer hover:text-indigo-600 transition">
          <Share2 className="w-5 h-5" />
          <span className="font-medium">7</span>
        </div>
      </div>
    </div>
  );
};

export default PostCard;
