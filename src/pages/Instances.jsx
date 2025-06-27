// src/pages/Contacts.jsx
import React, { useEffect, useState } from 'react';
import { useApi } from '../contexts/ApiContext';
import { useNavigate } from 'react-router-dom';
import './Instances.css';

const Instances = () => {
    const { getInstances } = useApi();
    const navigate = useNavigate();
    const [instances, setInstances] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchInstances = async () => {
            try {
                const data = await getInstances();
                setInstances(data);
            } catch (err) {
                setError('Failed to fetch instances');
                console.error(err);
            }
        };

        fetchInstances();
    }, [getInstances]);

    return (
        <div className="contacts-container">
            <h2>Instâncias</h2>
            {error && <p className="error-message">{error}</p>}
            <table className="contacts-table">
                <thead>
                    <tr>
                        <th>Nome</th>
                        <th>Número</th>
                        <th>Nome Perfil</th>
                    </tr>
                </thead>
                <tbody>
                    {instances.map((contact, index) => (
                        <tr key={index}>
                            <td>{contact.instanceName}</td>
                            <td>{contact.owner}</td>
                            <td>{contact.profileName}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Instances;
