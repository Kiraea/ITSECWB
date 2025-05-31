import React, { useContext, useEffect } from "react";
import { AuthContext } from "./Context/AuthContext";
import { useNavigate } from "react-router";

export const ProtectedRoute = ({ children, roles }) => {
    const { role, isLoading, isLoggedIn } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        if (!isLoading) {
            if (!isLoggedIn || !roles.includes(role)) {
                navigate('/login', { replace: true });
            }
        }
    }, [isLoading, isLoggedIn, role, roles, navigate]);

    if (isLoading) {
        return <div>Loading...</div>;
    }

    return children;
};