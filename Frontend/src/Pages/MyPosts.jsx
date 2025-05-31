import React, { useContext } from "react"

import { useDeletePost, useGetPosts } from "../queries";
import { Header } from "../Components/Header";
import { AuthContext } from "../Context/AuthContext";
import { useNavigate } from "react-router";
import { Link } from "react-router";
export const MyPosts = () => {

    const navigate = useNavigate()
    const { role, userId } = useContext(AuthContext)
    console.log(role,userId, "AUTHCONTEXTMYPOSTS")
    let { useDeletePostAsync } = useDeletePost()
    let { data: postData, isLoading: postIsLoading, isError: postIsError, error: postError } = useGetPosts({ userId: userId });

    let handleDeletePost = async (e, postId) => {
        e.preventDefault();
        useDeletePostAsync({ postId })
    }
    if (postIsLoading){
        return <div>Is Loading ....</div>
    }

    return (
        <div className="min-h-screen flex flex-col box-border gap-5">
            <Header />

            <Link to='/home'><button>Go back to home</button></Link>
            <div className="p-5">
                <div className="grid grid-cols-3 gap-5">
                    {postData && postData.map((post) => {
                        return (
                            <div key={post.id} className="flex flex-col border-2 border-black">
                                {role === 'admin' || userId === post.userId ? <button onClick={(e) => handleDeletePost(e, post.id)}>X</button> : null}
                                <div className="bg-yellow-100">Made by: {post.display_name}</div>
                                <div className="bg-red-100">{post.title}</div>
                                <div className="bg-gray-100">{post.description}</div>
                                <div className="bg-gray-100">{post.status}</div>
                            </div>
                        )
                    })}
                </div>
            </div>

        </div>
    )


}


