import React, { useEffect, useState, useRef } from 'react';
import { useApi } from '../contexts/ApiContext';
import { useAuth } from '../components/AuthContext';
import { debugLog, debugError, checkApiConnection } from '../config';
import './Chats.css';

const Chats = () => {
    const { getChats, getContacts, InativeContact, AtiveContact, getChatsControlLog, getProjects, getChatsNumbers } = useApi();
    const { isAuthenticated, isLoading: authLoading, userData } = useAuth();
    const [chats, setChats] = useState([]);
    const [groupedChats, setGroupedChats] = useState([]);
    const [filteredChats, setFilteredChats] = useState([]);
    const [selectedNumber, setSelectedNumber] = useState(null);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [contacts, setContacts] = useState([]);
    const [showActiveOnly, setShowActiveOnly] = useState(false);
    const [controlLogs, setControlLogs] = useState([]);
    const [showLogs, setShowLogs] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [projects, setProjects] = useState([]);
    const [selectedProject, setSelectedProject] = useState(null);
    const [chatNumbers, setChatNumbers] = useState([]);
    const messagesEndRef = useRef(null);

    const formatPhoneNumber = (number) => {
        // Remove todos os caracteres não numéricos
        const cleanNumber = number.replace(/\D/g, '');
        
        // Verifica se é um número brasileiro com 8 ou 9 dígitos no número de telefone
        if (cleanNumber.length >= 10 && cleanNumber.length <= 11) {
            const ddd = cleanNumber.slice(0, 2);
            const phoneNumber = cleanNumber.slice(2);
            
            // Formata o número de telefone com 8 ou 9 dígitos
            const formattedPhone = phoneNumber.length === 8
                ? `${phoneNumber.slice(0, 4)}-${phoneNumber.slice(4)}`
                : `${phoneNumber.slice(0, 5)}-${phoneNumber.slice(5)}`;
            
            return `+55 ${ddd} ${formattedPhone}`;
        }
        
        return number; // Retorna o número original se não corresponder ao formato esperado
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (selectedNumber) {
            scrollToBottom();
        }
    }, [selectedNumber, groupedChats]);

    useEffect(() => {
        const fetchProjects = async () => {
            if (userData?.isAdmin) {
                try {
                    const projectsData = await getProjects();
                    setProjects(projectsData);
                } catch (err) {
                    debugError('Erro ao buscar projetos:', err);
                    setError('Falha ao carregar os projetos');
                }
            }
        };
        fetchProjects();
    }, [userData, getProjects]);

    useEffect(() => {
        const fetchChatNumbers = async () => {
            if (selectedProject) {
                try {
                    const numbers = await getChatsNumbers(selectedProject);
                    setChatNumbers(numbers);
                } catch (err) {
                    debugError('Erro ao buscar números:', err);
                    setError('Falha ao carregar os números de chat');
                }
            }
        };
        fetchChatNumbers();
    }, [selectedProject, getChatsNumbers]);

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

                debugLog('Iniciando busca de dados...');
                const [contactsData, numbers] = await Promise.all([
                    getContacts(),
                    !userData?.isAdmin ? getChatsNumbers() : Promise.resolve([])
                ]);
                
                debugLog('Dados recebidos:', { 
                    contactsCount: Array.isArray(contactsData) ? contactsData.length : 'não é um array'
                });
                
                setContacts(contactsData);
                if (!userData?.isAdmin && numbers.length > 0) {
                    setChatNumbers(numbers);
                }
                setError(null);
            } catch (err) {
                debugError('Erro ao buscar dados:', err);
                setError(err.message || 'Falha ao carregar os dados');
                setGroupedChats([]);
                setFilteredChats([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [getContacts, getChatsNumbers, isAuthenticated, authLoading, userData]);

    const handleNumberClick = async (number) => {
        setSelectedNumber(number);
        setShowLogs(false);
        setControlLogs([]);

        try {
            setIsLoading(true);
            const chatsData = await getChats(number, userData?.isAdmin ? selectedProject : undefined);
            
            if (Array.isArray(chatsData) && chatsData.length > 0) {
                const contact = contacts.find(c => c.number === number);
                const sortedMessages = chatsData.sort(
                    (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
                );


                const chatGroup = {
                    number,
                    messages: sortedMessages,
                    lastMessage: sortedMessages[sortedMessages.length - 1],
                    lastMessageTime: new Date(sortedMessages[sortedMessages.length - 1].timestamp),
                    isActive: contact ? contact.active : true,
                    contactId: contact ? contact.id : null
                };

                setGroupedChats([chatGroup]);
                setFilteredChats([chatGroup]);
                setError(null);
            } else {
                setGroupedChats([]);
                setFilteredChats([]);
                setError('Nenhuma mensagem encontrada');
            }
        } catch (err) {
            debugError('Erro ao buscar mensagens:', err);
            setError(err.message || 'Falha ao carregar as mensagens');
            setGroupedChats([]);
            setFilteredChats([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleProjectChange = (projectId) => {
        setSelectedProject(projectId);
        setSelectedNumber(null);
        setGroupedChats([]);
        setFilteredChats([]);
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
    const normalizeTimestamp = (raw) => {
        if (!raw) return null;

        if (typeof raw === 'string') {
            return raw; // já é ISO
        }

        if (typeof raw === 'object' && raw.$date) {
            return raw.$date; // vem do Mongo
        }

        return null;
    };

    const formatMessageTime = (raw) => {
        if (!raw) return '-';

        const dt = new Date(raw);
        if (isNaN(dt.getTime())) {
            console.error('Data inválida:', raw);
            return '-';
        }

        return dt.toLocaleString('pt-BR', {
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
            <div className="contacts-sidebar">
                <div className="sidebar-header">
                    <h3>Conversas</h3>
                    {userData?.isAdmin && (
                        <div className="project-selector">
                            <select
                                value={selectedProject || ''}
                                onChange={(e) => handleProjectChange(e.target.value)}
                            >
                                <option value="">Selecione um projeto</option>
                                {projects.map(project => (
                                    <option key={project.id} value={project.projectId}>
                                        {project.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
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
                    ) : userData?.isAdmin && selectedProject ? (
                        chatNumbers.length > 0 ? (
                            chatNumbers.map(number => (
                                <li
                                    key={number}
                                    className={`contact ${selectedNumber === number ? 'active' : ''}`}
                                    onClick={() => handleNumberClick(number)}
                                >
                                    <div className="contact-avatar">
                                        {number.slice(-2)}
                                    </div>
                                    <div className="contact-info">
                                        <div className="contact-number">{formatPhoneNumber(number)}</div>
                                    </div>
                                </li>
                            ))
                        ) : (
                            <li className="no-chats">Nenhum número encontrado para este projeto</li>
                        )
                    ) : chatNumbers.length > 0 ? (
                        chatNumbers.map(number => (
                            <li
                                key={number}
                                className={`contact ${selectedNumber === number ? 'active' : ''}`}
                                onClick={() => handleNumberClick(number)}
                            >
                                <div className="contact-avatar">
                                    {number.slice(-2)}
                                </div>
                                <div className="contact-info">
                                    <div className="contact-number">{formatPhoneNumber(number)}</div>
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
                            <span>{formatPhoneNumber(selectedNumber)}</span>
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
                                            className={`message ${msg.fromMe ? 'sent' : 'received'} ${msg.ia ? 'ia-message' : ''}`}
                                        >
                                            {msg.imagemUrl && (
                                                <div className="message-image">
                                                    <img
                                                    src={msg.imagemUrl}
                                                    alt="Imagem da mensagem"
                                                    onError={(e) => {
                                                        e.target.style.display = 'none';
                                                        const fallback = e.target.nextSibling;
                                                        if (fallback) fallback.style.display = 'block';
                                                    }}
                                                    style={{ maxWidth: '100%', borderRadius: '8px' }}
                                                    />
                                                    <div style={{ display: 'none', color: '#888' }}>
                                                    📷 Imagem não pôde ser carregada
                                                    </div>
                                                </div>
                                            )}
                                            {msg.audioUrl && (
                                                <div className="message-audio">
                                                    <audio controls onError={(e) => {
                                                    // Se der erro, esconde o player e mostra texto alternativo
                                                    e.target.style.display = 'none';
                                                    const fallback = e.target.nextSibling;
                                                    if (fallback) fallback.style.display = 'block';
                                                    }}>
                                                    <source src={msg.audioUrl} type="audio/mpeg" />
                                                    Seu navegador não suporta o elemento de áudio.
                                                    </audio>
                                                    <div style={{ display: 'none', color: '#888' }}>
                                                    🎵 Mensagem de áudio recebida
                                                    </div>
                                                </div>
                                                )}
                                            <p>{msg.text}</p>
                                            {msg.ia && <span className="ia-badge">🤖 IA</span>}
                                            <span className="timestamp">
                                                {formatMessageTime(msg.timestamp)}
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
