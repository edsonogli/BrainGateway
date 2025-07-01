import React, { useEffect, useState, useRef } from 'react';
import { useApi } from '../contexts/ApiContext';
import { useAuth } from '../components/AuthContext';
import { debugLog, debugError, checkApiConnection } from '../config';
import './Chats.css';

const Chats = () => {
    const { getChats, getContacts, InativeContact, AtiveContact, getChatsControlLog } = useApi();
    const { isAuthenticated, isLoading: authLoading, userData } = useAuth();
    const [chats, setChats] = useState([]);
    const [groupedChats, setGroupedChats] = useState([]);
    const [filteredChats, setFilteredChats] = useState([]);
    const [selectedNumber, setSelectedNumber] = useState(null);
    const [error, setError] = useState(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [contacts, setContacts] = useState([]);
    const [showActiveOnly, setShowActiveOnly] = useState(false);
    const [controlLogs, setControlLogs] = useState([]);
    const [showLogs, setShowLogs] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (selectedNumber) {
            scrollToBottom();
        }
    }, [selectedNumber, groupedChats]);

    useEffect(() => {
        const fetchData = async () => {
            if (authLoading) return;

            if (!isAuthenticated) {
                debugError('Usuário não autenticado');
                setError('Sessão expirada. Por favor, faça login novamente.');
                setIsLoading(false);
                return;
            }

            try {
                setIsLoading(true);
                debugLog('Verificando conexão com a API...');
                const isConnected = await checkApiConnection();
                
                if (!isConnected) {
                    throw new Error('Não foi possível conectar à API');
                }

                debugLog('Iniciando busca de dados...', { userId: userData?.userId });
                const [chatsData, contactsData] = await Promise.all([
                    getChats(),
                    getContacts()
                ]);
                
                debugLog('Dados recebidos:', { 
                    chatsCount: Array.isArray(chatsData) ? chatsData.length : 'não é um array',
                    contactsCount: Array.isArray(contactsData) ? contactsData.length : 'não é um array'
                });
                
                if (Array.isArray(chatsData) && chatsData.length > 0) {
                    debugLog('Processando dados de chat...');
                    setChats(chatsData);
                    setContacts(contactsData);

                    const grouped = Object.entries(
                        chatsData.reduce((acc, chat) => {
                            if (!acc[chat.number]) {
                                acc[chat.number] = [];
                            }
                            acc[chat.number].push(chat);
                            return acc;
                        }, {})
                    ).map(([number, messages]) => {
                        const contact = contactsData.find(c => c.number === number);
                        const sortedMessages = messages.sort(
                            (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
                        );
                        
                        return {
                            number,
                            messages: sortedMessages,
                            lastMessage: sortedMessages[sortedMessages.length - 1],
                            lastMessageTime: new Date(sortedMessages[sortedMessages.length - 1].createdAt),
                            isActive: contact ? contact.active : true,
                            contactId: contact ? contact.id : null
                        };
                    });

                    grouped.sort((a, b) => b.lastMessageTime - a.lastMessageTime);
                    debugLog('Conversas agrupadas:', grouped.length);
                    setGroupedChats(grouped);
                    setFilteredChats(grouped);
                    setError(null);
                } else {
                    debugError('Nenhuma conversa encontrada ou dados inválidos:', chatsData);
                    setGroupedChats([]);
                    setFilteredChats([]);
                    setError('Nenhuma conversa encontrada');
                }
            } catch (err) {
                debugError('Erro ao buscar dados:', err);
                setError(err.message || 'Falha ao carregar as conversas');
                setGroupedChats([]);
                setFilteredChats([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [getChats, getContacts, isAuthenticated, authLoading, userData]);

    useEffect(() => {
        debugLog('Atualizando filtros:', { searchTerm, showActiveOnly, groupedChats: groupedChats.length });
        const filtered = groupedChats.filter(chat =>
            chat.number.toLowerCase().includes(searchTerm.toLowerCase()) &&
            (!showActiveOnly || chat.isActive)
        );
        debugLog('Conversas filtradas:', filtered.length);
        setFilteredChats(filtered);
    }, [searchTerm, groupedChats, showActiveOnly]);

    const handleNumberClick = (number) => {
        setSelectedNumber(number);
        setIsMobileMenuOpen(false);
        setShowLogs(false);
        setControlLogs([]);
    };

    const handleToggleActive = async (contactId, isActive) => {
        try {
            debugLog('Alterando status do contato:', { contactId, isActive });
            if (isActive) {
                await InativeContact(contactId);
            } else {
                await AtiveContact(contactId);
            }

            setGroupedChats(prevChats =>
                prevChats.map(chat =>
                    chat.contactId === contactId
                        ? { ...chat, isActive: !isActive }
                        : chat
                )
            );
            setFilteredChats(prevChats =>
                prevChats.map(chat =>
                    chat.contactId === contactId
                        ? { ...chat, isActive: !isActive }
                        : chat
                )
            );
            debugLog('Status do contato atualizado com sucesso');
        } catch (err) {
            debugError('Erro ao atualizar status do contato:', err);
            setError('Falha ao atualizar o status do contato');
        }
    };

    const handleViewLogs = async (number) => {
        try {
            debugLog('Buscando logs para o número:', number);
            const data = await getChatsControlLog(number);
            debugLog('Logs recebidos:', data);
            setControlLogs(data);
            setShowLogs(true);
        } catch (err) {
            debugError('Erro ao carregar logs:', err);
            setError('Falha ao carregar o histórico de logs');
        }
    };

    const formatMessageTime = (date) => {
        const messageDate = new Date(date);
        return messageDate.toLocaleString('pt-BR', { 
            day: '2-digit', 
            month: '2-digit', 
            year: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (authLoading) {
        return (
            <div className="chats-page">
                <div className="loading">Verificando autenticação...</div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <div className="chats-page">
                <div className="error-message">Sessão expirada. Por favor, faça login novamente.</div>
            </div>
        );
    }

    return (
        <div className="chats-page">
            <button 
                className="toggle-menu" 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Toggle contacts menu"
            >
                ☰
            </button>

            <div className={`contacts-sidebar ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
                <div className="sidebar-header">
                    <h3>Conversas</h3>
                    <div className="search-box">
                        <input
                            type="text"
                            placeholder="Buscar por número..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <label className="active-filter">
                            <input
                                type="checkbox"
                                checked={showActiveOnly}
                                onChange={(e) => setShowActiveOnly(e.target.checked)}
                            />
                            Mostrar apenas ativos
                        </label>
                    </div>
                </div>
                <ul>
                    {isLoading ? (
                        <li className="loading">Carregando conversas...</li>
                    ) : filteredChats.length > 0 ? (
                        filteredChats.map(({ number, lastMessage, isActive }) => (
                            <li
                                key={number}
                                className={`contact ${selectedNumber === number ? 'active' : ''} ${!isActive ? 'inactive' : ''}`}
                                onClick={() => handleNumberClick(number)}
                            >
                                <div className="contact-info">
                                    <div className="contact-number">{number}</div>
                                    <div className="contact-preview">
                                        {lastMessage?.message.substring(0, 40)}
                                        {lastMessage?.message.length > 40 ? '...' : ''}
                                    </div>
                                </div>
                            </li>
                        ))
                    ) : (
                        <li className="no-chats">{error || 'Nenhuma conversa encontrada'}</li>
                    )}
                </ul>
            </div>

            <div className="chat-panel">
                {selectedNumber ? (
                    <>
                        <div className="chat-panel-header">
                            <span>{selectedNumber}</span>
                            <div className="header-actions">
                                {groupedChats.find((chat) => chat.number === selectedNumber)?.contactId && (
                                    <button
                                        className={`toggle-active-button ${!groupedChats.find((chat) => chat.number === selectedNumber)?.isActive ? 'inactive' : ''}`}
                                        onClick={() => handleToggleActive(
                                            groupedChats.find((chat) => chat.number === selectedNumber)?.contactId,
                                            groupedChats.find((chat) => chat.number === selectedNumber)?.isActive
                                        )}
                                    >
                                        {groupedChats.find((chat) => chat.number === selectedNumber)?.isActive ? '🔵' : '🔴'}
                                    </button>
                                )}
                                <button
                                    className="view-logs-button"
                                    onClick={() => handleViewLogs(selectedNumber)}
                                >
                                    📋 Histórico
                                </button>
                            </div>
                        </div>
                        <div className="chat-messages-container">
                            <div className="chat-messages">
                                {groupedChats
                                    .find((chat) => chat.number === selectedNumber)
                                    ?.messages.map((msg, index) => (
                                        <div
                                            key={index}
                                            className={`message ${msg.fromMe ? 'sent' : 'received'}`}
                                        >
                                            <p>{msg.message}</p>
                                            <span className="timestamp">
                                                {formatMessageTime(msg.createdAt)}
                                            </span>
                                        </div>
                                    ))}
                                <div ref={messagesEndRef} />
                            </div>
                        </div>
                        {showLogs && (
                            <div className="modal-overlay">
                                <div className="modal-content">
                                    <div className="control-logs">
                                        <h4>Histórico de Controle</h4>
                                        <button
                                            className="close-logs-button"
                                            onClick={() => setShowLogs(false)}
                                        >
                                            ✕
                                        </button>
                                        <div className="logs-list">
                                            {controlLogs.map((log) => (
                                                <div key={log.id} className="log-entry">
                                                    <div className="log-header">
                                                        <span className={`log-status ${log.status ? 'active' : 'inactive'}`}>
                                                            {log.status ? '🔵' : '🔴'}
                                                        </span>
                                                        <span className="log-date">
                                                            {formatMessageTime(log.createdAt)}
                                                        </span>
                                                    </div>
                                                    <div className="log-reason">{log.reason}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="no-chat-selected">
                        <p>Selecione uma conversa para visualizar as mensagens</p>
                    </div>
                )}
            </div>

            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}
        </div>
    );
};

export default Chats;
