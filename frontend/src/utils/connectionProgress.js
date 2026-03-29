const STORAGE_KEY = 'vpn_connection_progress';

function getStorage() {
    if (typeof localStorage === 'undefined') {
        return null;
    }

    if (typeof localStorage.getItem !== 'function' || typeof localStorage.setItem !== 'function') {
        return null;
    }

    return localStorage;
}

function readState() {
    try {
        const storage = getStorage();
        if (!storage) {
            return {};
        }

        return JSON.parse(storage.getItem(STORAGE_KEY) || '{}');
    } catch {
        return {};
    }
}

function writeState(nextState) {
    const storage = getStorage();
    if (!storage) {
        return;
    }

    storage.setItem(STORAGE_KEY, JSON.stringify(nextState));
}

export function getConnectionProgress(subscriptionId) {
    if (!subscriptionId) {
        return { hasSeenConfig: false, hasCopiedConfig: false, connectedLocally: false };
    }

    const state = readState();
    return state[subscriptionId] || { hasSeenConfig: false, hasCopiedConfig: false, connectedLocally: false };
}

export function setConnectionProgress(subscriptionId, patch) {
    if (!subscriptionId) {
        return { hasSeenConfig: false, hasCopiedConfig: false, connectedLocally: false };
    }

    const state = readState();
    const current = state[subscriptionId] || { hasSeenConfig: false, hasCopiedConfig: false, connectedLocally: false };
    const next = { ...current, ...patch };
    state[subscriptionId] = next;
    writeState(state);
    return next;
}

export function clearConnectionProgress(subscriptionId) {
    if (!subscriptionId) {
        return;
    }

    const state = readState();
    delete state[subscriptionId];
    writeState(state);
}
