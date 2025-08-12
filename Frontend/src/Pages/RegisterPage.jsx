import React from "react"
import { useState, useContext } from "react";
import { useNavigate } from "react-router";
import { AxiosError } from "axios";
import { ErrorContext } from "../Context/ErrorContext";
import { axiosInstance } from "../axiosInstance";
import { useRegister } from "../queries";
import {useGetQuestions } from "../queries";
import { useCreateLog } from "../queries";
import { z } from "zod/v4";
const UserRegisterSchema = z.object({
    username: z.string()
        .min(5, "Username must be at least 5 characters")
        .max(20, "Username must be at most 20 characters")
        .regex(/[a-z]/, "Password must contain at least one lowercase letter") //should have lowercase
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter"), //should have uppercase

    password: z.string()
        .min(8, "Password must be at least 8 characters") //min 8 length
        .max(64, "Password must be at most 64 characters") //max 20 length
        .regex(/[a-z]/, "Password must contain at least one lowercase letter") //should have lowercase
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter") //should have uppercase 
        .regex(/\d/, "Password must contain at least one number") // EDIT: number check
        .regex(/[^a-zA-Z0-9]/, "Password must contain at least one special character"), //should have special char 

    displayName: z.string()
        .min(3, "Display name must be at least 3 characters")
        .max(20, "Display name must be at most 20 characters")

});
export const RegisterPage = () => {


    let { data: questionsData, isLoading: questionsIsLoading, isError: questionsIsError, error: questionsError} = useGetQuestions();

    const {useRegisterAsync} = useRegister()
    const {useCreateLogAsync} = useCreateLog()
    const {addError} = useContext(ErrorContext);

    const [usernameInput, setUsernameInput] = useState("");
    const [passwordInput, setPasswordInput] = useState("");
    const [displayNameInput, setDisplayNameInput] = useState("");
    const [securityQuestionIdInput, setSecurityQuestionIdInput] = useState(-1);
    const [answerInput, setAnswerInput] = useState("");
    const navigate = useNavigate()
    

    const handleRegisterSubmit = async (e) => {

    
        e.preventDefault()
        try{
            const input = {username: usernameInput, password: passwordInput, displayName: displayNameInput};
            const data = UserRegisterSchema.parse(input)
        } catch (e) {
            if (e instanceof z.ZodError) {
                const flattenedErrors = e.flatten().fieldErrors;

                const errorMessages = Object.values(flattenedErrors).flat();
                const joinedMessages = errorMessages.join("_");

                errorMessages.forEach(msg => addError(msg));
                
                await useCreateLogAsync({ message: "Invalid input provided during registration.", role: "", status: "fail", timestamp: new Date()})


            }
            return; // Stop the submission
        }
        if (securityQuestionIdInput === -1){
            addError("choose a security question");
            return;
        }
        
        try{
            await useRegisterAsync ({username: usernameInput, password: passwordInput, displayName: displayNameInput, securityQuestionId: securityQuestionIdInput, answer: answerInput})


            navigate('/login');
        }catch(e){
            console.log(e);
        }
       
    }
    if (questionsIsLoading) return <p>Loading...</p>;
    if (questionsIsError) return <p>Error: {questionsError.message}</p>;

    return (
        <div>
             <form onSubmit={handleRegisterSubmit} className="flex flex-col">
                <label>Username</label>
                <input type="text" onChange={(e)=> {setUsernameInput(e.target.value)}}/>

                <label>Password</label>
                <input type="password" onChange={(e)=> {setPasswordInput(e.target.value)}}/>
                 
                <label>Display Name</label>
                <input type="text" onChange={(e)=> {setDisplayNameInput(e.target.value)}} />


                <label>Select a security question</label>
                <select value={securityQuestionIdInput} onChange={(e) => setSecurityQuestionIdInput(e.target.value)}>
                    {questionsData.map((q) => (
                        <option key={q.id} value={q.id}>
                            {q.question}
                        </option>
                    ))}
                </select>


                <label>Answer </label>
                <input type="text" onChange={(e) => { setAnswerInput(e.target.value) }} />


                <button type="submit">Submit</button>
             </form>
        </div>
    )
}


