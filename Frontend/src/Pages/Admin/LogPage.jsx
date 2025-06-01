import React from "react";
import { Link } from "react-router";
import { Header } from "../../Components/Header";
import { useGetLogs } from "../../queries";

export const LogPage = () => {
    let {
        data: logData,
        isLoading: logIsLoading,
        isError: logIsError,
        error: logError,
    } = useGetLogs();

    console.log(logData);
    const convertIsoDateToReadable = (isoDate) => {
        const date = new Date(isoDate)
        const readable = date.toLocaleString()
        return readable; 
    }

    if (logIsLoading) {
        return <div>Loading...</div>;
    }

    if (logIsError) {
        return <div>{logError.message}</div>;
    }

    return (
        <div className="min-h-screen flex flex-col gap-5 p-4">
            <Header />
            <Link to="/admin/dashboard">
                <button className="border px-4 py-2 rounded">Go To Dashboard</button>
            </Link>

            <div className="overflow-x-auto">
                <table className="table-auto border-collapse border w-full text-left">
                    <thead>
                        <tr className="bg-gray-200">
                            <th className="border px-4 py-2">User ID</th>
                            <th className="border px-4 py-2">Role</th>
                            <th className="border px-4 py-2">Timestamp</th>
                            <th className="border px-4 py-2">Message</th>
                            <th className="border px-4 py-2">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {logData.map((log, index) => (
                            <tr key={index}>
                                <td className="border px-4 py-2">{log.user_id}</td>
                                <td className="border px-4 py-2">{log.user_role}</td>
                                <td className="border px-4 py-2">{convertIsoDateToReadable(log.timestamp)}</td>
                                <td className="border px-4 py-2">{log.message}</td>
                                <td className="border px-4 py-2">{log.status}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}