import React from "react";
import { useGetPosts } from "../queries";
import { useModifyStatusPost } from "../queries";
import { Link } from "react-router";
export const StatusPostPage = () => {
    const { data: postData, isLoading, isError, error } = useGetPosts({ status: "pending" });



    const {useModifyStatusPostAsync}= useModifyStatusPost()

    // Boilerplate functions for approve/reject actions (no real logic yet)
    const handleStatusPost= (postId, status) => {
        useModifyStatusPostAsync({postId, status})
    };



    if (isLoading) return <div>Loading posts...</div>;
    if (isError) return <div>Error loading posts: {error?.message}</div>;

    return (
        <div className="p-5 space-y-4">
            <Link to='/home'><button>Go back to home</button></Link>
            {postData?.map((post) => (
                <div key={post.id} className="border p-4 rounded shadow flex justify-between items-center">
                    <div>
                        <div className="font-bold">{post.title}</div>
                        <div className="text-sm text-gray-600">{post.description}</div>
                        <div className="text-xs text-gray-400 italic">by {post.display_name}</div>
                    </div>

                    <div className="space-x-2">
                        <button className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600" onClick={() => handleStatusPost(post.id, "accepted")}>
                            ✓
                        </button>

                        <button className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600" onClick={() => handleStatusPost(post.id, "rejected")}>
                            X
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};