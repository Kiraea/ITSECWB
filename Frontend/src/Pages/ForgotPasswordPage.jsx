import React from "react"
import { useState, useContext } from "react";
import { useNavigate } from "react-router";
import { AxiosError } from "axios";
import { ErrorContext } from "../Context/ErrorContext";
import { axiosInstance } from "../axiosInstance";
import { useForgotPassword, useGetQuestions } from "../queries";
import { Link } from "react-router";
export const ForgotPasswordPage = () => {

    let { data: questionsData, isLoading: questionsIsLoading, isError: questionsIsError, error: questionsError} = useGetQuestions();
    const {useForgotPasswordAsync} = useForgotPassword();

    const { addError } = useContext(ErrorContext);

    const [usernameInput, setUsernameInput] = useState("");
    const [newPasswordInput, setNewPasswordInput] = useState("");
    const [securityQuestionIdInput, setSecurityQuestionIdInput] = useState("");
    const [answerInput, setAnswerInput] = useState("");



    const navigate = useNavigate()

    const handleForgotPasswordSubmit = async (e) => {

        console.log(usernameInput, newPasswordInput, securityQuestionIdInput, answerInput)
        e.preventDefault()
        try {
            await useForgotPasswordAsync({ username: usernameInput, newPassword: newPasswordInput, securityQuestionId: securityQuestionIdInput, answer: answerInput})
            navigate('/login');
        } catch (e) {
            console.log(e);
        }

    }
    if (questionsIsLoading) return <p>Loading...</p>;
    if (questionsIsError) return <p>Error: {questionsError.message}</p>;

    return (
        <div>
            <form onSubmit={handleForgotPasswordSubmit} className="flex flex-col">
                <label>Username</label>
                <input type="text" onChange={(e) => { setUsernameInput(e.target.value) }} />

                <label>New Password</label>
                <input type="password" onChange={(e) => { setNewPasswordInput(e.target.value) }} />

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
            <Link to='/login'>Go back to Login Page</Link>
        </div>
    )
}



