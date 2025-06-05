import React from "react"
import { useState, useContext } from "react";
import { useNavigate } from "react-router";
import { AxiosError } from "axios";
import { ErrorContext } from "../Context/ErrorContext";
import { axiosInstance } from "../axiosInstance";
import { useRegister } from "../queries";

import { z } from "zod/v4";
const UserRegisterSchema = z.object({
  username: z.string().min(5).max(20),


  password: z.string().min(8).max(20)
  .regex(/[a-z]/, { message: "Password must contain a lowercase letter" })
  .regex(/[A-Z]/, { message: "Password must contain an uppercase letter" })
  .regex(/[0-9]/, { message: "Password must contain a number" })
  .regex(/[^A-Za-z0-9]/, { message: "Password must contain a symbol" }),


  displayName: z.string().min(3).max(20),

});
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
            const input = {username: usernameInput, password: passwordInput, displayName: displayNameInput}
            const data = UserRegisterSchema.parse(input)
        }catch(e){
            const errors = z.prettifyError(e);
            addError(errors);

            return;
        }

        
        try{
            await useRegisterAsync ({username: usernameInput, password: passwordInput, displayName: displayNameInput})
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


