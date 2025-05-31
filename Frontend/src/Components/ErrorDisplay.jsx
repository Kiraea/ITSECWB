import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';

function ErrorDisplay({errorMessages}) {
    const errorPortalRoot = document.getElementById('error-portal-root');

    if (errorMessages.length === 0 || !errorPortalRoot) {
        return null;
    }

    return ReactDOM.createPortal(
        <div className="fixed top-0 left-0 w-screen h-screen flex justify-end items-start p-5 pointer-events-none z-50">
            <div className="flex flex-col space-y-2"> 
                {errorMessages.map((msg, index) => (
                    <div key={index} className="relative bg-red-200 p-5 rounded-2xl shadow-md shadow-gray-400 pointer-events-auto">
                        <div className="text-red-800 font-semibold">
                            {msg}
                        </div>
                    </div>
                ))}
            </div>
        </div>,
        errorPortalRoot
    );
}

export default ErrorDisplay;