import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import GuideDetail from './pages/GuideDetail'
import CreateGuide from './pages/CreateGuide'
import Profile from './pages/Profile'
import Login from './pages/Login'
import Register from './pages/Register'
import UserProfile from './pages/UserProfile'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="guide/:id" element={<GuideDetail />} />
        <Route path="create" element={<CreateGuide />} />
        <Route path="edit/:id" element={<CreateGuide />} />
        <Route path="profile" element={<Profile />} />
        <Route path="user/:id" element={<UserProfile />} />
      </Route>
    </Routes>
  )
}

export default App
