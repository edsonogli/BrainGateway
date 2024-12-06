import React, { useEffect, useState } from 'react';
import { useApi } from '../contexts/ApiContext';
import './Assistants.css';

const Contacts = () => {
    const { getAssistants } = useApi();
    const [assistants, setAssistants] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchassistants = async () => {
            try {
                const data = await getAssistants();
                setAssistants(data);
            } catch (err) {
                setError('Failed to fetch assistants');
                console.error(err);
            }
        };

        fetchassistants();
    }, [getAssistants]);

    return (
        <div className="contacts-container">
            <h2>Assistentes</h2>
            {error && <p className="error-message">{error}</p>}
            <table className="contacts-table">
                <thead>
                    <tr>
                        <th>Id</th>
                        <th>Nome</th>
                        <th>Data</th>
                    </tr>
                </thead>
                <tbody>
                    {assistants.map((contact, index) => (
                        <tr key={index}>
                            <td>{contact.id}</td>
                            <td>{contact.name}</td>
                            <td>{contact.created_at}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Contacts;
