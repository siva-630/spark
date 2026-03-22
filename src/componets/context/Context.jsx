
import { createContext } from 'react';

export const context = createContext({});

const ContextProvider = ({ children }) => {
    const contextValue = {};

    return (
        <context.Provider value={contextValue}>
            {children}
        </context.Provider>
    );
};

export default ContextProvider;