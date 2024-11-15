// src/pages/Contacts.jsx
import React, { useEffect, useState } from 'react';
import { useApi } from '../contexts/ApiContext';
import './Contacts.css';

const Contacts = () => {
    const { getContacts } = useApi(); // Obtém a função getContacts do ApiContext
    const [contacts, setContacts] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchContacts = async () => {
            try {
                const data = await getContacts();
                setContacts(data);
            } catch (err) {
                setError('Failed to fetch contacts');
                console.error(err);
            }
        };

        fetchContacts();
    }, [getContacts]);

    return (
        <div className="contacts-container">
            <h2>Contacts</h2>
            {error && <p className="error-message">{error}</p>}
            <table className="contacts-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Phone Number</th>
                    </tr>
                </thead>
                <tbody>
                    {contacts.map((contact, index) => (
                        <tr key={index}>
                            <td>{contact.name}</td>
                            <td>{contact.number}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Contacts;
