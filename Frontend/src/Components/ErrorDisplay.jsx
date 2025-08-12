import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';

function ErrorDisplay({errorMessages}) {
    const errorPortalRoot = document.getElementById('error-portal-root');

    if (errorMessages.length === 0 || !errorPortalRoot) {
        return null;
    }

    return ReactDOM.createPortal(
        <div className="fixed top-5 right-5 flex flex-col items-end space-y-2 z-50 pointer-events-none">
            {errorMessages.map((msg, index) => (
                <div
                    key={index}
                    className="relative bg-red-200 p-5 rounded-2xl shadow-md shadow-gray-400 pointer-events-auto"
                >
                    <div className="text-red-800 font-semibold">
                        {msg}
                    </div>
                </div>
            ))}
        </div>,
        errorPortalRoot
    );
}

export default ErrorDisplay;