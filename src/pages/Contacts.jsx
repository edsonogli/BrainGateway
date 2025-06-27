import React, { useEffect, useState } from 'react';
import { useApi } from '../contexts/ApiContext';
import { debugError } from '../config';
import './Contacts.css';

const Contacts = () => {
    const { getContacts, InativeContact, AtiveContact } = useApi();
    const [contacts, setContacts] = useState([]);
    const [filteredContacts, setFilteredContacts] = useState([]); // Para armazenar os contatos filtrados
    const [searchTerm, setSearchTerm] = useState(''); // Estado para o termo de busca
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchContacts = async () => {
            try {
                const data = await getContacts();
                setContacts(data);
                setFilteredContacts(data);
            } catch (err) {
                setError('Failed to fetch contacts');
                debugError('Erro ao carregar contatos:', err);
            }
        };
        fetchContacts();
    }, [getContacts]);

    useEffect(() => {
        // Filtro baseado no termo de busca
        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        setFilteredContacts(
            contacts.filter(
                (contact) =>
                    contact.name.toLowerCase().includes(lowerCaseSearchTerm) ||
                    contact.number.toLowerCase().includes(lowerCaseSearchTerm)
            )
        );
    }, [searchTerm, contacts]);

    const handleInactivate = async (contactId) => {
        try {
            await InativeContact(contactId);
            setContacts((prevContacts) =>
                prevContacts.map((contact) =>
                    contact.id === contactId ? { ...contact, active: false } : contact
                )
            );
        } catch (err) {
            setError('Failed to inactivate contact');
            debugError('Erro ao inativar contato:', err);
        }
    };

    const handleActivate = async (contactId) => {
        try {
            await AtiveContact(contactId);
            setContacts((prevContacts) =>
                prevContacts.map((contact) =>
                    contact.id === contactId ? { ...contact, active: true } : contact
                )
            );
        } catch (err) {
            setError('Failed to activate contact');
            debugError('Erro ao ativar contato:', err);
        }
    };

    return (
        <div className="contacts-container">
            <h2>Contatos</h2>
            {error && <p className="error-message">{error}</p>}

            {/* Campo de busca */}
            <div className="search-container">
                <input
                    type="text"
                    placeholder="Filtrar por nome ou número"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                />
            </div>

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
                    {filteredContacts.map((contact, index) => (
                        <tr key={index}>
                            <td>{contact.name}</td>
                            <td>{contact.number}</td>
                            <td>{contact.projectId}</td>
                            <td>{contact.active ? 'Sim' : 'Não'}</td>
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
