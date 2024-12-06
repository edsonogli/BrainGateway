import React, { useEffect, useState } from 'react';
import { useApi } from '../contexts/ApiContext';
import './Logs.css';

const Logs = () => {
    const { getLogs } = useApi();
    const [logs, setLogs] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const data = await getLogs();
                setLogs(data);
            } catch (err) {
                setError('Failed to fetch contacts');
                console.error(err);
            }
        };

        fetchLogs();
    }, [getLogs]);

    return (
        <div className="contacts-container">
            <h2>Logs</h2>
            {error && <p className="error-message">{error}</p>}
            <table className="contacts-table">
                <thead>
                    <tr>
                        <th>Data</th>
                        <th>Ativo</th>
                        <th>Message</th>
                    </tr>
                </thead>
                <tbody>
                    {logs.map((contact, index) => (
                        <tr key={index}>
                            <td>{contact.createdAt}</td>
                            <td>{contact.active ? 'Sim' : 'Não' }</td>
                            <td>{contact.message}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Logs;
