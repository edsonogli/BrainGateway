import React, { useState, useEffect } from 'react';
import { useApi } from '../contexts/ApiContext';
import './Campanhas.css';

const Campanhas = () => {
    const { 
        getContacts, 
        getSurveys, 
        createSurvey, 
        deleteSurvey, 
        getSurveyDispatches, 
        createSurveyDispatchBulk,
        getSurveyStatistics 
    } = useApi();
    
    // Estados para contatos (carregados via API)
    const [contacts, setContacts] = useState([]);
    const [loadingContacts, setLoadingContacts] = useState(false);
    
    const [pesquisas, setPesquisas] = useState([]);
    const [loadingPesquisas, setLoadingPesquisas] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [showDispatchModal, setShowDispatchModal] = useState(false);
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [selectedPesquisa, setSelectedPesquisa] = useState(null);
    const [selectedContacts, setSelectedContacts] = useState([]);
    const [uploadedFile, setUploadedFile] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        question: '',
        options: ['']
    });
    const [historico, setHistorico] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(false);

    // Carregar pesquisas ao montar o componente
    useEffect(() => {
        loadPesquisas();
    }, []);

    const loadPesquisas = async () => {
        try {
            setLoadingPesquisas(true);
            const data = await getSurveys();
            setPesquisas(data || []);
        } catch (error) {
            console.error('Erro ao carregar pesquisas:', error);
            setPesquisas([]);
        } finally {
            setLoadingPesquisas(false);
        }
    };


    // Carregar contatos quando necessário
    useEffect(() => {
        if (showDispatchModal) {
            loadContacts();
        }
    }, [showDispatchModal]);

    const loadContacts = async () => {
        try {
            setLoadingContacts(true);
            const data = await getContacts();
            setContacts(data || []);
        } catch (error) {
            console.error('Erro ao carregar contatos:', error);
            setContacts([]);
        } finally {
            setLoadingContacts(false);
        }
    };





    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleOptionChange = (index, value) => {
        const newOptions = [...formData.options];
        newOptions[index] = value;
        setFormData(prev => ({
            ...prev,
            options: newOptions
        }));
    };

    const addOption = () => {
        setFormData(prev => ({
            ...prev,
            options: [...prev.options, '']
        }));
    };

    const removeOption = (index) => {
        if (formData.options.length > 1) {
            const newOptions = formData.options.filter((_, i) => i !== index);
            setFormData(prev => ({
                ...prev,
                options: newOptions
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const surveyData = {
                name: formData.name,
                question: formData.question,
                options: formData.options.filter(option => option.trim() !== ''),
                projectId: 1 // Assumindo projectId padrão, pode ser obtido do contexto
            };
            
            await createSurvey(surveyData);
            await loadPesquisas(); // Recarregar lista
            
            // Resetar formulário
            setFormData({
                name: '',
                question: '',
                options: ['']
            });
            setShowForm(false);
        } catch (error) {
            console.error('Erro ao criar pesquisa:', error);
            alert('Erro ao criar pesquisa. Tente novamente.');
        }
    };

    const handleDelete = async (pesquisaId) => {
        if (window.confirm('Tem certeza que deseja excluir esta pesquisa?')) {
            try {
                await deleteSurvey(pesquisaId);
                await loadPesquisas(); // Recarregar lista
            } catch (error) {
                console.error('Erro ao excluir pesquisa:', error);
                alert('Erro ao excluir pesquisa. Tente novamente.');
            }
        }
    };

    const handleDispatch = (pesquisa) => {
        setSelectedPesquisa(pesquisa);
        setShowDispatchModal(true);
        setSelectedContacts([]);
    };

    const handleContactSelect = (contactId) => {
        setSelectedContacts(prev => {
            if (prev.includes(contactId)) {
                return prev.filter(id => id !== contactId);
            } else {
                return [...prev, contactId];
            }
        });
    };

    const handleSelectAllContacts = () => {
        const filteredContactIds = filteredContacts.map(c => c.id);
        if (selectedContacts.length === filteredContactIds.length) {
            setSelectedContacts([]);
        } else {
            setSelectedContacts(filteredContactIds);
        }
    };

    const filteredContacts = contacts.filter(contact =>
        (contact.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.number?.includes(searchTerm)) &&
        contact.active !== false
    );

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Aqui seria implementada a lógica de upload da planilha
            alert(`Arquivo ${file.name} selecionado. Funcionalidade será implementada com a API.`);
        }
    };

    const confirmDispatch = async () => {
        if (selectedContacts.length === 0) {
            alert('Selecione pelo menos um contato.');
            return;
        }

        try {
            const contactNumbers = selectedContacts.map(contactId => {
                const contact = contacts.find(c => c.id === contactId);
                return contact?.number;
            }).filter(Boolean);

            await createSurveyDispatchBulk(selectedPesquisa.id, {
                contactNumbers,
                projectId: 1 // Assumindo projectId padrão
            });

            alert('Pesquisa disparada com sucesso!');
            setShowDispatchModal(false);
            setSelectedContacts([]);
        } catch (error) {
            console.error('Erro ao disparar pesquisa:', error);
            alert('Erro ao disparar pesquisa. Tente novamente.');
        }
    };

    const handleViewHistory = async (pesquisa) => {
        setSelectedPesquisa(pesquisa);
        setShowHistoryModal(true);
        
        try {
            setLoadingHistory(true);
            const data = await getSurveyDispatches(pesquisa.id);
            setHistorico(data || []);
        } catch (error) {
            console.error('Erro ao carregar histórico:', error);
            setHistorico([]);
        } finally {
            setLoadingHistory(false);
        }
    };

    const exportHistorico = () => {
        if (!historico.length) {
            alert('Não há dados para exportar.');
            return;
        }
        
        // Criar CSV
        const headers = ['Nome', 'Número', 'Data Disparo', 'Resposta', 'Data Resposta'];
        const csvContent = [
            headers.join(','),
            ...historico.map(item => [
                item.contactName || 'N/A',
                item.contactNumber,
                item.dispatchDate ? new Date(item.dispatchDate).toLocaleString('pt-BR') : 'Não enviado',
                item.response || 'Sem resposta',
                item.responseDate ? new Date(item.responseDate).toLocaleString('pt-BR') : '-'
            ].join(','))
        ].join('\n');

        // Download do arquivo
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `historico_${selectedPesquisa.name}_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="campanhas-container">
            <div className="campanhas-header">
                <h2>Campanhas de Pesquisa</h2>
                <button 
                    className="btn-new-survey"
                    onClick={() => setShowForm(true)}
                >
                    + Nova Pesquisa
                </button>
            </div>

            {/* Lista de Pesquisas */}
            <div className="pesquisas-grid">
                {loadingPesquisas ? (
                    <div className="loading-message">Carregando pesquisas...</div>
                ) : pesquisas.length === 0 ? (
                    <div className="no-surveys">Nenhuma pesquisa encontrada.</div>
                ) : (
                    pesquisas.map(pesquisa => (
                        <div key={pesquisa.id} className="pesquisa-card">
                            <div className="pesquisa-header">
                                <h3>{pesquisa.name}</h3>
                                <span className={`status ${pesquisa.status?.toLowerCase()}`}>
                                    {pesquisa.status}
                                </span>
                            </div>
                            <div className="pesquisa-content">
                                <p className="pergunta">{pesquisa.question}</p>
                                <div className="opcoes">
                                    {pesquisa.options?.map((opcao, index) => (
                                        <span key={index} className="opcao-tag">{opcao}</span>
                                    ))}
                                </div>
                                <p className="data-criacao">
                                    Criado em: {new Date(pesquisa.createdAt).toLocaleDateString('pt-BR')}
                                </p>
                            </div>
                            <div className="pesquisa-actions">
                                <button 
                                    className="btn-dispatch"
                                    onClick={() => handleDispatch(pesquisa)}
                                    disabled={pesquisa.status === 'closed'}
                                >
                                    📤 Disparar Pesquisa
                                </button>
                                <button 
                                    className="btn-history"
                                    onClick={() => handleViewHistory(pesquisa)}
                                >
                                    📊 Histórico
                                </button>
                                <button 
                                    className="btn-delete"
                                    onClick={() => handleDelete(pesquisa.id)}
                                >
                                    🗑️ Excluir
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Modal de Formulário */}
            {showForm && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>Nova Pesquisa</h3>
                            <button 
                                className="close-btn"
                                onClick={() => setShowForm(false)}
                            >
                                ×
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="pesquisa-form">
                            <div className="form-group">
                                <label htmlFor="name">Nome da Pesquisa:</label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            
                            <div className="form-group">
                                <label htmlFor="question">Pergunta:</label>
                                <textarea
                                    id="question"
                                    name="question"
                                    value={formData.question}
                                    onChange={handleInputChange}
                                    rows="3"
                                    required
                                />
                            </div>
                            
                            <div className="form-group">
                                <label>Possíveis Respostas:</label>
                                {formData.options.map((option, index) => (
                                    <div key={index} className="option-input">
                                        <input
                                            type="text"
                                            value={option}
                                            onChange={(e) => handleOptionChange(index, e.target.value)}
                                            placeholder={`Opção ${index + 1}`}
                                            required
                                        />
                                        {formData.options.length > 1 && (
                                            <button
                                                type="button"
                                                className="remove-btn"
                                                onClick={() => removeOption(index)}
                                            >
                                                ×
                                            </button>
                                        )}
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    className="add-option-btn"
                                    onClick={addOption}
                                >
                                    + Adicionar Opção
                                </button>
                            </div>
                            
                            <div className="form-actions">
                                <button type="button" onClick={() => setShowForm(false)}>
                                    Cancelar
                                </button>
                                <button type="submit" className="btn-primary">
                                    Criar Pesquisa
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal de Disparo */}
            {showDispatchModal && selectedPesquisa && (
                <div className="modal-overlay">
                    <div className="modal-content dispatch-modal">
                        <div className="modal-header">
                            <h3>Disparar Pesquisa: {selectedPesquisa.name}</h3>
                            <button 
                                className="close-btn"
                                onClick={() => setShowDispatchModal(false)}
                            >
                                ×
                            </button>
                        </div>
                        
                        <div className="dispatch-content">
                            <div className="dispatch-options">
                                <div className="option-section">
                                    <h4>Importar Planilha</h4>
                                    <div className="file-upload">
                                        <input
                                            type="file"
                                            id="file-upload"
                                            accept=".xlsx,.xls,.csv"
                                            onChange={handleFileUpload}
                                            style={{ display: 'none' }}
                                        />
                                        <label htmlFor="file-upload" className="upload-btn">
                                            📁 Selecionar Planilha
                                        </label>
                                        <p className="upload-info">
                                            Formatos aceitos: .xlsx, .xls, .csv
                                        </p>
                                    </div>
                                </div>
                                
                                <div className="divider">OU</div>
                                
                                <div className="option-section">
                                    <h4>Selecionar Contatos Existentes</h4>
                                    <div className="contacts-search">
                                        <input
                                            type="text"
                                            placeholder="Buscar contatos..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="search-input"
                                        />
                                    </div>
                                    
                                    {loadingContacts ? (
                                        <div className="loading-contacts">
                                            <p>Carregando contatos...</p>
                                        </div>
                                    ) : (
                                        <div className="contacts-selection">
                                            <div className="select-all">
                                                <label>
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedContacts.length === filteredContacts.length && filteredContacts.length > 0}
                                                        onChange={handleSelectAllContacts}
                                                    />
                                                    Selecionar todos ({filteredContacts.length})
                                                </label>
                                            </div>
                                            
                                            <div className="contacts-list">
                                                {filteredContacts.map(contact => (
                                                    <div key={contact.id} className="contact-item">
                                                        <label>
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedContacts.includes(contact.id)}
                                                                onChange={() => handleContactSelect(contact.id)}
                                                            />
                                                            <span className="contact-info">
                                                                <strong>{contact.name}</strong>
                                                                <span className="contact-number">{contact.number}</span>
                                                            </span>
                                                        </label>
                                                    </div>
                                                ))}
                                                {filteredContacts.length === 0 && (
                                                    <p className="no-contacts">Nenhum contato encontrado</p>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            <div className="selected-summary">
                                <p><strong>Contatos selecionados:</strong> {selectedContacts.length}</p>
                            </div>
                            
                            <div className="dispatch-actions">
                                <button 
                                    type="button" 
                                    onClick={() => setShowDispatchModal(false)}
                                >
                                    Cancelar
                                </button>
                                <button 
                                    type="button" 
                                    className="btn-primary"
                                    onClick={confirmDispatch}
                                    disabled={selectedContacts.length === 0}
                                >
                                    Disparar para {selectedContacts.length} contatos
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Histórico */}
            {showHistoryModal && selectedPesquisa && (
                <div className="modal-overlay">
                    <div className="modal-content history-modal">
                        <div className="modal-header">
                            <h3>Histórico: {selectedPesquisa.name}</h3>
                            <button 
                                className="close-btn"
                                onClick={() => setShowHistoryModal(false)}
                            >
                                ×
                            </button>
                        </div>
                        
                        <div className="history-content">
                            <div className="history-actions">
                                <button 
                                    className="btn-export"
                                    onClick={exportHistorico}
                                >
                                    📥 Exportar CSV
                                </button>
                            </div>
                            
                            <div className="history-table-container">
                                <table className="history-table">
                                    <thead>
                                        <tr>
                                            <th>Nome</th>
                                            <th>Número</th>
                                            <th>Data Disparo</th>
                                            <th>Resposta</th>
                                            <th>Data Resposta</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loadingHistory ? (
                                            <tr>
                                                <td colSpan="5" className="loading-message">Carregando histórico...</td>
                                            </tr>
                                        ) : historico.length === 0 ? (
                                            <tr>
                                                <td colSpan="5" className="no-data">Nenhum disparo encontrado</td>
                                            </tr>
                                        ) : (
                                            historico.map((item, index) => (
                                                <tr key={index}>
                                                    <td>{item.contactName || 'N/A'}</td>
                                                    <td>{item.contactNumber}</td>
                                                    <td>{item.dispatchDate ? new Date(item.dispatchDate).toLocaleString('pt-BR') : 'Não enviado'}</td>
                                                    <td>
                                                        {item.response ? (
                                                            <span className="resposta-recebida">{item.response}</span>
                                                        ) : (
                                                            <span className="sem-resposta">Sem resposta</span>
                                                        )}
                                                    </td>
                                                    <td>
                                                        {item.responseDate ? 
                                                            new Date(item.responseDate).toLocaleString('pt-BR') : 
                                                            '-'
                                                        }
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Campanhas;