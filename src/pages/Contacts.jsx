// src/pages/Contacts.jsx
import React, { useEffect, useState } from 'react';
import { useApi } from '../contexts/ApiContext';
import './Contacts.css';

const Contacts = () => {
    const { getContacts, InativeContact, AtiveContact } = useApi(); // Obtém a função getContacts do ApiContext
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

    // Função para inativar o contato
    const handleInactivate = async (contactId) => {
        try {
            await InativeContact(contactId);
            // Atualiza a lista de contatos localmente após a inativação
            setContacts((prevContacts) =>
                prevContacts.map((contact) =>
                    contact.id === contactId ? { ...contact, active: false } : contact
                )
            );
        } catch (err) {
            setError('Failed to inactivate contact');
            console.error(err);
        }
    };
    const handleActivate = async (contactId) => {
        try {
            await AtiveContact(contactId);
            // Atualiza a lista de contatos localmente após a inativação
            setContacts((prevContacts) =>
                prevContacts.map((contact) =>
                    contact.id === contactId ? { ...contact, active: true } : contact
                )
            );
        } catch (err) {
            setError('Failed to activate contact');
            console.error(err);
        }
    };

    return (
        <div className="contacts-container">
            <h2>Contatos</h2>
            {error && <p className="error-message">{error}</p>}
            <table className="contacts-table">
                <thead>
                    <tr>
                        <th>Nome</th>
                        <th>Número</th>
                        <th>Projeto</th>
                        <th>Ativo</th>
                        <th>Ação</th>
                    </tr>
                </thead>
                <tbody>
                    {contacts.map((contact, index) => (
                        <tr key={index}>
                            <td>{contact.name}</td>
                            <td>{contact.number}</td>
                            <td>{contact.projectId}</td>
                            <td>{contact.active ? 'Sim' : 'Não' }</td>
                            <td>
                                {contact.active ? (
                                    <button
                                        onClick={() => handleInactivate(contact.id)}
                                        className="inactivate-button"
                                    >
                                        Inativar
                                    </button>
                                ) : (
                                    <button
                                    onClick={() => handleActivate(contact.id)}
                                    className="activate-button"
                                >
                                    Ativar
                                </button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Contacts;
