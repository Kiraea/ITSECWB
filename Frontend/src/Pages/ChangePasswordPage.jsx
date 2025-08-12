import React, { useContext } from "react"

import { useState } from "react";
import { Header } from "../Components/Header";
import { AuthContext } from "../Context/AuthContext";
import { useNavigate } from "react-router";
import { useChangePassword } from "../queries";
import { axiosInstance } from "../axiosInstance";
import { useQueryClient } from "@tanstack/react-query";
export const ChangePasswordPage = () => {

    const queryClient = useQueryClient()
    const navigate = useNavigate()
    const {role, userId} = useContext(AuthContext)

    const { changePasswordAsync } = useChangePassword();
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await changePasswordAsync({
                currentPassword,
                newPassword
            });

            const handleLogout = async () => {
                try {
                    let result = await axiosInstance.post('/users/logout')
                    queryClient.clear();
                    navigate('/login');
                } catch (e) {
                    console.log(e)
                }
            }
            await handleLogout();
        } catch (error) {
        } 
    };


    return (
        <div className="min-h-screen flex flex-col box-border gap-5">
            <Header/>
            <form
                onSubmit={handleSubmit}
                className="p-5 bg-white shadow rounded max-w-sm mx-auto flex flex-col gap-4"
            >
                <h2 className="text-xl font-semibold">Change Password</h2>

                <input
                    type="password"
                    placeholder="Current Password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="border p-2 rounded"
                    required
                />

                <input
                    type="password"
                    placeholder="New Password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="border p-2 rounded"
                    required
                />

                <button type="submit" className="">Change Password</button>



            </form>

        </div>
    )


}



