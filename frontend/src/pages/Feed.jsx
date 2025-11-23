import React, { useEffect, useState } from 'react'
import { dummyPostsData } from '../assets/assets'
import Loading from '../components/Loading'
import StoriesBar from '../components/StoriesBar'
import PostCard from '../components/PostCard'
import RecentMesssages from '../components/RecentMesssages'
import { useAuth } from '@clerk/clerk-react'
import api from '../api/axios'
import toast from 'react-hot-toast'

const Feed = () => {

  const [feeds, setFeeds] = useState([])
  const [loading, setLoading] = useState(true)
  const { getToken } = useAuth()

  const fetchFeeds = async () => {
   try {
    setLoading(true)
    const {data} = await api.get('/api/post/feed', {headers: {Authorization:
      `Bearer ${await getToken()}`}})

      if (data.success){
        setFeeds(data.posts)
      }else{
        toast.error(data.message)
      }
   } catch (error) {
            toast.error(error.message)
   }
   setLoading(false)
  }

  useEffect(() => {
    fetchFeeds()
  }, [])

  return (
    loading ? (
      <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-white z-50">
        <div className="flex items-center justify-center w-full h-full">
          <Loading />
        </div>
      </div>
    ) : (
      <div className="h-full overflow-y-scroll no-scrollbar py-10 xl:pr-5 flex items-start justify-center xl:gap-8">
        {/* stories and post list */}
        <div>
          <StoriesBar/>
          <div className="p-4 space-y-6">
            {feeds.map((post, index)=>(
              <PostCard key={post.id || index} post={post}/>
            ))}
          </div>
        </div>

        {/* right sidebar */}
        <div className=''>
          <div>
            <RecentMesssages/>
          </div>
        </div>
      </div>
    )
  )
}

export default Feed
