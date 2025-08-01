import React, { useState, useEffect } from 'react';
import { useApi } from '../contexts/ApiContext';
import { useAuth } from '../components/AuthContext';
import './Campanhas.css';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

const Campanhas = () => {
    const { 
        getContacts, 
        getSurveys, 
        createSurvey, 
        deleteSurvey, 
        getSurveyDispatches, 
        createSurveyDispatchBulk,
        getSurveyStatistics,
        processSurveySpreadsheet,
        getProjects,
        sendSurveyMessages
    } = useApi();
    
    const { userData } = useAuth();
    
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
    const [spreadsheetResult, setSpreadsheetResult] = useState(null);
    const [processingSpreadsheet, setProcessingSpreadsheet] = useState(false);
    const [showSpreadsheetInstructions, setShowSpreadsheetInstructions] = useState(false);
    
    // Estados para projetos
    const [projects, setProjects] = useState([]);
    const [loadingProjects, setLoadingProjects] = useState(false);
    
    const [formData, setFormData] = useState({
        name: '',
        question: '',
        options: [''],
        projectId: 0
    });
    const [historico, setHistorico] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(false);
    
    // Estados para funcionalidade de reenvio
    const [showResendModal, setShowResendModal] = useState(false);
    const [unsentContacts, setUnsentContacts] = useState([]);
    const [selectedUnsentContacts, setSelectedUnsentContacts] = useState([]);
    const [loadingResend, setLoadingResend] = useState(false);
    const [showOnlyUnsent, setShowOnlyUnsent] = useState(false);
    
    // Estados para seleção no histórico
    const [selectedHistoryItems, setSelectedHistoryItems] = useState([]);
    const [showResendFromHistory, setShowResendFromHistory] = useState(false);
    
    // Estados para estatísticas
    const [showStatisticsModal, setShowStatisticsModal] = useState(false);
    const [statistics, setStatistics] = useState(null);
    const [loadingStatistics, setLoadingStatistics] = useState(false);

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

    // Carregar projetos quando o formulário for aberto (apenas para admins)
    useEffect(() => {
        if (showForm && userData?.isAdmin) {
            loadProjects();
        }
    }, [showForm, userData?.isAdmin]);

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

    const loadProjects = async () => {
        try {
            setLoadingProjects(true);
            const data = await getProjects();
            setProjects(data || []);
        } catch (error) {
            console.error('Erro ao carregar projetos:', error);
            setProjects([]);
        } finally {
            setLoadingProjects(false);
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
        
        // Validar se admin selecionou um projeto
        if (userData?.isAdmin && (!formData.projectId || formData.projectId === 0)) {
            alert('Por favor, selecione um projeto.');
            return;
        }
        
        try {
            const surveyData = {
                name: formData.name,
                question: formData.question,
                options: formData.options.filter(option => option.trim() !== ''),
                projectId: userData?.isAdmin ? formData.projectId : 0
            };
            
            await createSurvey(surveyData);
            await loadPesquisas(); // Recarregar lista
            
            // Resetar formulário
            setFormData({
                name: '',
                question: '',
                options: [''],
                projectId: 0
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

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validar tipo de arquivo
        const allowedTypes = [
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
            'application/vnd.ms-excel', // .xls
            'text/csv' // .csv
        ];

        if (!allowedTypes.includes(file.type)) {
            alert('Formato de arquivo não suportado. Use apenas .xlsx, .xls ou .csv');
            return;
        }

        // Validar tamanho (10MB)
        if (file.size > 10 * 1024 * 1024) {
            alert('Arquivo muito grande. Tamanho máximo: 10MB');
            return;
        }

        setUploadedFile(file);
        setProcessingSpreadsheet(true);
        setSpreadsheetResult(null);

        try {
            const result = await processSurveySpreadsheet(selectedPesquisa.id, file);
            setSpreadsheetResult(result);
            
            if (result.canProceed && result.processingResult.validNumbers.length > 0) {
                // Limpar seleção de contatos existentes
                setSelectedContacts([]);
                alert(`Planilha processada com sucesso!\n${result.processingResult.summary}`);
            } else if (result.processingResult.validNumbers.length === 0) {
                alert('Nenhum número válido encontrado na planilha. Verifique o formato dos dados.');
            }
        } catch (error) {
            console.error('Erro ao processar planilha:', error);
            alert('Erro ao processar planilha. Verifique o formato e tente novamente.');
            setUploadedFile(null);
        } finally {
            setProcessingSpreadsheet(false);
        }
    };

    const confirmDispatch = async () => {
        let contactNumbers = [];

        // Se há resultado de planilha, usar os números válidos da planilha
        if (spreadsheetResult && spreadsheetResult.processingResult.validNumbers.length > 0) {
            contactNumbers = spreadsheetResult.processingResult.validNumbers;
        } 
        // Caso contrário, usar contatos selecionados manualmente
        else if (selectedContacts.length > 0) {
            contactNumbers = selectedContacts.map(contactId => {
                const contact = contacts.find(c => c.id === contactId);
                return contact?.number;
            }).filter(Boolean);
        }

        if (contactNumbers.length === 0) {
            alert('Selecione pelo menos um contato ou processe uma planilha válida.');
            return;
        }

        try {
            // Usar o projectId do selectedPesquisa se o usuário for admin
            const projectId = userData?.isAdmin ? selectedPesquisa.projectId : 0;
            
            await createSurveyDispatchBulk(selectedPesquisa.id, {
                contactNumbers,
                projectId: projectId
            });

            alert(`Pesquisa disparada com sucesso para ${contactNumbers.length} contatos!`);
            setShowDispatchModal(false);
            setSelectedContacts([]);
            setUploadedFile(null);
            setSpreadsheetResult(null);
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

    // Função para identificar contatos não enviados
    const getUnsentContacts = () => {
        return historico.filter(item => !item.dispatchDate || item.dispatchDate === null);
    };

    // Função para abrir modal de reenvio
    const handleOpenResendModal = () => {
        const unsent = getUnsentContacts();
        setUnsentContacts(unsent);
        setSelectedUnsentContacts([]);
        setShowResendModal(true);
    };

    // Função para selecionar/deselecionar contato não enviado
    const handleUnsentContactSelect = (contactNumber) => {
        setSelectedUnsentContacts(prev => {
            if (prev.includes(contactNumber)) {
                return prev.filter(number => number !== contactNumber);
            } else {
                return [...prev, contactNumber];
            }
        });
    };

    // Função para selecionar todos os contatos não enviados
    const handleSelectAllUnsent = () => {
        if (selectedUnsentContacts.length === unsentContacts.length) {
            setSelectedUnsentContacts([]);
        } else {
            setSelectedUnsentContacts(unsentContacts.map(contact => contact.contactNumber));
        }
    };

    // Função para reenviar mensagens
    const handleResendMessages = async () => {
        if (selectedUnsentContacts.length === 0) {
            alert('Selecione pelo menos um contato para reenviar.');
            return;
        }

        if (!window.confirm(`Tem certeza que deseja reenviar a pesquisa para ${selectedUnsentContacts.length} contatos?`)) {
            return;
        }

        try {
            setLoadingResend(true);
            const result = await sendSurveyMessages(selectedPesquisa.id, selectedUnsentContacts);

            alert(`Reenvio concluído!\nTotal: ${result.totalNumbers}\nEnviados: ${result.successCount}\nErros: ${result.errorCount}`);
            
            // Recarregar histórico para atualizar o status
            const data = await getSurveyDispatches(selectedPesquisa.id);
            setHistorico(data || []);
            
            // Fechar modal de reenvio
            setShowResendModal(false);
            setSelectedUnsentContacts([]);
            
        } catch (error) {
            console.error('Erro ao reenviar mensagens:', error);
            alert('Erro ao reenviar mensagens. Tente novamente.');
        } finally {
            setLoadingResend(false);
        }
    };

    // Funções para seleção no histórico
    const handleHistoryItemSelect = (contactNumber) => {
        setSelectedHistoryItems(prev => {
            if (prev.includes(contactNumber)) {
                return prev.filter(number => number !== contactNumber);
            } else {
                return [...prev, contactNumber];
            }
        });
    };

    const handleSelectAllHistory = () => {
        const currentItems = showOnlyUnsent ? getUnsentContacts() : historico;
        const allNumbers = currentItems.map(item => item.contactNumber);
        
        if (selectedHistoryItems.length === allNumbers.length) {
            setSelectedHistoryItems([]);
        } else {
            setSelectedHistoryItems(allNumbers);
        }
    };

    const handleResendFromHistory = async () => {
        if (selectedHistoryItems.length === 0) {
            alert('Selecione pelo menos um contato para reenviar.');
            return;
        }

        if (!window.confirm(`Tem certeza que deseja reenviar a pesquisa para ${selectedHistoryItems.length} contatos selecionados?`)) {
            return;
        }

        try {
            setLoadingResend(true);
            const result = await sendSurveyMessages(selectedPesquisa.id, selectedHistoryItems);

            alert(`Reenvio concluído!\nTotal: ${result.totalNumbers}\nEnviados: ${result.successCount}\nErros: ${result.errorCount}`);
            
            // Recarregar histórico para atualizar o status
            const data = await getSurveyDispatches(selectedPesquisa.id);
            setHistorico(data || []);
            
            // Limpar seleções
            setSelectedHistoryItems([]);
            
        } catch (error) {
            console.error('Erro ao reenviar mensagens:', error);
            alert('Erro ao reenviar mensagens. Tente novamente.');
        } finally {
            setLoadingResend(false);
        }
    };

    // Função para carregar estatísticas
    const handleViewStatistics = async (pesquisa) => {
        setSelectedPesquisa(pesquisa);
        setShowStatisticsModal(true);
        
        try {
            setLoadingStatistics(true);
            const data = await getSurveyStatistics(pesquisa.id);
            setStatistics(data);
        } catch (error) {
            console.error('Erro ao carregar estatísticas:', error);
            setStatistics(null);
            alert('Erro ao carregar estatísticas. Tente novamente.');
        } finally {
            setLoadingStatistics(false);
        }
    };

    // Função para imprimir estatísticas
    const handlePrintStatistics = async () => {
        const printContent = document.querySelector('.statistics-content');
        
        // Clonar o conteúdo para não afetar o original
        const clonedContent = printContent.cloneNode(true);
        
        // Encontrar todos os canvas (gráficos) e convertê-los em imagens
        const canvasElements = printContent.querySelectorAll('canvas');
        const clonedCanvasContainers = clonedContent.querySelectorAll('.chart-wrapper');
        
        // Converter cada canvas em imagem
        for (let i = 0; i < canvasElements.length; i++) {
            const canvas = canvasElements[i];
            const clonedContainer = clonedCanvasContainers[i];
            
            if (canvas && clonedContainer) {
                try {
                    // Converter canvas para imagem
                    const imageDataUrl = canvas.toDataURL('image/png', 1.0);
                    
                    // Criar elemento de imagem
                    const img = document.createElement('img');
                    img.src = imageDataUrl;
                    img.style.maxWidth = '100%';
                    img.style.height = 'auto';
                    img.style.display = 'block';
                    img.style.margin = '0 auto';
                    
                    // Substituir o conteúdo do container clonado pela imagem
                    clonedContainer.innerHTML = '';
                    clonedContainer.appendChild(img);
                } catch (error) {
                    console.error('Erro ao converter gráfico para imagem:', error);
                    // Se falhar, manter o container vazio com uma mensagem
                    clonedContainer.innerHTML = '<p style="text-align: center; color: #666;">Gráfico não disponível para impressão</p>';
                }
            }
        }
        
        // Criar uma nova janela para impressão
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
                <head>
                    <title>Estatísticas - ${selectedPesquisa?.name}</title>
                    <style>
                        body { 
                            font-family: Arial, sans-serif; 
                            margin: 20px; 
                            color: #333;
                        }
                        .statistics-summary { 
                            display: grid; 
                            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); 
                            gap: 15px; 
                            margin-bottom: 30px; 
                        }
                        .stat-card { 
                            border: 1px solid #dee2e6; 
                            border-radius: 8px; 
                            padding: 15px; 
                            text-align: center; 
                            background: #f8f9fa;
                            display: flex;
                            flex-direction: column;
                            justify-content: space-between;
                            min-height: 80px;
                        }
                        .stat-card h4 { 
                            margin: 0 0 10px 0; 
                            font-size: 12px; 
                            text-transform: uppercase; 
                            color: #495057;
                            line-height: 1.3;
                        }
                        .stat-number { 
                            font-size: 24px; 
                            font-weight: bold; 
                            color: #333;
                            line-height: 1;
                            margin-top: auto;
                        }
                        .stat-number.pending { color: #ffc107; }
                        .stat-number.sent { color: #17a2b8; }
                        .stat-number.responded { color: #28a745; }
                        .stat-number.rate { color: #007bff; }
                        .chart-container { 
                            margin: 20px 0; 
                            page-break-inside: avoid;
                            text-align: center;
                        }
                        .chart-container h4 { 
                            text-align: center; 
                            margin-bottom: 15px;
                            color: #333;
                            font-size: 16px;
                            font-weight: 600;
                        }
                        .chart-wrapper {
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            min-height: 300px;
                        }
                        .chart-wrapper img {
                            max-width: 100%;
                            height: auto;
                            border: 1px solid #dee2e6;
                            border-radius: 8px;
                            background: white;
                            padding: 10px;
                        }
                        h1 { 
                            text-align: center; 
                            color: #333; 
                            margin-bottom: 30px;
                        }
                        @media print {
                            body { margin: 0; }
                            .chart-container { page-break-inside: avoid; }
                            .chart-wrapper img { 
                                max-height: 400px; 
                                page-break-inside: avoid;
                            }
                        }
                    </style>
                </head>
                <body>
                    <h1>📈 Estatísticas: ${selectedPesquisa?.name}</h1>
                    ${clonedContent.innerHTML}
                </body>
            </html>
        `);
        
        printWindow.document.close();
        printWindow.focus();
        
        // Aguardar um pouco mais para garantir que as imagens foram carregadas
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 500);
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
                                    className="btn-statistics"
                                    onClick={() => handleViewStatistics(pesquisa)}
                                >
                                    📈 Estatísticas
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
                            
                            {/* Campo de seleção de projeto - apenas para admins */}
                            {userData?.isAdmin && (
                                <div className="form-group">
                                    <label htmlFor="projectId">Projeto:</label>
                                    <select
                                        id="projectId"
                                        name="projectId"
                                        value={formData.projectId}
                                        onChange={handleInputChange}
                                        required
                                        disabled={loadingProjects}
                                    >
                                        <option value={0}>
                                            {loadingProjects ? 'Carregando projetos...' : 'Selecione um projeto'}
                                        </option>
                                        {projects.map(project => (
                                            <option key={project.id} value={project.projectId || project.id}>
                                                {project.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}
                            
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
                                    <div className="section-header">
                                        <h4>Importar Planilha</h4>
                                        <button 
                                            className="instructions-btn"
                                            onClick={() => setShowSpreadsheetInstructions(!showSpreadsheetInstructions)}
                                        >
                                            {showSpreadsheetInstructions ? '📖 Ocultar Instruções' : '📖 Ver Instruções'}
                                        </button>
                                    </div>
                                    
                                    {showSpreadsheetInstructions && (
                                        <div className="instructions-panel">
                                            <h5>📋 Como preparar sua planilha:</h5>
                                            <ul>
                                                <li><strong>Formato:</strong> Use .xlsx, .xls ou .csv</li>
                                                <li><strong>Estrutura:</strong> Números de telefone na primeira coluna</li>
                                                <li><strong>Formato dos números:</strong> 
                                                    <ul>
                                                        <li>✅ 5511999999999 (formato completo)</li>
                                                        <li>✅ 11999999999 (será convertido automaticamente)</li>
                                                        <li>❌ 11999 (muito curto)</li>
                                                        <li>❌ abc123 (contém letras)</li>
                                                    </ul>
                                                </li>
                                                <li><strong>Tamanho máximo:</strong> 10MB</li>
                                                <li><strong>Dica:</strong> Você pode incluir ou não cabeçalho na primeira linha</li>
                                            </ul>
                                        </div>
                                    )}
                                    
                                    <div className="file-upload">
                                        <input
                                            type="file"
                                            id="file-upload"
                                            accept=".xlsx,.xls,.csv"
                                            onChange={handleFileUpload}
                                            style={{ display: 'none' }}
                                            disabled={processingSpreadsheet}
                                        />
                                        <label 
                                            htmlFor="file-upload" 
                                            className={`upload-btn ${processingSpreadsheet ? 'processing' : ''}`}
                                        >
                                            {processingSpreadsheet ? '⏳ Processando...' : '📁 Selecionar Planilha'}
                                        </label>
                                        <p className="upload-info">
                                            Formatos aceitos: .xlsx, .xls, .csv (máx. 10MB)
                                        </p>
                                    </div>
                                    
                                    {uploadedFile && (
                                        <div className="file-status">
                                            <p><strong>Arquivo:</strong> {uploadedFile.name}</p>
                                        </div>
                                    )}
                                    
                                    {spreadsheetResult && (
                                        <div className="spreadsheet-result">
                                            <div className="result-summary">
                                                <h5>📊 Resultado do Processamento:</h5>
                                                <div className="result-stats">
                                                    <div className="stat-item valid">
                                                        <span className="stat-number">{spreadsheetResult.processingResult.validContacts}</span>
                                                        <span className="stat-label">Números válidos</span>
                                                    </div>
                                                    <div className="stat-item invalid">
                                                        <span className="stat-number">{spreadsheetResult.processingResult.invalidContacts}</span>
                                                        <span className="stat-label">Números inválidos</span>
                                                    </div>
                                                    <div className="stat-item total">
                                                        <span className="stat-number">{spreadsheetResult.processingResult.totalRows}</span>
                                                        <span className="stat-label">Total processado</span>
                                                    </div>
                                                </div>
                                                <p className="result-message">{spreadsheetResult.processingResult.summary}</p>
                                            </div>
                                            
                                            {spreadsheetResult.processingResult.invalidNumbers.length > 0 && (
                                                <div className="invalid-numbers">
                                                    <h6>⚠️ Números com problemas:</h6>
                                                    <div className="invalid-list">
                                                        {spreadsheetResult.processingResult.invalidNumbers.slice(0, 5).map((invalid, index) => (
                                                            <div key={index} className="invalid-item">
                                                                <span className="invalid-value">Linha {invalid.row}: "{invalid.originalValue}"</span>
                                                                <span className="invalid-error">{invalid.error}</span>
                                                            </div>
                                                        ))}
                                                        {spreadsheetResult.processingResult.invalidNumbers.length > 5 && (
                                                            <p className="more-errors">
                                                                ... e mais {spreadsheetResult.processingResult.invalidNumbers.length - 5} erros
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
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
                                            disabled={spreadsheetResult && spreadsheetResult.processingResult.validNumbers.length > 0}
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
                                                        disabled={spreadsheetResult && spreadsheetResult.processingResult.validNumbers.length > 0}
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
                                                                disabled={spreadsheetResult && spreadsheetResult.processingResult.validNumbers.length > 0}
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
                                    
                                    {spreadsheetResult && spreadsheetResult.processingResult.validNumbers.length > 0 && (
                                        <div className="spreadsheet-override-notice">
                                            <p>📋 Usando contatos da planilha processada. Para selecionar contatos manualmente, processe uma nova planilha ou recarregue a página.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            <div className="selected-summary">
                                {spreadsheetResult && spreadsheetResult.processingResult.validNumbers.length > 0 ? (
                                    <p><strong>Contatos da planilha:</strong> {spreadsheetResult.processingResult.validNumbers.length}</p>
                                ) : (
                                    <p><strong>Contatos selecionados:</strong> {selectedContacts.length}</p>
                                )}
                            </div>
                            
                            <div className="dispatch-actions">
                                <button 
                                    type="button" 
                                    onClick={() => {
                                        setShowDispatchModal(false);
                                        setUploadedFile(null);
                                        setSpreadsheetResult(null);
                                        setSelectedContacts([]);
                                    }}
                                >
                                    Cancelar
                                </button>
                                <button 
                                    type="button" 
                                    className="btn-primary"
                                    onClick={confirmDispatch}
                                    disabled={
                                        (spreadsheetResult && spreadsheetResult.processingResult.validNumbers.length === 0) &&
                                        selectedContacts.length === 0
                                    }
                                >
                                    {spreadsheetResult && spreadsheetResult.processingResult.validNumbers.length > 0 
                                        ? `Disparar para ${spreadsheetResult.processingResult.validNumbers.length} contatos da planilha`
                                        : `Disparar para ${selectedContacts.length} contatos`
                                    }
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
                                <div className="history-actions-left">
                                    <button 
                                        className="btn-export"
                                        onClick={exportHistorico}
                                    >
                                        📥 Exportar CSV
                                    </button>
                                    
                                    {/* Botão de reenvio - apenas para admins */}
                                    {userData?.isAdmin && getUnsentContacts().length > 0 && (
                                        <button 
                                            className="btn-resend"
                                            onClick={handleOpenResendModal}
                                        >
                                            🔄 Reenviar para não enviados ({getUnsentContacts().length})
                                        </button>
                                    )}

                                    {/* Botão para reenviar selecionados */}
                                    {userData?.isAdmin && selectedHistoryItems.length > 0 && (
                                        <button 
                                            className="btn-resend-selected"
                                            onClick={handleResendFromHistory}
                                            disabled={loadingResend}
                                        >
                                            {loadingResend ? 'Reenviando...' : `🔄 Reenviar Selecionados (${selectedHistoryItems.length})`}
                                        </button>
                                    )}
                                </div>
                                
                                <div className="history-actions-right">
                                    {/* Filtro para mostrar apenas não enviados */}
                                    <label className="filter-checkbox">
                                        <input
                                            type="checkbox"
                                            checked={showOnlyUnsent}
                                            onChange={(e) => setShowOnlyUnsent(e.target.checked)}
                                        />
                                        Mostrar apenas não enviados
                                    </label>
                                </div>
                            </div>

                            {/* Seleção geral - apenas para admins */}
                            {userData?.isAdmin && (showOnlyUnsent ? getUnsentContacts() : historico).length > 0 && (
                                <div className="history-selection-actions">
                                    <label className="select-all-history">
                                        <input
                                            type="checkbox"
                                            checked={selectedHistoryItems.length === (showOnlyUnsent ? getUnsentContacts() : historico).length}
                                            onChange={handleSelectAllHistory}
                                        />
                                        Selecionar todos ({(showOnlyUnsent ? getUnsentContacts() : historico).length})
                                    </label>
                                </div>
                            )}
                            
                            <div className="history-table-container">
                                <table className="history-table">
                                    <thead>
                                        <tr>
                                            {userData?.isAdmin && <th>Selecionar</th>}
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
                                                <td colSpan={userData?.isAdmin ? "6" : "5"} className="loading-message">Carregando histórico...</td>
                                            </tr>
                                        ) : historico.length === 0 ? (
                                            <tr>
                                                <td colSpan={userData?.isAdmin ? "6" : "5"} className="no-data">Nenhum disparo encontrado</td>
                                            </tr>
                                        ) : (
                                            (showOnlyUnsent ? getUnsentContacts() : historico).map((item, index) => (
                                                <tr key={index} className={!item.dispatchDate ? 'unsent-row' : ''}>
                                                    {userData?.isAdmin && (
                                                        <td>
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedHistoryItems.includes(item.contactNumber)}
                                                                onChange={() => handleHistoryItemSelect(item.contactNumber)}
                                                            />
                                                        </td>
                                                    )}
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

            {/* Modal de Reenvio */}
            {showResendModal && selectedPesquisa && (
                <div className="modal-overlay">
                    <div className="modal-content resend-modal">
                        <div className="modal-header">
                            <h3>Reenviar Pesquisa: {selectedPesquisa.name}</h3>
                            <button 
                                className="close-btn"
                                onClick={() => setShowResendModal(false)}
                            >
                                ×
                            </button>
                        </div>
                        
                        <div className="resend-content">
                            <p className="resend-description">
                                Selecione os contatos que não receberam a mensagem para reenviar:
                            </p>
                            
                            {unsentContacts.length === 0 ? (
                                <div className="no-unsent">
                                    <p>Todos os contatos já receberam a pesquisa!</p>
                                </div>
                            ) : (
                                <>
                                    <div className="unsent-actions">
                                        <label className="select-all-unsent">
                                            <input
                                                type="checkbox"
                                                checked={selectedUnsentContacts.length === unsentContacts.length}
                                                onChange={handleSelectAllUnsent}
                                            />
                                            Selecionar todos ({unsentContacts.length})
                                        </label>
                                    </div>
                                    
                                    <div className="unsent-contacts-list">
                                        {unsentContacts.map((contact, index) => (
                                            <div key={index} className="unsent-contact-item">
                                                <label>
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedUnsentContacts.includes(contact.contactNumber)}
                                                        onChange={() => handleUnsentContactSelect(contact.contactNumber)}
                                                    />
                                                    <span className="contact-info">
                                                        <strong>{contact.contactName || 'N/A'}</strong>
                                                        <span className="contact-number">{contact.contactNumber}</span>
                                                    </span>
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                    
                                    <div className="resend-summary">
                                        <p><strong>Contatos selecionados:</strong> {selectedUnsentContacts.length}</p>
                                    </div>
                                    
                                    <div className="resend-actions">
                                        <button 
                                            type="button" 
                                            onClick={() => setShowResendModal(false)}
                                        >
                                            Cancelar
                                        </button>
                                        <button 
                                            type="button" 
                                            className="btn-primary"
                                            onClick={handleResendMessages}
                                            disabled={selectedUnsentContacts.length === 0 || loadingResend}
                                        >
                                            {loadingResend ? 'Reenviando...' : `Reenviar para ${selectedUnsentContacts.length} contatos`}
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Estatísticas */}
            {showStatisticsModal && selectedPesquisa && (
                <div className="modal-overlay">
                    <div className="modal-content statistics-modal">
                        <div className="modal-header">
                            <h3>📈 Estatísticas: {selectedPesquisa.name}</h3>
                            <div className="modal-header-actions">
                                <button 
                                    className="btn-print"
                                    onClick={handlePrintStatistics}
                                    disabled={loadingStatistics || !statistics}
                                    title="Imprimir estatísticas"
                                >
                                    🖨️ Imprimir
                                </button>
                                <button 
                                    className="close-btn"
                                    onClick={() => setShowStatisticsModal(false)}
                                >
                                    ×
                                </button>
                            </div>
                        </div>
                        
                        <div className="statistics-content">
                            {loadingStatistics ? (
                                <div className="loading-statistics">
                                    <p>Carregando estatísticas...</p>
                                </div>
                            ) : statistics ? (
                                <>
                                    {/* Resumo das estatísticas */}
                                    <div className="statistics-summary">
                                        <div className="stat-card">
                                            <h4>Total de Disparos</h4>
                                            <span className="stat-number">{statistics.totalDispatches}</span>
                                        </div>
                                        <div className="stat-card">
                                            <h4>Pendentes</h4>
                                            <span className="stat-number pending">{statistics.pendingDispatches}</span>
                                        </div>
                                        <div className="stat-card">
                                            <h4>Enviados</h4>
                                            <span className="stat-number sent">{statistics.sentDispatches}</span>
                                        </div>
                                        <div className="stat-card">
                                            <h4>Respondidos</h4>
                                            <span className="stat-number responded">{statistics.respondedDispatches}</span>
                                        </div>
                                        <div className="stat-card">
                                            <h4>Taxa de Resposta</h4>
                                            <span className="stat-number rate">{statistics.responseRate?.toFixed(1)}%</span>
                                        </div>
                                    </div>

                                    {/* Gráficos */}
                                    <div className="statistics-charts">
                                        {/* Gráfico de Status dos Disparos */}
                                        <div className="chart-container">
                                            <h4>Status dos Disparos</h4>
                                            <div className="chart-wrapper">
                                                <Doughnut
                                                    data={{
                                                        labels: ['Pendentes', 'Enviados', 'Respondidos'],
                                                        datasets: [{
                                                            data: [
                                                                statistics.pendingDispatches,
                                                                statistics.sentDispatches - statistics.respondedDispatches,
                                                                statistics.respondedDispatches
                                                            ],
                                                            backgroundColor: [
                                                                '#ffc107',
                                                                '#17a2b8',
                                                                '#28a745'
                                                            ],
                                                            borderWidth: 2,
                                                            borderColor: '#fff'
                                                        }]
                                                    }}
                                                    options={{
                                                        responsive: true,
                                                        maintainAspectRatio: false,
                                                        plugins: {
                                                            legend: {
                                                                position: 'bottom'
                                                            }
                                                        }
                                                    }}
                                                />
                                            </div>
                                        </div>

                                        {/* Gráfico de Respostas */}
                                        {statistics.responses && statistics.responses.length > 0 && (
                                            <div className="chart-container">
                                                <h4>Distribuição das Respostas</h4>
                                                <div className="chart-wrapper">
                                                    <Bar
                                                        data={{
                                                            labels: statistics.responses.map(r => r.response),
                                                            datasets: [{
                                                                label: 'Quantidade de Respostas',
                                                                data: statistics.responses.map(r => r.count),
                                                                backgroundColor: '#007bff',
                                                                borderColor: '#0056b3',
                                                                borderWidth: 1
                                                            }]
                                                        }}
                                                        options={{
                                                            responsive: true,
                                                            maintainAspectRatio: false,
                                                            plugins: {
                                                                legend: {
                                                                    display: false
                                                                }
                                                            },
                                                            scales: {
                                                                y: {
                                                                    beginAtZero: true,
                                                                    ticks: {
                                                                        stepSize: 1
                                                                    }
                                                                }
                                                            }
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <div className="no-statistics">
                                    <p>Não foi possível carregar as estatísticas.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Campanhas;