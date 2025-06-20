import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { LogPage } from './Pages/Admin/LogPage.jsx' 
import { BrowserRouter, Routes, Route } from "react-router";
import { Navigate } from 'react-router';
import { AuthContextProvider } from './Context/AuthContext.jsx';
import { LoginPage } from './Pages/LoginPage.jsx'
import { RegisterPage } from './Pages/RegisterPage.jsx'
import { AdminDashboard} from './Pages/Admin/AdminDashboard.jsx'
import { UnauthorizedPage } from './Pages/Unauthorized.jsx'
import { ErrorContextProvider } from './Context/ErrorContext.jsx';
import { StatusPostPage } from './Pages/StatusPostPage.jsx';
import { ProtectedRoute } from './ProtectedRoute.jsx';
import { MyPosts } from './Pages/MyPosts.jsx';
import {QueryClient, useQueryClient, QueryClientProvider} from '@tanstack/react-query';
import { HomePage } from './Pages/HomePage.jsx';
import { ProtectedRouteWithOutlet } from './ProtectedRouteWithOutlet.jsx';
import { ForgotPasswordPage } from './Pages/ForgotPasswordPage.jsx';
const queryClient = new QueryClient()



createRoot(document.getElementById('root')).render(


      <BrowserRouter>
    <QueryClientProvider client={queryClient}>
    <AuthContextProvider>
    <ErrorContextProvider>
        <Routes>

          <Route path="/" element={<LoginPage/>}/>
          <Route path='/login' element={<LoginPage/>}/>
          <Route path='/register' element={<RegisterPage/>}/>
          <Route path='/resetPassword' element={<ForgotPasswordPage/>}/>
          <Route path='/unauthorized' element={<UnauthorizedPage/>}/>

          <Route path='/home' element={
            <ProtectedRoute roles={['manager', 'regular']}><HomePage/></ProtectedRoute>
          }></Route>

          <Route path='/statusPosts' element={
            <ProtectedRoute roles={['manager']}><StatusPostPage/></ProtectedRoute>
          }></Route>


            <Route path='/MyPosts' element={
              <ProtectedRoute roles={['manager', 'regular']}><MyPosts/></ProtectedRoute>
            }></Route> 


          <Route path='/admin' element={<ProtectedRouteWithOutlet roles={['admin']}/>}>
            <Route index element={<Navigate to="logs" replace />} />
            <Route path='logs' element={<LogPage/>}/>
            <Route path='dashboard' element={<AdminDashboard/>}/>
          </Route>



        </Routes>
      </ErrorContextProvider>
    </AuthContextProvider>
  </QueryClientProvider>
      </BrowserRouter>


)
