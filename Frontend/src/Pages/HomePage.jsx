import React, { useContext } from "react"

import { useState } from "react";
import { useAddPost, useDeletePost, useGetPosts } from "../queries";
import { Header } from "../Components/Header";
import { AuthContext } from "../Context/AuthContext";
import { useNavigate } from "react-router";
export const HomePage= () => {

    const navigate = useNavigate()
    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")


    const {role, userId} = useContext(AuthContext)



    let {useAddPostAsync} = useAddPost()
    let {useDeletePostAsync } = useDeletePost()
    let {data: postData, isLoading: postIsLoading, isError: postIsError, error: postError} = useGetPosts({status:"accepted"});

    console.log(postData);

    let handleCreatePost = async (e) => {
        e.preventDefault();
        useAddPostAsync({title, description})
    }

    let handleDeletePost = async (e, postId) => {
        e.preventDefault();
        useDeletePostAsync({postId})
    }


    return (
        <div className="min-h-screen flex flex-col box-border gap-5">
            <Header/>
            <div>

                {role === 'manager' &&  <button onClick={()=> navigate('/StatusPosts')}>Approve Posts</button>}
                <button onClick={()=> navigate('/MyPosts')}>My Posts</button>
            </div>
            <div>
                <label>CREATE POST</label>
                <form onSubmit={handleCreatePost}>
                    <label>Title</label>
                    <input type="text" onChange={(e)=> {setTitle(e.target.value)}}/>
                    <label>Description</label>
                    <input type="text" onChange={(e)=> {setDescription(e.target.value)}}/>
                    <button type="submit">Submit</button>
                </form>
            </div>


            <div className="p-5">
                <div className="grid grid-cols-3 gap-5">
                    {postData && postData.map((post) => {
                        return ( 
                            <div key={post.id} className="flex flex-col border-2 border-black">
                                {role === 'manager' || userId === post.userId ? <button onClick={(e) => handleDeletePost(e,post.id)}>X</button>: null}
                                <div className="bg-yellow-100">Made By: {post.display_name}</div>
                                <div className="bg-red-100">{post.title}</div>
                                <div className="bg-gray-100">{post.description}</div>
                            </div>
                        )
                    })}
                </div>
            </div>

        </div>
    )


}


