import React, { useEffect, useState } from 'react';
import { useApi } from '../contexts/ApiContext';
import './Chats.css';

const Chats = () => {
    const { getChats } = useApi();
    const [chats, setChats] = useState([]);
    const [groupedChats, setGroupedChats] = useState([]);
    const [selectedNumber, setSelectedNumber] = useState(null);
    const [error, setError] = useState(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const fetchChats = async () => {
            try {
                const data = await getChats();
                setChats(data);

                const grouped = Object.entries(
                    data.reduce((acc, chat) => {
                        if (!acc[chat.number]) {
                            acc[chat.number] = [];
                        }
                        acc[chat.number].push(chat);
                        return acc;
                    }, {})
                ).map(([number, messages]) => {
                    // Ordenar mensagens do mais antigo para o mais recente
                    const sortedMessages = messages.sort(
                        (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
                    );
                    
                    return {
                        number,
                        messages: sortedMessages,
                        lastMessage: sortedMessages[sortedMessages.length - 1],
                        lastMessageTime: new Date(sortedMessages[sortedMessages.length - 1].createdAt)
                    };
                });

                // Ordenar conversas pela mensagem mais recente primeiro
                grouped.sort((a, b) => b.lastMessageTime - a.lastMessageTime);
                setGroupedChats(grouped);
            } catch (err) {
                setError('Falha ao carregar as conversas');
                console.error(err);
            }
        };

        fetchChats();
    }, [getChats]);

    const handleNumberClick = (number) => {
        setSelectedNumber(number);
        setIsMobileMenuOpen(false);
    };

    const formatMessageTime = (date) => {
        const now = new Date();
        const messageDate = new Date(date);
        const diffDays = Math.floor((now - messageDate) / (1000 * 60 * 60 * 24));
        const time = messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        if (diffDays === 0) {
            return time;
        } else if (diffDays === 1) {
            return `Ontem ${time}`;
        } else if (diffDays < 7) {
            const weekday = messageDate.toLocaleDateString([], { weekday: 'long' });
            return `${weekday} ${time}`;
        } else {
            return messageDate.toLocaleDateString([], { 
                day: '2-digit', 
                month: '2-digit', 
                year: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            });
        }
    };

    return (
        <div className="chats-page">
            {/* Botão do menu mobile */}
            <button 
                className="toggle-menu" 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Toggle contacts menu"
            >
                ☰
            </button>

            {/* Sidebar de contatos */}
            <div className={`contacts-sidebar ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
                <h3>Conversas</h3>
                <ul>
                    {groupedChats.map(({ number, lastMessage }) => (
                        <li
                            key={number}
                            className={`contact ${selectedNumber === number ? 'active' : ''}`}
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
                    ))}
                </ul>
            </div>

            {/* Painel de chat */}
            <div className="chat-panel">
                {selectedNumber ? (
                    <>
                        <div className="chat-panel-header">{selectedNumber}</div>
                        <div className="messages">
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
                        </div>
                    </>
                ) : (
                    <div className="no-chat-selected">
                        <p>Selecione uma conversa para visualizar as mensagens</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Chats;
