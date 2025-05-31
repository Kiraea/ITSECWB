import React, { createContext } from "react";
import { axiosInstance } from "../axiosInstance";
import { AxiosError } from "axios";
import { useLocation } from "react-router";
import { useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthContextProvider = ({children}) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [userId, setUserId] = useState(-1);
    const [role, setRole] = useState(null);
    const location = useLocation()
    console.log(location.pathname);
    useEffect(()=> {

        if (location.pathname === '/login' || location.pathname === '/register') {
            setIsLoading(false);
            return;
          }
        const checkSessionToken = async () => {
            try{
                let result = await axiosInstance.post(`/users/checkSession`)
                setIsLoggedIn(result.data.data.isLoggedIn);
                setRole(result.data.data.role);
                setUserId(result.data.data.userId);
                setIsLoading(false);
            }catch(e){
                if (e instanceof AxiosError){
                    console.log(e) 
                    setIsLoading(false)
                }
            }
        }
        checkSessionToken();

    }, [location.pathname])

    return (
       <AuthContext.Provider value={{isLoggedIn, isLoading, role, setIsLoading, setIsLoggedIn, setRole, setUserId, userId}}>
        {children}
       </AuthContext.Provider>
    )
}
