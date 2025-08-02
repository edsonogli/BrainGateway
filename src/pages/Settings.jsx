import React, { useState, useEffect } from 'react';
import './Settings.css';

const Settings = () => {
    // Estados para palavras de controle
    const [stopWords, setStopWords] = useState([]);
    const [startWords, setStartWords] = useState([]);
    const [blockWords, setBlockWords] = useState([]);
    const [autoDisableWords, setAutoDisableWords] = useState([]);
    
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

    // Função para salvar configurações
    const saveSettings = async () => {
        setLoading(true);
        try {
            // Aqui você implementará a chamada para a API
            // await api.saveSettings({ stopWords, startWords, blockWords, autoDisableWords });
            setMessage({ type: 'success', text: 'Configurações salvas com sucesso!' });
            setTimeout(() => setMessage(null), 3000);
        } catch (error) {
            setMessage({ type: 'error', text: 'Erro ao salvar configurações' });
            setTimeout(() => setMessage(null), 3000);
        } finally {
            setLoading(false);
        }
    };

    // Função para carregar configurações
    const loadSettings = async () => {
        setLoading(true);
        try {
            // Aqui você implementará a chamada para a API
            // const settings = await api.getSettings();
            // setStopWords(settings.stopWords || []);
            // setStartWords(settings.startWords || []);
            // setBlockWords(settings.blockWords || []);
            // setAutoDisableWords(settings.autoDisableWords || []);
        } catch (error) {
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
