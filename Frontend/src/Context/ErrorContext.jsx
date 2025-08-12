import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import ErrorDisplay from '../Components/ErrorDisplay'; 

export const ErrorContext = createContext(null);

export const ErrorContextProvider = ({ children }) => {
    const [errorMessages, setErrorMessages] = useState([]);

    const addError = (message) => {
        setErrorMessages(prevMessages => [...prevMessages, message]);
    };

    const clearAllErrors = () => {
        setErrorMessages([]);
    }

    useEffect(() => {
        if (errorMessages.length > 0) {
            const timer = setTimeout(() => {
                clearAllErrors();
            }, 10000);
            return () => clearTimeout(timer); 
        }
    }, [errorMessages]); 

    return (
        <ErrorContext.Provider value={{addError}}>
            {children} 
            <ErrorDisplay
                errorMessages={errorMessages} 
            />
        </ErrorContext.Provider>
    );
};