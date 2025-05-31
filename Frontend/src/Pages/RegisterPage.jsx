import React from "react"
import { useState, useContext } from "react";
import { useNavigate } from "react-router";
import { AxiosError } from "axios";
import { ErrorContext } from "../Context/ErrorContext";
import { axiosInstance } from "../axiosInstance";
import { useRegister } from "../queries";


export const RegisterPage = () => {


    const {useRegisterAsync} = useRegister()
    const {addError} = useContext(ErrorContext);

    const [usernameInput, setUsernameInput] = useState("");
    const [passwordInput, setPasswordInput] = useState("");
    const [displayNameInput, setDisplayNameInput] = useState("");
    const navigate = useNavigate()

    

    const handleRegisterSubmit = async (e) => {
        e.preventDefault()
        try{
            await useRegisterAsync({username: usernameInput, password: passwordInput, displayName: displayNameInput})
            navigate('/login');
        }catch(e){
            console.log(e);
        }
    }


    return (
        <div>
             <form onSubmit={handleRegisterSubmit}>
                <label>Username</label>
                <input type="text" onChange={(e)=> {setUsernameInput(e.target.value)}}/>

                <label>Password</label>
                <input type="password" onChange={(e)=> {setPasswordInput(e.target.value)}}/>
                 
                <label>Display Name</label>
                <input type="text" onChange={(e)=> {setDisplayNameInput(e.target.value)}} />
                <button type="submit">Submit</button>
             </form>
        </div>
    )
}


