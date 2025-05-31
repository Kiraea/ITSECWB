import React, { useState, useContext } from "react";
import { useNavigate } from "react-router";
import { Header } from "../../Components/Header";
import { useAddUser, useGetUsers, useModifyRoleUser } from "../../queries";
import { Link } from "react-router";
import { useGetPosts } from "../../queries"; // Assuming this gets users
import { modifyRoleUser } from "../../queries";
export const AdminDashboard = () => {
    const { useAddUserAsync } = useAddUser();
    const { useModifyRoleUserAsync} = useModifyRoleUser();
    const [usernameInput, setUsernameInput] = useState("");
    const [passwordInput, setPasswordInput] = useState("");
    const [displayNameInput, setDisplayNameInput] = useState("");
    const [roleInput, setRoleInput] = useState("admin");

    const { data: userData = [], isLoading: userIsLoading, isError: userIsError, error: userError } = useGetUsers();
    const navigate = useNavigate();

    const handleCreateUser = async (e) => {
        e.preventDefault();
        try {
            await useAddUserAsync({
                username: usernameInput,
                password: passwordInput,
                displayName: displayNameInput,
                role: roleInput,
            });
        } catch (e) {
            console.log(e);
        }
    };

    const handleRoleChange = async (userId, newRole) => {
        console.log(userId, newRole, "handleROleChange");
        try{
            await useModifyRoleUserAsync({userId: userId, role: newRole})
        }catch(e){
            console.log(e);
        }
    };
    if (userIsLoading) {
        return <div>Loading users...</div>;
    }
    if (userIsError) {
        return <div>Error users...</div>;
    }

    return (
        <div className="min-h-screen flex flex-col box-border gap-5 p-4">
            <Header />
            <Link to='/admin/logs'>
                <button>Go To Logs</button>
            </Link>

            <form onSubmit={handleCreateUser} className="flex flex-col gap-2">
                <label>Username</label>
                <input type="text" onChange={(e) => setUsernameInput(e.target.value)} />

                <label>Password</label>
                <input type="password" onChange={(e) => setPasswordInput(e.target.value)} />

                <label>Display Name</label>
                <input type="text" onChange={(e) => setDisplayNameInput(e.target.value)} />

                <label>Role</label>
                <select value={roleInput} onChange={(e) => setRoleInput(e.target.value)}>
                    <option value="admin">admin</option>
                    <option value="manager">manager</option>
                </select>

                <button type="submit">Create User</button>
            </form>

            <h2 className="text-xl mt-6">All Users</h2>
            <div className="flex flex-col gap-3">
                {userData && userData.map((user) => (
                    <div key={user.id} className="border p-3 rounded shadow flex justify-between items-center">
                        <div>
                            <p><strong>Username:</strong> {user.username}</p>
                            <p><strong>Display Name:</strong> {user.display_name}</p>
                            <p><strong>DAJKJDAI:</strong> {user.id}</p>
                        </div>
                        { user.role !== 'regular' ?
                            <select value={user.role} onChange={(e) => handleRoleChange(user.id, e.target.value)} className="border rounded px-2 py-1">
                            <option value="admin">admin</option>
                            <option value="manager">manager</option>
                        </select>
                        : null}
                    </div>
                ))}
            </div>
        </div>
    );
};