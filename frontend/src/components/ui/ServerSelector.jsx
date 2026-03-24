import React from 'react';

function ServerSelector({ servers, onSelect }) {
    return (
        <select onChange={e => onSelect(e.target.value)}>
            {servers.map(server => (
                <option key={server.id} value={server.id}>{server.name}</option>
            ))}
        </select>
    );
}

export default ServerSelector; 