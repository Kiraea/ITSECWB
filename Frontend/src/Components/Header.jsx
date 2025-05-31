import React, {useState, useEffect, useContext} from "react";

import { useGetPublicDetails } from "../queries";
import { useNavigate } from "react-router";
import { useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../axiosInstance";

export const Header = () => {
    let queryClient = useQueryClient()
    let {data : userData , isLoading: userIsLoading, error:userError, isError:userIsError} = useGetPublicDetails();
    let navigate = useNavigate();
    console.log(userData);
    if (userIsLoading){
        return <div>Is Loading...</div>
    }

    const handleLogout = async () => {
        try{
            let result = await axiosInstance.post('/users/logout')
            queryClient.clear();
            navigate('/login');
        }catch(e){
            console.log(e)
        }
    }


    return (
        <div className="flex flex-row justify-between">
             <div>Welcome, {userData.display_name} - {userData.role} </div>
             <button onClick={handleLogout}>Logout</button>
        </div>
    )
}