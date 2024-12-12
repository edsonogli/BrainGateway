import React, { useEffect, useState } from 'react';
import { useApi } from '../contexts/ApiContext';
import './Chats.css';

const Chats = () => {
    const { getChats } = useApi();
    const [chats, setChats] = useState([]);
    const [groupedChats, setGroupedChats] = useState([]);
    const [selectedNumber, setSelectedNumber] = useState(null);
    const [error, setError] = useState(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        const fetchChats = async () => {
            try {
                const data = await getChats();
                setChats(data);

                // Agrupar mensagens por número e ordenar pelos mais recentes
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
                    messages,
                    lastMessage: messages[messages.length - 1]?.createdAt,
                }));

                grouped.sort((a, b) => new Date(b.lastMessage) - new Date(a.lastMessage));

                setGroupedChats(grouped);
            } catch (err) {
                setError('Failed to fetch messages');
                console.error(err);
            }
        };

        fetchChats();
    }, [getChats]);

    const handleNumberClick = (number) => {
        setSelectedNumber(number);
        setIsMenuOpen(false); // Fecha o menu ao selecionar um contato
    };

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    return (
        <div className="chats-page">
    {/* Botão para abrir o menu de contatos em telas menores */}
    <button className="toggle-menu" onClick={toggleMenu}>
        {isMenuOpen ? 'Fechar Contatos' : 'Abrir Contatos'}
    </button>

    {/* Sidebar de contatos para telas maiores */}
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

    {/* Drawer para telas menores */}
    <div className={`contacts-drawer ${isMenuOpen ? 'open' : ''}`}>
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

    {/* Painel de mensagens */}
    <div className="chat-panel">
        <h3>Chat</h3>
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
