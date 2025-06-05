
import { QueryCache, QueryClient, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import axios, { AxiosError } from "axios"
import { axiosInstance } from "./axiosInstance"
import { ErrorContext} from "./Context/ErrorContext";
import { useContext } from "react";




export const useGetPosts = (filter = {}) => {

    const {addError} = useContext(ErrorContext)

    return useQuery({
        queryKey: ['posts', filter], 
        queryFn: async () => {
            try {
                const result = await axiosInstance.get(`/posts`, {
                    params: filter, 
                });
                if (result.status === 200) {
                    return result.data.data;
                }
            } catch (e) {
                if (e instanceof AxiosError) {
                     addError(e.response.data?.message)
                    console.log(e);
                }
            }
        },
    });
};




export const useGetLogs = ()=> {


    const {addError} = useContext(ErrorContext)
    return useQuery({
        queryKey: ['logs'], 
        queryFn: async () => {
            try {
                const result = await axiosInstance.get(`/logs`);
                if (result.status === 200) {
                    return result.data.data;
                }
            } catch (e) {
                if (e instanceof AxiosError) {

                     addError(e.response.data?.message)
                    console.log(e);
                }
            }
        },
    });
};



export const useGetUsers = ()=> {



    const {addError} = useContext(ErrorContext)
    return useQuery({
        queryKey: ['users'],
        queryFn: async () => {
            try {
                const result = await axiosInstance.get(`/users`);
                if (result.status === 200) {
                    console.log(result.data.data);
                    return result.data.data;
                }
            } catch (e) {
                if (e instanceof AxiosError) {

                     addError(e.response.data?.message)
                    console.log(e);
                }
            }
        },
    });
};







export const modifyRoleUser= async ({userId, role}) => {


    const {addError} = useContext(ErrorContext)
    try {
        console.log(userId, role, "queries")
        let result = await axiosInstance.patch(`/users/${userId}/modifyRole`, {role: role});
        if (result.status === 200) {
            return result.data.message
        }
    }catch(e){
        if (e instanceof AxiosError) {

            addError(e.response.data?.message)
            throw e
        }
    }
}

export const useModifyRoleUser= () => {
    const queryClient = useQueryClient();

    const {mutateAsync : useModifyRoleUserAsync} = useMutation({
        mutationFn: modifyRoleUser,
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['users']})
            queryClient.invalidateQueries({ queryKey: ['logs'] });
        }
    })
    return {useModifyRoleUserAsync};
}





export const addPost= async ({ title, description}) => {

    const {addError} = useContext(ErrorContext)
    try {
        let result = await axiosInstance.post(`/posts`, {title: title, description: description })
        if (result.status === 200) {
            return result.data.message
        }
    } catch (e) {
        if (e instanceof AxiosError) {

            addError(e.response.data?.message)
            console.log(e)
        }
    }
}


export const useAddPost= () => {
    const queryClient = useQueryClient()

    const { mutateAsync: useAddPostAsync} = useMutation({
        mutationFn: addPost,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['posts'] });
            queryClient.invalidateQueries({ queryKey: ['logs'] });
        },
    });
    return { useAddPostAsync }
}


export const modifyStatusPost = async ({postId, status}) => {


    const {addError} = useContext(ErrorContext)
    try {
        let result = await axiosInstance.patch(`posts/changeStatus/${postId}`, {status: status});
        if (result.status === 200) {
            return result.data.message
        }
    }catch(e){
        if (e instanceof AxiosError) {
            addError(e.response.data?.message)
            console.log(e)
        }
    }
}

export const useModifyStatusPost = () => {
    const queryClient = useQueryClient();

    const {mutateAsync : useModifyStatusPostAsync } = useMutation({
        mutationFn: modifyStatusPost,
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['posts']})
            queryClient.invalidateQueries({ queryKey: ['logs'] });
        }
    })
    return {useModifyStatusPostAsync};
}


export const deletePost = async ({postId}) => {

    const {addError} = useContext(ErrorContext)
    try{
        let result = await axiosInstance.delete(`/posts/${postId}`);    
        return result.data.message
    }catch(e){
        if (e instanceof AxiosError){
            addError(e.response.data?.message)
            console.log(e)
        }
    }
}
export const useDeletePost = () => {
    const queryClient = useQueryClient();

    const { mutateAsync: useDeletePostAsync } = useMutation({
        mutationFn: deletePost,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['posts'] })
            queryClient.invalidateQueries({ queryKey: ['logs'] });
        }
    })
    return { useDeletePostAsync};
}


export const useGetPublicDetails = () => { 


    const {addError} = useContext(ErrorContext)
    return useQuery({
        queryKey: ['userPublicInfo'],
        queryFn: async () => {
            try {
                const result = await axiosInstance.get(`/users/publicInfo`, {
                });
                if (result.status === 200) {
                    return result.data.data;
                }
            } catch (e) {
                if (e instanceof AxiosError) {
                    addError(e.response.data?.message)
                    console.log(e);
                }
            }
        },
    });
}






export const addUser = async ({ username, password, displayName, role }) => {

    const {addError} = useContext(ErrorContext)
    try {
        let result = await axiosInstance.post(`/users/createUser`, { username: username, password: password, displayName: displayName, role: role })
        if (result.status === 200) {
            return result.data.message
        }
    } catch (e) {
        if (e instanceof AxiosError) {
            addError(e.response.data?.message)
            console.log(e)
        }
    }
}


export const useAddUser= () => {
    const queryClient = useQueryClient()

    const { mutateAsync: useAddUserAsync} = useMutation({
        mutationFn: addUser,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            queryClient.invalidateQueries({ queryKey: ['logs'] });
        },
    });
    return { useAddUserAsync}
}










export const register = async ({ username, password, displayName}) => {

    const {addError} = useContext(ErrorContext)

    try {
        const result = await axiosInstance.post(`http://localhost:3000/api/users/register`, {
            username: username,
            password: password,
            displayName: displayName,
        })
    } catch (e) {
        if (e instanceof AxiosError) {

            addError(e.response.data?.message)
            throw(e.response?.data?.message)
        }  
    }
}


export const useRegister = () => {
    const queryClient = useQueryClient()

    const { mutateAsync: useRegisterAsync} = useMutation({
        mutationFn: register,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            queryClient.invalidateQueries({ queryKey: ['logs'] });
        },
    });
    return { useRegisterAsync}
}


