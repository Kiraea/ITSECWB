import React from "react"
import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router";
import { axiosInstance } from "../axiosInstance";
import { AxiosError } from "axios";
import { ErrorContext } from "../Context/ErrorContext";
import { AuthContext } from "../Context/AuthContext";
import { QueryClient } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router";

 

export const LoginPage = () => {

    const {setIsLoggedIn, setIsLoading, setRole, setUserId} = useContext(AuthContext)
    const {addError} = useContext(ErrorContext);
    const queryClient = useQueryClient()
    const [usernameInput, setUsernameInput] = useState("");
    const [passwordInput, setPasswordInput] = useState("");
    const navigate = useNavigate()


    useEffect(()=> {
        setIsLoggedIn(false);
        setIsLoading(false); 
        setRole(null);
        setUserId(-1);
       queryClient.clear()
    }, [])
    

    const handleLoginSubmit= async (e) => {
        e.preventDefault()





        try {
            const result = await axiosInstance.post(`http://localhost:3000/api/users/login`, {
                username: usernameInput,
                password: passwordInput,
            })
            setIsLoading(false)
            setIsLoggedIn(true)
            setRole(result.data.data.role)
            setUserId(result.data.data.userId)
            if(result.data.data.role === "admin"){
                console.log("admin here");
                navigate('/admin/logs')
            }else{
                navigate('/home');
            }
        }catch(e){
            if (e instanceof AxiosError){
                addError(e.response?.data?.message);
                console.log(e.response.data.message);
                setIsLoading(false)
                setIsLoggedIn(false)
                setRole(null);
                setUserId(-1);
            }
        }

    }


    return (
        <div>
             <form onSubmit={handleLoginSubmit} className="flex flex-col">
                <label>Username</label>
                <input type="text" onChange={(e)=> {setUsernameInput(e.target.value)}}/>

                <label>Password</label>
                <input type="password" onChange={(e)=> {setPasswordInput(e.target.value)}}/>
                <button type="submit">Submit</button>

             </form>
             <div className="flex-col">
                <Link to='/resetPassword'>Forgot Your Password?</Link>
                <Link to='/register'>Haven't login? Click here</Link>
             </div>
        </div>
    )
}



