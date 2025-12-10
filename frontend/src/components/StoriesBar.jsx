import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { dummyStoriesData } from '../assets/assets';
import { Plus } from 'lucide-react';
import moment from 'moment';
import StoryModal from './StoryModal';
import StoryViewer from './StoryViewer';
import { useAuth } from '@clerk/clerk-react';
import api from '../api/axios';

const StoriesBar = () => {

 const {getToken} = useAuth() 

  const [stories, setStories] = useState([]);
   const [showModal, setShowModal] = useState(false);
     const [viewStory, setViewStory] = useState(null);


  const fetchStories = async () => {
   try {
     const token = await getToken()
     const { data } = await api.get('/api/story/get', {
      headers: {Authorization: `Bearer ${token}`}
     })
     if (data.success){
      setStories(data.stories)
     }else{
      toast(data.message)
     }
   } catch (error) {
          toast(error.message)
   }
  };

  useEffect(() => {
    fetchStories();
  }, []);

  return (
    <div className='w-screen sm:w-[calc(100vw-240px)] lg:max-w-2xl no-scrollbar overflow-x-auto 
    px-4'>
      
      <div className='flex gap-4 pb-5'>
        
        {/* Add Story Card */}
        <div onClick={()=>setShowModal(true)} className="rounded-lg shadow-sm min-w-[120px] max-w-[120px] h-40 cursor-pointer hover:shadow-lg transition-all duration-200 bg-gradient-to-b from-indigo-50 to-white flex flex-col items-center justify-center border border-dashed border-gray-300">
          <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center mb-2">
            <Plus className="w-5 h-5 text-white" />
          </div>
          <p className="text-sm font-medium text-slate-700 text-center">
            Create Story
          </p>
        </div>

        {/* Story Cards */}
        {stories.map((story, index) => (
          <div onClick={()=> setViewStory(story)}
            key={index}
            className="relative rounded-lg overflow-hidden min-w-[120px] max-w-[120px] h-40 cursor-pointer shadow-md hover:shadow-lg transition-all duration-200 active:scale-95 bg-gradient-to-b from-indigo-500 via-purple-500 to-pink-500"
          >
            {/* Overlay for dim effect */}
            <div className="absolute inset-0 bg-black/25 rounded-lg" />

            {/* Profile picture */}
            <img
              src={story.user.profile_picture}
              alt={story.user.name}
              className="absolute top-3 left-3 w-9 h-9 rounded-full ring-2 ring-white shadow-md z-10 object-cover"
            />

            {/* Story text */}

            <p className="absolute bottom-6 left-3 text-white text-sm truncate max-w-[90%] z-10 font-medium">
              {story.content}
            </p>

            {/* Timestamp */}

            <p className="text-white absolute bottom-2 right-3 z-10 text-[11px] opacity-80">
              {moment(story.createdAt).fromNow()}
            </p>
            {
              story.media_type !== 'text' && (
                <div className='absoluteinset-0 z-1 rounded-lg bg-back overflow-hidden'>
                  {
                    story.media_type === "image" ?
              <img src={story.media_url} alt="" className='h-full w-full object-cover hover:scale-110 
              transition duration-500 opacity-70 hover:opacity-80' />
              : 
              <video src={story.media_url} className='h-full w-full object-cover hover:scale-110 
              transition duration-500 opacity-70 hover:opacity-80'></video>
                  }
                </div>
              )
            }
            {
              story.media_type === "image" ?
              <img src={story.media_url} alt="" className='h-full w-full object-cover hover:scale-110 transition duration-500 opacity-70 hover:opacity-80' />
              : 
              <video src={"story.media_url"} className='h-full w-full object-cover hover:scale-110 transition duration-500 opacity-70 hover:opacity-80'></video>
            }
          </div>
        ))}
      </div>

           {/* add story modal */}
           {showModal && <StoryModal setShowModal={setShowModal} fetchStories=
           {fetchStories}/>}
           {/* view story modal */}
           {viewStory &&<StoryViewer viewStory={viewStory} setViewStory=
           {setViewStory}/>}


    </div>
  );
};

export default StoriesBar;
