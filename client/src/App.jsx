import { useState } from 'react'
import {Route,Routes} from "react-router-dom"
import Layout from './Layout'
import IndexPage from './pages/IndexPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import axios from 'axios';
import { UserContextProvider } from './UserContext'
import AccountPage from './pages/Account'

axios.defaults.baseURL = 'http://localhost:4000';
axios.defaults.withCredentials=true;
function App() {
  return (
    <UserContextProvider>
    <Routes>
      <Route path="/" element={<Layout/>}>
      <Route index element={<IndexPage/>}/>
      <Route path="/login" element={<LoginPage/>}/>
      <Route path="/register" element={<RegisterPage/>}/> 
      <Route path="/account" element={<AccountPage/>}/>
      <Route path="/account/:subpage" element={<AccountPage/>}/>
       </Route>
    </Routes>
    </UserContextProvider>
  )
}

export default App