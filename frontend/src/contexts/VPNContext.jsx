import { createContext, useContext, useState } from 'react';

const VPNContext = createContext();
export function useVPN() { return useContext(VPNContext); }
export function VPNProvider({ children }) {
    const [status, setStatus] = useState('disconnected');
    return <VPNContext.Provider value={{ status, setStatus }}>{children}</VPNContext.Provider>;
} 