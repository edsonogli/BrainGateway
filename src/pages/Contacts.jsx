import React, { useState, useEffect, useMemo } from 'react';
import { useApi } from '../contexts/ApiContext';
import { useAuth } from '../components/AuthContext';
import { debugLog, debugError } from '../config';
import { processImageUrl } from '../utils/imageUtils';
import './Contacts.css';

const Contacts = () => {
    const { getContacts, InativeContact, AtiveContact, InativeContactsBatch, AtiveContactsBatch, resetThread } = useApi();
    const { userData } = useAuth();
    const [contacts, setContacts] = useState([]);
    const [filteredContacts, setFilteredContacts] = useState([]); // Para armazenar os contatos filtrados
    const [searchTerm, setSearchTerm] = useState(''); // Estado para o termo de busca
    const [statusFilter, setStatusFilter] = useState('all'); // Estado para filtro de status (all, active, inactive)
    const [selectedContacts, setSelectedContacts] = useState([]); // Para armazenar os contatos selecionados
    const [selectAll, setSelectAll] = useState(false); // Para controlar o "selecionar todos"
    const [error, setError] = useState(null);
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

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
        // Filtro baseado no termo de busca e status
        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        const filtered = contacts.filter((contact) => {
            // Filtro por texto (nome ou número)
            const matchesSearch = contact.name.toLowerCase().includes(lowerCaseSearchTerm) ||
                                contact.number.toLowerCase().includes(lowerCaseSearchTerm);
            
            // Filtro por status
            let matchesStatus = true;
            if (statusFilter === 'active') {
                matchesStatus = contact.active === true;
            } else if (statusFilter === 'inactive') {
                matchesStatus = contact.active === false;
            }
            
            return matchesSearch && matchesStatus;
        });
        
        setFilteredContacts(filtered);
        
        // Limpa seleções quando o filtro muda
        setSelectedContacts([]);
        setSelectAll(false);
    }, [searchTerm, statusFilter, contacts]);

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

    // Função para lidar com ordenação
    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    // Função para ordenar os contatos
    const sortedContacts = React.useMemo(() => {
        let sortableContacts = [...contacts];
        if (sortConfig.key) {
            sortableContacts.sort((a, b) => {
                let aValue = a[sortConfig.key];
                let bValue = b[sortConfig.key];

                // Tratamento especial para diferentes tipos de dados
                if (sortConfig.key === 'updatedAt') {
                    aValue = new Date(aValue);
                    bValue = new Date(bValue);
                } else if (sortConfig.key === 'isActive') {
                    aValue = aValue ? 1 : 0;
                    bValue = bValue ? 1 : 0;
                } else if (typeof aValue === 'string') {
                    aValue = aValue.toLowerCase();
                    bValue = bValue.toLowerCase();
                }

                if (aValue < bValue) {
                    return sortConfig.direction === 'asc' ? -1 : 1;
                }
                if (aValue > bValue) {
                    return sortConfig.direction === 'asc' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableContacts;
    }, [contacts, sortConfig]);

    // Função para obter o ícone de ordenação
    const getSortIcon = (columnKey) => {
        if (sortConfig.key !== columnKey) {
            return '↕️'; // Ícone neutro
        }
        return sortConfig.direction === 'asc' ? '↑' : '↓';
    };

    const handleSelectContact = (contactId) => {
        setSelectedContacts(prev => {
            if (prev.includes(contactId)) {
                const newSelection = prev.filter(id => id !== contactId);
                setSelectAll(newSelection.length === filteredContacts.length && filteredContacts.length > 0);
                return newSelection;
            } else {
                const newSelection = [...prev, contactId];
                setSelectAll(newSelection.length === filteredContacts.length);
                return newSelection;
            }
        });
    };

    const handleSelectAll = () => {
        if (selectAll) {
            setSelectedContacts([]);
            setSelectAll(false);
        } else {
            const allContactIds = filteredContacts.map(contact => contact.id);
            setSelectedContacts(allContactIds);
            setSelectAll(true);
        }
    };

    const handleBatchActivate = async () => {
        if (selectedContacts.length === 0) return;
        
        try {
            await AtiveContactsBatch(selectedContacts);
            setContacts((prevContacts) =>
                prevContacts.map((contact) =>
                    selectedContacts.includes(contact.id) ? { ...contact, active: true } : contact
                )
            );
            setSelectedContacts([]);
            setSelectAll(false);
        } catch (err) {
            setError('Failed to activate contacts');
            debugError('Erro ao ativar contatos em lote:', err);
        }
    };

    const handleBatchInactivate = async () => {
        if (selectedContacts.length === 0) return;
        
        try {
            await InativeContactsBatch(selectedContacts);
            setContacts((prevContacts) =>
                prevContacts.map((contact) =>
                    selectedContacts.includes(contact.id) ? { ...contact, active: false } : contact
                )
            );
            setSelectedContacts([]);
            setSelectAll(false);
        } catch (err) {
            setError('Failed to inactivate contacts');
            debugError('Erro ao inativar contatos em lote:', err);
        }
    };

    const handleResetThread = async (contact) => {
        if (!userData?.isAdmin) {
            setError('Apenas administradores podem resetar threads');
            return;
        }

        if (!window.confirm(`Tem certeza que deseja resetar a thread do contato ${contact.name || contact.number}?`)) {
            return;
        }

        try {
            await resetThread(contact.number, contact.projectId);
            setError(null);
            // Você pode adicionar uma mensagem de sucesso aqui se desejar
            alert('Thread resetada com sucesso!');
        } catch (err) {
            setError('Erro ao resetar thread');
            debugError('Erro ao resetar thread:', err);
        }
    };

    return (
        <div className="contacts-container">
            <h2>Contatos</h2>
            {error && <p className="error-message">{error}</p>}

            {/* Campo de busca e filtros */}
            <div className="filters-container">
                <div className="search-container">
                    <input
                        type="text"
                        placeholder="Filtrar por nome ou número"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                </div>
                <div className="status-filter-container">
                    <label htmlFor="statusFilter">Status:</label>
                    <select
                        id="statusFilter"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="status-filter-select"
                    >
                        <option value="all">Todos</option>
                        <option value="active">Apenas Ativos</option>
                        <option value="inactive">Apenas Inativos</option>
                    </select>
                </div>
            </div>

            {/* Botões de ação em lote - sempre visíveis */}
            <div className="batch-actions">
                <span className="selected-count">
                    {selectedContacts.length > 0 
                        ? `${selectedContacts.length} contato(s) selecionado(s)` 
                        : 'Nenhum contato selecionado'
                    }
                </span>
                <button
                    onClick={handleBatchActivate}
                    className="batch-activate-button"
                    disabled={selectedContacts.length === 0}
                >
                    Ativar Selecionados
                </button>
                <button
                    onClick={handleBatchInactivate}
                    className="batch-inactivate-button"
                    disabled={selectedContacts.length === 0}
                >
                    Inativar Selecionados
                </button>
            </div>

            {/* Container com overflow para a tabela */}
            <div className="table-container">
                <table className="contacts-table">
                    <thead>
                        <tr>
                            <th>
                                <input
                                    type="checkbox"
                                    checked={selectAll}
                                    onChange={handleSelectAll}
                                    className="select-all-checkbox"
                                />
                            </th>
                            <th>Foto</th>
                            <th 
                                className="sortable-header" 
                                onClick={() => handleSort('name')}
                            >
                                Nome {getSortIcon('name')}
                            </th>
                            <th 
                                className="sortable-header" 
                                onClick={() => handleSort('number')}
                            >
                                Número {getSortIcon('number')}
                            </th>
                            <th>Projeto</th>
                            <th 
                                className="sortable-header" 
                                onClick={() => handleSort('isActive')}
                            >
                                Ativo {getSortIcon('isActive')}
                            </th>
                            <th 
                                className="sortable-header" 
                                onClick={() => handleSort('updatedAt')}
                            >
                                Atualizado em {getSortIcon('updatedAt')}
                            </th>
                            {userData?.isAdmin && <th>Ações</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {filteredContacts.map((contact, index) => (
                            <tr key={index} className={selectedContacts.includes(contact.id) ? 'selected-row' : ''}>
                                <td>
                                    <input
                                        type="checkbox"
                                        checked={selectedContacts.includes(contact.id)}
                                        onChange={() => handleSelectContact(contact.id)}
                                        className="contact-checkbox"
                                    />
                                </td>
                                <td>
                                    <div className="contact-photo">
                                        {contact.urlImage ? (
                                            <img 
                                                src={processImageUrl(contact.urlImage)} 
                                                alt={contact.name || contact.number}
                                                className="contact-image"
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                    const fallback = e.target.nextSibling;
                                                    if (fallback) fallback.style.display = 'flex';
                                                }}
                                            />
                                        ) : null}
                                        <div className={`contact-avatar ${contact.urlImage ? 'hidden' : ''}`}>
                                            {contact.number.slice(-2)}
                                        </div>
                                    </div>
                                </td>
                                <td>{contact.name}</td>
                                <td>{contact.number}</td>
                                <td>{contact.projectId}</td>
                                <td>
                                    <span className={`status-badge ${contact.active ? 'active' : 'inactive'}`}>
                                        {contact.active ? 'Ativo' : 'Inativo'}
                                    </span>
                                </td>
                                <td>
                                    {contact.updatedAt ? new Date(contact.updatedAt).toLocaleString('pt-BR') : 'N/A'}
                                </td>
                                {userData?.isAdmin && (
                                    <td>
                                        <button
                                            onClick={() => handleResetThread(contact)}
                                            className="reset-thread-button"
                                            title="Resetar Thread"
                                        >
                                            🔄
                                        </button>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Contacts;
