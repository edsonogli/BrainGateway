import React, { useEffect, useState } from 'react';
import { useApi } from '../contexts/ApiContext';
import './Chats.css';

const Chats = () => {
    const { getChats } = useApi();
    const [chats, setChats] = useState([]);
    const [groupedChats, setGroupedChats] = useState([]);
    const [selectedNumber, setSelectedNumber] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchChats = async () => {
            try {
                const data = await getChats();
                setChats(data);

                // Agrupar mensagens por número e identificar a mais recente
                const grouped = Object.entries(
                    data.reduce((acc, chat) => {
                        if (!acc[chat.number]) {
                            acc[chat.number] = [];
                        }
                        acc[chat.number].push(chat);
                        return acc;
                    }, {})
                ).map(([number, messages]) => ({
                    number,
                    messages: messages.sort(
                        (a, b) => new Date(a.createdAt) - new Date(b.createdAt) // Mensagens em ordem cronológica
                    ),
                    lastMessage: Math.max(...messages.map((msg) => new Date(msg.createdAt))) // Data da mensagem mais recente
                }));

                // Ordenar os números pelo mais recente
                grouped.sort((a, b) => b.lastMessage - a.lastMessage);

                setGroupedChats(grouped);
            } catch (err) {
                setError('Failed to fetch chats');
                console.error(err);
            }
        };

        fetchChats();
    }, [getChats]);

    const handleNumberClick = (number) => {
        setSelectedNumber(number);
    };

    return (
        <div className="chats-page">
            <div className="contacts-sidebar">
                <h3>Contatos</h3>
                <ul>
                    {groupedChats.map(({ number }) => (
                        <li
                            key={number}
                            className={`contact ${selectedNumber === number ? 'active' : ''}`}
                            onClick={() => handleNumberClick(number)}
                        >
                            {number}
                        </li>
                    ))}
                </ul>
            </div>

            <div className="chat-panel">
                <h3>Chat</h3>
                {error && <p className="error-message">{error}</p>}
                {selectedNumber ? (
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
                                        {new Date(msg.createdAt).toLocaleString()}
                                    </span>
                                </div>
                            ))}
                    </div>
                ) : (
                    <p className="no-chat-selected">Selecione um contato para ver o chat.</p>
                )}
            </div>
        </div>
    );
};

export default Chats;
