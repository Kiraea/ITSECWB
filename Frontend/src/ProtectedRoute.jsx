import React, { useContext, useEffect, useRef } from "react";
import { AuthContext } from "./Context/AuthContext";
import { useNavigate } from "react-router";
import { useCreateLog } from "./queries";

export const ProtectedRoute = ({ children, roles }) => {
    const { role, isLoading, isLoggedIn } = useContext(AuthContext);
    const navigate = useNavigate();
    const { useCreateLogAsync } = useCreateLog();
    const isMounted = useRef(true);

    useEffect(() => {
        const checkAccess = async () => {
            if (!isLoading) {
                if (!isLoggedIn || !roles.includes(role)) {
                    // Log unauthorized access
                    await useCreateLogAsync({
                        message: `Unauthorized access attempt to a protected route`,
                        role: role || "guest",
                        status: "failed",
                        timestamp: new Date()
                    });

                    navigate("/login", { replace: true });
                }
            }
        };

        checkAccess();
    }, [isLoading, isLoggedIn, role, roles, navigate, useCreateLogAsync]);

    if (isLoading) {
        return <div>Loading...</div>;
    }

    // Only render children when properly authorized
    if (isLoggedIn && roles.includes(role)) {
        return children;
    }

    // Show nothing during redirect process
    return null;
};