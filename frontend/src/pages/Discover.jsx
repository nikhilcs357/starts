import React, { useState } from 'react'
import { Search } from 'lucide-react'
import { dummyConnectionsData } from '../assets/assets'
import UserCard from '../components/UserCard' 
import Loading from '../components/Loading'    

const Discover = () => {
  const [input, setInput] = useState('')
  const [users, setUsers] = useState(dummyConnectionsData)
  const [loading, setLoading] = useState(false)

  const handleSearch = async (e) => {
    if (e.key === 'Enter') {
      setLoading(true)
      setUsers([])

      setTimeout(() => {
        const filtered = dummyConnectionsData.filter((user) =>
          user.name.toLowerCase().includes(input.toLowerCase())
        )
        setUsers(filtered)
        setLoading(false)
      }, 1000)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-6xl mx-auto p-6">
        {/* Title */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-slate-900 mb-1">Discover People</h1>
          <p className="text-slate-600">Connect With New People And Expand Your Network</p>
        </div>

        {/* Search */}
        <div className="mb-8 shadow-md rounded-md border border-slate-200 bg-white/80">
          <div className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search people by name, username, bio, or location..."
                className="pl-10 sm:pl-12 py-2 w-full border border-gray-300 rounded-md max-sm:text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                onChange={(e) => setInput(e.target.value)}
                value={input}
                onKeyUp={handleSearch}
              />
            </div>
          </div>
        </div>

        {/* User Cards */}
        {loading ? (
          <Loading height="60vh" />
        ) : (
          <div className="flex flex-wrap justify-center gap-6">
            {users.length > 0 ? (
              users.map((user) => <UserCard user={user} key={user._id} />)
            ) : (
              <div className="text-gray-500 mt-20">No users found</div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default Discover
