import React, { createContext, useContext, useState } from 'react';

const SubscriptionContext = createContext();

export function useSubscription() {
    return useContext(SubscriptionContext);
}

export function SubscriptionProvider({ children }) {
    const [plan, setPlan] = useState(null);
    return (
        <SubscriptionContext.Provider value={{ plan, setPlan }}>
            {children}
        </SubscriptionContext.Provider>
    );
}

export default SubscriptionContext; 