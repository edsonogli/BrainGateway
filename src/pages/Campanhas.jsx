import React, { useState, useEffect } from 'react';
import { useApi } from '../contexts/ApiContext';
import './Campanhas.css';

const Campanhas = () => {
    const { getContacts } = useApi();
    
    // Estados para contatos (carregados via API)
    const [contacts, setContacts] = useState([]);
    const [loadingContacts, setLoadingContacts] = useState(false);
    
    const [pesquisas, setPesquisas] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [showDispatchModal, setShowDispatchModal] = useState(false);
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [selectedPesquisa, setSelectedPesquisa] = useState(null);
    const [selectedContacts, setSelectedContacts] = useState([]);
    const [uploadedFile, setUploadedFile] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [formData, setFormData] = useState({
        nome: '',
        pergunta: '',
        respostas: ['']
    });

    // Carregar contatos via API
    useEffect(() => {
        const fetchContacts = async () => {
            try {
                setLoadingContacts(true);
                const data = await getContacts();
                setContacts(data);
            } catch (error) {
                console.error('Erro ao carregar contatos:', error);
            } finally {
                setLoadingContacts(false);
            }
        };
        
        fetchContacts();
    }, [getContacts]);



    const mockPesquisas = [
        {
            id: 1,
            nome: 'Satisfação do Cliente',
            pergunta: 'Como você avalia nosso atendimento?',
            respostas: ['Excelente', 'Bom', 'Regular', 'Ruim'],
            criadoEm: '2024-01-15',
            status: 'Ativa'
        },
        {
            id: 2,
            nome: 'Pesquisa de Produto',
            pergunta: 'Qual produto você gostaria de ver em nossa loja?',
            respostas: ['Eletrônicos', 'Roupas', 'Casa e Jardim', 'Esportes'],
            criadoEm: '2024-01-10',
            status: 'Ativa'
        },
        {
            id: 3,
            nome: 'Feedback de Entrega',
            pergunta: 'Como foi sua experiência com a entrega?',
            respostas: ['Muito rápida', 'No prazo', 'Atrasada', 'Não recebi'],
            criadoEm: '2024-01-05',
            status: 'Finalizada'
        }
    ];

    // Dados mockados para histórico de disparos
    const mockHistorico = [
        {
            id: 1,
            pesquisaId: 1,
            numero: '11999999999',
            nomeContato: 'João Silva',
            dataDisparo: '2024-01-20 14:30:00',
            resposta: 'Excelente',
            dataResposta: '2024-01-20 14:35:00'
        },
        {
            id: 2,
            pesquisaId: 1,
            numero: '11888888888',
            nomeContato: 'Maria Santos',
            dataDisparo: '2024-01-20 14:30:00',
            resposta: 'Bom',
            dataResposta: '2024-01-20 14:40:00'
        },
        {
            id: 3,
            pesquisaId: 1,
            numero: '11777777777',
            nomeContato: 'Pedro Oliveira',
            dataDisparo: '2024-01-20 14:30:00',
            resposta: null,
            dataResposta: null
        },
        {
            id: 4,
            pesquisaId: 2,
            numero: '11666666666',
            nomeContato: 'Ana Costa',
            dataDisparo: '2024-01-18 10:15:00',
            resposta: 'Eletrônicos',
            dataResposta: '2024-01-18 10:20:00'
        },
        {
            id: 5,
            pesquisaId: 2,
            numero: '11555555555',
            nomeContato: 'Carlos Ferreira',
            dataDisparo: '2024-01-18 10:15:00',
            resposta: 'Roupas',
            dataResposta: '2024-01-18 10:25:00'
        },
        {
            id: 6,
            pesquisaId: 3,
            numero: '11444444444',
            nomeContato: 'Lucia Almeida',
            dataDisparo: '2024-01-10 16:00:00',
            resposta: 'No prazo',
            dataResposta: '2024-01-10 16:05:00'
        }
    ];

    useEffect(() => {
        setPesquisas(mockPesquisas);
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleRespostaChange = (index, value) => {
        const newRespostas = [...formData.respostas];
        newRespostas[index] = value;
        setFormData(prev => ({
            ...prev,
            respostas: newRespostas
        }));
    };

    const addResposta = () => {
        setFormData(prev => ({
            ...prev,
            respostas: [...prev.respostas, '']
        }));
    };

    const removeResposta = (index) => {
        if (formData.respostas.length > 1) {
            const newRespostas = formData.respostas.filter((_, i) => i !== index);
            setFormData(prev => ({
                ...prev,
                respostas: newRespostas
            }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const novaPesquisa = {
            id: pesquisas.length + 1,
            nome: formData.nome,
            pergunta: formData.pergunta,
            respostas: formData.respostas.filter(r => r.trim() !== ''),
            criadoEm: new Date().toISOString().split('T')[0],
            status: 'Ativa'
        };
        
        setPesquisas(prev => [...prev, novaPesquisa]);
        setFormData({ nome: '', pergunta: '', respostas: [''] });
        setShowForm(false);
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

    const confirmDispatch = () => {
        if (selectedContacts.length === 0) {
            alert('Selecione pelo menos um contato para disparar a pesquisa.');
            return;
        }
        
        // Aqui seria feita a chamada para a API
        alert(`Pesquisa "${selectedPesquisa.nome}" disparada para ${selectedContacts.length} contatos!`);
        setShowDispatchModal(false);
        setSelectedContacts([]);
        setSelectedPesquisa(null);
    };

    const handleViewHistory = (pesquisa) => {
        setSelectedPesquisa(pesquisa);
        setShowHistoryModal(true);
    };

    const getHistoricoByPesquisa = (pesquisaId) => {
        return mockHistorico.filter(item => item.pesquisaId === pesquisaId);
    };

    const exportHistorico = () => {
        const historico = getHistoricoByPesquisa(selectedPesquisa.id);
        
        // Criar CSV
        const headers = ['Nome', 'Número', 'Data Disparo', 'Resposta', 'Data Resposta'];
        const csvContent = [
            headers.join(','),
            ...historico.map(item => [
                item.nomeContato,
                item.numero,
                item.dataDisparo,
                item.resposta || 'Sem resposta',
                item.dataResposta || 'Não respondeu'
            ].join(','))
        ].join('\n');

        // Download do arquivo
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `historico_${selectedPesquisa.nome.replace(/\s+/g, '_')}.csv`);
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
                {pesquisas.map(pesquisa => (
                    <div key={pesquisa.id} className="pesquisa-card">
                        <div className="pesquisa-header">
                            <h3>{pesquisa.nome}</h3>
                            <span className={`status ${pesquisa.status.toLowerCase()}`}>
                                {pesquisa.status}
                            </span>
                        </div>
                        <div className="pesquisa-content">
                            <p className="pergunta">{pesquisa.pergunta}</p>
                            <div className="respostas">
                                <strong>Opções de resposta:</strong>
                                <ul>
                                    {pesquisa.respostas.map((resposta, index) => (
                                        <li key={index}>{resposta}</li>
                                    ))}
                                </ul>
                            </div>
                            <p className="data-criacao">Criado em: {pesquisa.criadoEm}</p>
                        </div>
                        <div className="pesquisa-actions">
                            <button 
                                className="btn-dispatch"
                                onClick={() => handleDispatch(pesquisa)}
                                disabled={pesquisa.status === 'Finalizada'}
                            >
                                📤 Disparar Pesquisa
                            </button>
                            <button 
                                className="btn-history"
                                onClick={() => handleViewHistory(pesquisa)}
                            >
                                📊 Histórico
                            </button>
                        </div>
                    </div>
                ))}
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
                                <label htmlFor="nome">Nome da Pesquisa:</label>
                                <input
                                    type="text"
                                    id="nome"
                                    name="nome"
                                    value={formData.nome}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            
                            <div className="form-group">
                                <label htmlFor="pergunta">Pergunta:</label>
                                <textarea
                                    id="pergunta"
                                    name="pergunta"
                                    value={formData.pergunta}
                                    onChange={handleInputChange}
                                    rows="3"
                                    required
                                />
                            </div>
                            
                            <div className="form-group">
                                <label>Possíveis Respostas:</label>
                                {formData.respostas.map((resposta, index) => (
                                    <div key={index} className="resposta-input">
                                        <input
                                            type="text"
                                            value={resposta}
                                            onChange={(e) => handleRespostaChange(index, e.target.value)}
                                            placeholder={`Opção ${index + 1}`}
                                            required
                                        />
                                        {formData.respostas.length > 1 && (
                                            <button
                                                type="button"
                                                className="remove-btn"
                                                onClick={() => removeResposta(index)}
                                            >
                                                ×
                                            </button>
                                        )}
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    className="add-resposta-btn"
                                    onClick={addResposta}
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
                            <h3>Disparar Pesquisa: {selectedPesquisa.nome}</h3>
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
                            <h3>Histórico: {selectedPesquisa.nome}</h3>
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
                                        {getHistoricoByPesquisa(selectedPesquisa.id).map(item => (
                                            <tr key={item.id}>
                                                <td>{item.nomeContato}</td>
                                                <td>{item.numero}</td>
                                                <td>{new Date(item.dataDisparo).toLocaleString('pt-BR')}</td>
                                                <td>
                                                    {item.resposta ? (
                                                        <span className="resposta-recebida">{item.resposta}</span>
                                                    ) : (
                                                        <span className="sem-resposta">Sem resposta</span>
                                                    )}
                                                </td>
                                                <td>
                                                    {item.dataResposta ? 
                                                        new Date(item.dataResposta).toLocaleString('pt-BR') : 
                                                        '-'
                                                    }
                                                </td>
                                            </tr>
                                        ))}
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