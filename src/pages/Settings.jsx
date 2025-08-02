import React, { useState, useEffect } from 'react';
import { useApi } from '../contexts/ApiContext';
import './Settings.css';

const Settings = () => {
    const { getAllowedNumbers, setAllowedNumbers: saveAllowedNumbers } = useApi();
    // Estados para palavras de controle
    const [stopWords, setStopWords] = useState([]);
    const [startWords, setStartWords] = useState([]);
    const [blockWords, setBlockWords] = useState([]);
    const [autoDisableWords, setAutoDisableWords] = useState([]);
    
    // Estados para filtro de números
    const [allowedNumbers, setAllowedNumbers] = useState([]);
    const [newNumber, setNewNumber] = useState('');
    
    // Estados para inputs
    const [newStopWord, setNewStopWord] = useState('');
    const [newStartWord, setNewStartWord] = useState('');
    const [newBlockWord, setNewBlockWord] = useState('');
    const [newAutoDisableWord, setNewAutoDisableWord] = useState('');
    
    // Estados de controle
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);

    // Funções para adicionar palavras
    const addStopWord = () => {
        if (newStopWord.trim() && !stopWords.includes(newStopWord.trim())) {
            setStopWords([...stopWords, newStopWord.trim()]);
            setNewStopWord('');
        }
    };

    const addStartWord = () => {
        if (newStartWord.trim() && !startWords.includes(newStartWord.trim())) {
            setStartWords([...startWords, newStartWord.trim()]);
            setNewStartWord('');
        }
    };

    const addBlockWord = () => {
        if (newBlockWord.trim() && !blockWords.includes(newBlockWord.trim())) {
            setBlockWords([...blockWords, newBlockWord.trim()]);
            setNewBlockWord('');
        }
    };

    const addAutoDisableWord = () => {
        if (newAutoDisableWord.trim() && !autoDisableWords.includes(newAutoDisableWord.trim())) {
            setAutoDisableWords([...autoDisableWords, newAutoDisableWord.trim()]);
            setNewAutoDisableWord('');
        }
    };

    // Função para adicionar número
    const addNumber = () => {
        const cleanNumber = newNumber.trim().replace(/\D/g, ''); // Remove caracteres não numéricos
        if (cleanNumber && !allowedNumbers.includes(cleanNumber)) {
            setAllowedNumbers([...allowedNumbers, cleanNumber]);
            setNewNumber('');
        }
    };

    // Funções para remover palavras
    const removeStopWord = (word) => {
        setStopWords(stopWords.filter(w => w !== word));
    };

    const removeStartWord = (word) => {
        setStartWords(startWords.filter(w => w !== word));
    };

    const removeBlockWord = (word) => {
        setBlockWords(blockWords.filter(w => w !== word));
    };

    const removeAutoDisableWord = (word) => {
        setAutoDisableWords(autoDisableWords.filter(w => w !== word));
    };

    // Função para remover número
    const removeNumber = (number) => {
        setAllowedNumbers(allowedNumbers.filter(n => n !== number));
    };

    // Função para salvar configurações
    const saveSettings = async () => {
        setLoading(true);
        try {
            // Salvar números permitidos via API
            await saveAllowedNumbers(allowedNumbers);
            
            // Aqui você pode adicionar outras chamadas de API para salvar outras configurações
            const settings = {
                stopWords,
                startWords,
                blockWords,
                autoDisableWords
            };
            
            console.log('Salvando outras configurações:', settings);
            
            setMessage({ type: 'success', text: 'Configurações salvas com sucesso!' });
            setTimeout(() => setMessage(null), 3000);
        } catch (error) {
            console.error('Erro ao salvar configurações:', error);
            setMessage({ type: 'error', text: 'Erro ao salvar configurações. Tente novamente.' });
            setTimeout(() => setMessage(null), 3000);
        } finally {
            setLoading(false);
        }
    };

    // Função para carregar configurações
    const loadSettings = async () => {
        setLoading(true);
        try {
            // Carregar números permitidos da API
            const allowedNumbersData = await getAllowedNumbers();
            
            // Extrair apenas os números da resposta da API
            const numbers = allowedNumbersData.map(item => item.number);
            setAllowedNumbers(numbers);
            
            // Aqui você pode adicionar outras chamadas de API para carregar outras configurações
            // Por enquanto, vamos simular dados para as outras configurações
            setStopWords(['parar', 'cancelar', 'sair']);
            setStartWords(['iniciar', 'começar', 'start']);
            setBlockWords(['spam', 'proibido']);
            setAutoDisableWords(['desativar', 'disable']);
        } catch (error) {
            console.error('Erro ao carregar configurações:', error);
            // Em caso de erro, manter valores padrão
            setAllowedNumbers([]);
            setStopWords(['parar', 'cancelar', 'sair']);
            setStartWords(['iniciar', 'começar', 'start']);
            setBlockWords(['spam', 'proibido']);
            setAutoDisableWords(['desativar', 'disable']);
            setMessage({ type: 'error', text: 'Erro ao carregar configurações' });
            setTimeout(() => setMessage(null), 3000);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadSettings();
    }, []);

    return (
        <div className="settings-container">
            <h2>Configurações do Sistema</h2>
            
            {message && (
                <div className={`message ${message.type}`}>
                    {message.text}
                </div>
            )}

            <div className="settings-grid">
                {/* Palavras de Stop */}
                <div className="settings-section">
                    <h3>
                        <span className="section-icon">🛑</span>
                        Palavras de Stop
                    </h3>
                    <p className="section-description">
                        Palavras que param/travam a integração quando detectadas
                    </p>
                    
                    <div className="word-input-group">
                        <input
                            type="text"
                            value={newStopWord}
                            onChange={(e) => setNewStopWord(e.target.value)}
                            placeholder="Digite uma palavra de stop..."
                            onKeyPress={(e) => e.key === 'Enter' && addStopWord()}
                        />
                        <button onClick={addStopWord} className="add-button">
                            Adicionar
                        </button>
                    </div>
                    
                    <div className="words-list">
                        {stopWords.map((word, index) => (
                            <div key={index} className="word-tag stop">
                                {word}
                                <button onClick={() => removeStopWord(word)} className="remove-word">
                                    ×
                                </button>
                            </div>
                        ))}
                        {stopWords.length === 0 && (
                            <p className="empty-list">Nenhuma palavra de stop cadastrada</p>
                        )}
                    </div>
                </div>

                {/* Palavras de Start */}
                <div className="settings-section">
                    <h3>
                        <span className="section-icon">▶️</span>
                        Palavras de Start
                    </h3>
                    <p className="section-description">
                        Palavras que reativam a integração quando detectadas
                    </p>
                    
                    <div className="word-input-group">
                        <input
                            type="text"
                            value={newStartWord}
                            onChange={(e) => setNewStartWord(e.target.value)}
                            placeholder="Digite uma palavra de start..."
                            onKeyPress={(e) => e.key === 'Enter' && addStartWord()}
                        />
                        <button onClick={addStartWord} className="add-button">
                            Adicionar
                        </button>
                    </div>
                    
                    <div className="words-list">
                        {startWords.map((word, index) => (
                            <div key={index} className="word-tag start">
                                {word}
                                <button onClick={() => removeStartWord(word)} className="remove-word">
                                    ×
                                </button>
                            </div>
                        ))}
                        {startWords.length === 0 && (
                            <p className="empty-list">Nenhuma palavra de start cadastrada</p>
                        )}
                    </div>
                </div>

                {/* Palavras de Bloqueio */}
                <div className="settings-section">
                    <h3>
                        <span className="section-icon">🚫</span>
                        Palavras de Bloqueio
                    </h3>
                    <p className="section-description">
                        Palavras que bloqueiam completamente a integração
                    </p>
                    
                    <div className="word-input-group">
                        <input
                            type="text"
                            value={newBlockWord}
                            onChange={(e) => setNewBlockWord(e.target.value)}
                            placeholder="Digite uma palavra de bloqueio..."
                            onKeyPress={(e) => e.key === 'Enter' && addBlockWord()}
                        />
                        <button onClick={addBlockWord} className="add-button">
                            Adicionar
                        </button>
                    </div>
                    
                    <div className="words-list">
                        {blockWords.map((word, index) => (
                            <div key={index} className="word-tag block">
                                {word}
                                <button onClick={() => removeBlockWord(word)} className="remove-word">
                                    ×
                                </button>
                            </div>
                        ))}
                        {blockWords.length === 0 && (
                            <p className="empty-list">Nenhuma palavra de bloqueio cadastrada</p>
                        )}
                    </div>
                </div>

                {/* Palavras de Inativação Automática */}
                <div className="settings-section">
                    <h3>
                        <span className="section-icon">💤</span>
                        Inativação de Chat Automático
                    </h3>
                    <p className="section-description">
                        Palavras que inativam o chat automático para o número específico
                    </p>
                    
                    <div className="word-input-group">
                        <input
                            type="text"
                            value={newAutoDisableWord}
                            onChange={(e) => setNewAutoDisableWord(e.target.value)}
                            placeholder="Digite uma palavra de inativação..."
                            onKeyPress={(e) => e.key === 'Enter' && addAutoDisableWord()}
                        />
                        <button onClick={addAutoDisableWord} className="add-button">
                            Adicionar
                        </button>
                    </div>
                    
                    <div className="words-list">
                        {autoDisableWords.map((word, index) => (
                            <div key={index} className="word-tag auto-disable">
                                {word}
                                <button onClick={() => removeAutoDisableWord(word)} className="remove-word">
                                    ×
                                </button>
                            </div>
                        ))}
                        {autoDisableWords.length === 0 && (
                            <p className="empty-list">Nenhuma palavra de inativação cadastrada</p>
                        )}
                    </div>
                </div>

                {/* Filtro de Números Permitidos */}
                <div className="settings-section">
                    <h3>
                        <span className="section-icon">📞</span>
                        Números Permitidos
                    </h3>
                    <p className="section-description">
                        Configure os números que podem usar a integração. Se a lista estiver vazia, todos os números poderão usar. Se houver números na lista, apenas estes poderão usar a integração.
                    </p>
                    
                    <div className="word-input-group">
                        <input
                            type="text"
                            value={newNumber}
                            onChange={(e) => setNewNumber(e.target.value)}
                            placeholder="Digite um número (ex: 5511999999999)..."
                            onKeyPress={(e) => e.key === 'Enter' && addNumber()}
                        />
                        <button onClick={addNumber} className="add-button">
                            Adicionar
                        </button>
                    </div>
                    
                    <div className="words-list">
                        {allowedNumbers.map((number, index) => (
                            <div key={index} className="word-tag number">
                                {number}
                                <button onClick={() => removeNumber(number)} className="remove-word">
                                    ×
                                </button>
                            </div>
                        ))}
                        {allowedNumbers.length === 0 && (
                            <p className="empty-list">
                                <strong>Todos os números permitidos</strong><br />
                                Adicione números para restringir o acesso apenas a eles
                            </p>
                        )}
                    </div>
                </div>
            </div>

            <div className="settings-actions">
                <button 
                    onClick={saveSettings} 
                    disabled={loading}
                    className="save-button"
                >
                    {loading ? 'Salvando...' : 'Salvar Configurações'}
                </button>
            </div>
        </div>
    );
};

export default Settings;
