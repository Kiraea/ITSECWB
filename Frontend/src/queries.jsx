
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

export const useGetQuestions = () => {

    const {addError} = useContext(ErrorContext)

    return useQuery({
        queryKey: ['questions'], 
        queryFn: async () => {
            try {
                const result = await axiosInstance.get(`/questions`);
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


    try {
        console.log(userId, role, "queries")
        let result = await axiosInstance.patch(`/users/${userId}/modifyRole`, {role: role});
        if (result.status === 200) {
            return result.data.message
        }
    }catch(e){
        if (e instanceof AxiosError) {

            throw e
        }
    }
}

export const useModifyRoleUser= () => {
    const {addError} = useContext(ErrorContext)
    const queryClient = useQueryClient();

    const {mutateAsync : useModifyRoleUserAsync} = useMutation({
        mutationFn: modifyRoleUser,
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['users']})
            queryClient.invalidateQueries({ queryKey: ['logs'] });
        },
        onError: (e) => {

            addError(e.response.data?.message)
        }
    })
    return {useModifyRoleUserAsync};
}





export const addPost= async ({ title, description}) => {

    try {
        let result = await axiosInstance.post(`/posts`, {title: title, description: description })
        if (result.status === 200) {
            return result.data.message
        }
    } catch (e) {
        if (e instanceof AxiosError) {
            throw e
        }
    }
}


export const useAddPost= () => {
    const queryClient = useQueryClient()

    const {addError} = useContext(ErrorContext)
    const { mutateAsync: useAddPostAsync} = useMutation({
        mutationFn: addPost,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['posts'] });
            queryClient.invalidateQueries({ queryKey: ['logs'] });
        },
        onError: (e) => {
            addError(e.response.data?.message)
        }
    });
    return { useAddPostAsync }
}


export const modifyStatusPost = async ({postId, status}) => {


    try {
        let result = await axiosInstance.patch(`posts/changeStatus/${postId}`, {status: status});
        if (result.status === 200) {
            return result.data.message
        }
    }catch(e){
        if (e instanceof AxiosError) {
           throw e 
        }
    }
}

export const useModifyStatusPost = () => {
    const queryClient = useQueryClient();

    const {addError} = useContext(ErrorContext)
    const {mutateAsync : useModifyStatusPostAsync } = useMutation({
        mutationFn: modifyStatusPost,
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['posts']})
            queryClient.invalidateQueries({ queryKey: ['logs'] });
        },
        onError: (e) => {
            addError(e.response.data?.message)
        }
    })
    return {useModifyStatusPostAsync};
}


export const deletePost = async ({postId}) => {

    try{
        let result = await axiosInstance.delete(`/posts/${postId}`);    
        return result.data.message
    }catch(e){
        if (e instanceof AxiosError){
           throw(e) 
        }
    }
}
export const useDeletePost = () => {
    const queryClient = useQueryClient();

    const {addError} = useContext(ErrorContext)
    const { mutateAsync: useDeletePostAsync } = useMutation({
        mutationFn: deletePost,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['posts'] })
            queryClient.invalidateQueries({ queryKey: ['logs'] });
        },
        onError: () => {

            addError(e.response.data?.message)
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

    try {
        let result = await axiosInstance.post(`/users/createUser`, { username: username, password: password, displayName: displayName, role: role })
        if (result.status === 200) {
            return result.data.message
        }
    } catch (e) {
        if (e instanceof AxiosError) {
            throw(e) 
        }
    }
}


export const useAddUser= () => {
    const queryClient = useQueryClient()

    const {addError} = useContext(ErrorContext)
    const { mutateAsync: useAddUserAsync} = useMutation({
        mutationFn: addUser,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            queryClient.invalidateQueries({ queryKey: ['logs'] });
        },
        onError: (e) => {
            addError(e.response.data?.message)
        }
    });
    return { useAddUserAsync}
}










export const register = async ({ username, password, displayName, securityQuestionId, answer}) => {


    try {
        const result = await axiosInstance.post(`http://localhost:3000/api/users/register`, {
            username: username,
            password: password,
            displayName: displayName,
            securityQuestionId: securityQuestionId,
            answer: answer
        })
    } catch (e) {
        if (e instanceof AxiosError) {

            throw(e)
        }  
    }
}


export const useRegister = () => {
    const queryClient = useQueryClient()

    const {addError} = useContext(ErrorContext)
    const { mutateAsync: useRegisterAsync} = useMutation({
        mutationFn: register,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            queryClient.invalidateQueries({ queryKey: ['logs'] });
        },
        onError: (e) => {
            const messages = e.response.data?.messages;

            if (Array.isArray(messages)) {
                messages.forEach(msg => addError(msg)); // This will now run for all validation errors
            } else if (e.response.data?.message) {
                addError(e.response.data.message);
            }
        }
    });
    return { useRegisterAsync}
}




export const forgotPassword = async ({ username, newPassword, securityQuestionId, answer}) => {
    try {
        const result = await axiosInstance.post(`http://localhost:3000/api/users/forgotPassword`, {
            username: username,
            newPassword: newPassword,
            securityQuestionId: securityQuestionId,
            answer : answer,
        })
    } catch (e) {
        if (e instanceof AxiosError) {
            throw(e)
        }  
    }
}


export const useForgotPassword = () => {
    const queryClient = useQueryClient()

    const {addError} = useContext(ErrorContext)
    const { mutateAsync: useForgotPasswordAsync} = useMutation({
        mutationFn: forgotPassword,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            queryClient.invalidateQueries({ queryKey: ['logs'] });
        },
        onError: (e) => {
            addError(e.response.data?.message)
        }
    });
    return { useForgotPasswordAsync }
}



export const createLog = async ({ message, role, status, timestamp }) => {


    try {
        const result = await axiosInstance.post(`http://localhost:3000/api/logs/log`, {
            message,
            role,
            status,
            timestamp
        });
        return result.data;
    } catch (e) {
        if (e instanceof AxiosError) {
            throw e;
        }
    }
};

export const useCreateLog = () => {
    const queryClient = useQueryClient();
    const { addError } = useContext(ErrorContext);

    const { mutateAsync: useCreateLogAsync } = useMutation({
        mutationFn: createLog,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['logs'] });
        },
        onError: (e) => {
            addError(e.response.data?.message) //remove
        }
    });

    return { useCreateLogAsync };
};



export const changePassword = async ({ currentPassword, newPassword }) => {
    try {
        const result = await axiosInstance.post(`http://localhost:3000/api/users/changePassword`, {
            currentPassword,
            newPassword
        });
        return result.data;
    } catch (e) {
        if (e instanceof AxiosError) {
            throw e;
        }
    }
};

export const useChangePassword = () => {
    const queryClient = useQueryClient();
    const { addError } = useContext(ErrorContext);

    const { mutateAsync: changePasswordAsync } = useMutation({
        mutationFn: changePassword,
        onSuccess: () => {
            // You can invalidate any relevant query keys here if needed
            queryClient.invalidateQueries({ queryKey: ['userProfile'] });
        },
        onError: (e) => {
            const messages = e.response.data?.messages;

            if (Array.isArray(messages)) {
                messages.forEach(msg => addError(msg)); // This will now run for all validation errors
            } else if (e.response.data?.message) {
                addError(e.response.data.message);
            }
        }
    });

    return { changePasswordAsync };
};