import React, { useContext, useEffect } from "react";
import { AuthContext } from "./Context/AuthContext";
import { useNavigate } from "react-router";
import { useCreateLog} from "./queries"; // <-- import our log mutation

export const ProtectedRoute = ({ children, roles }) => {
    const { role, isLoading, isLoggedIn } = useContext(AuthContext);
    const navigate = useNavigate();
    const { useCreateLogAsync } = useCreateLog(); // mutation hook

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

    return children;
};