import React, { useEffect, useState } from 'react';
import { useApi } from '../contexts/ApiContext';
import { useAuth } from '../components/AuthContext';
import { useNavigate } from 'react-router-dom';
import { debugError } from '../config';
import './Instances.css';

const Instances = () => {
    const { getInstances, getProjects, createInstance, setWebhook, getWebhook } = useApi();
    const { userData } = useAuth();
    const navigate = useNavigate();
    const [instances, setInstances] = useState([]);
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [instanceName, setInstanceName] = useState('');
    const [number, setNumber] = useState('');
    const [creating, setCreating] = useState(false);
    const [showWebhookModal, setShowWebhookModal] = useState(false);
    const [selectedInstance, setSelectedInstance] = useState(null);
    const [webhookUrl, setWebhookUrl] = useState('');
    const [currentWebhookUrl, setCurrentWebhookUrl] = useState('');
    const [settingWebhook, setSettingWebhook] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [instancesData, projectsData] = await Promise.all([
                    getInstances(),
                    getProjects()
                ]);
                
                setInstances(Array.isArray(instancesData) ? instancesData : []);
                setProjects(Array.isArray(projectsData) ? projectsData : []);
            } catch (err) {
                setError('Falha ao carregar instâncias');
                debugError('Erro ao carregar instâncias:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [getInstances, getProjects]);

    // Função para obter informações do projeto
    const getProjectInfo = (projectId) => {
        if (!projectId) return { name: 'N/A', code: 'N/A' };
        const project = projects.find(p => p.id === projectId);
        return project ? { name: project.name, code: project.code } : { name: 'Projeto não encontrado', code: 'N/A' };
    };

    // Função para determinar o status da instância
    const getInstanceStatus = (instance) => {
        // Você pode ajustar essa lógica baseado nos campos reais da sua API
        if (instance.state === 'open' || instance.status === 'connected') {
            return { status: 'connected', label: 'Conectada', class: 'status-connected' };
        } else if (instance.state === 'close' || instance.status === 'disconnected') {
            return { status: 'disconnected', label: 'Desconectada', class: 'status-disconnected' };
        } else {
            return { status: 'unknown', label: 'Desconhecido', class: 'status-unknown' };
        }
    };

    // Função para lidar com ordenação
    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    // Função para ordenar as instâncias
    const sortedInstances = React.useMemo(() => {
        let sortableInstances = [...instances];
        if (sortConfig.key) {
            sortableInstances.sort((a, b) => {
                let aValue = a[sortConfig.key];
                let bValue = b[sortConfig.key];

                // Tratamento especial para diferentes tipos de dados
                if (sortConfig.key === 'projectInfo') {
                    aValue = getProjectInfo(a.projectId).name;
                    bValue = getProjectInfo(b.projectId).name;
                } else if (sortConfig.key === 'status') {
                    aValue = getInstanceStatus(a).label;
                    bValue = getInstanceStatus(b).label;
                } else if (typeof aValue === 'string') {
                    aValue = aValue.toLowerCase();
                    bValue = bValue.toLowerCase();
                }

                if (aValue < bValue) {
                    return sortConfig.direction === 'asc' ? -1 : 1;
                }
                if (aValue > bValue) {
                    return sortConfig.direction === 'asc' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableInstances;
    }, [instances, sortConfig, projects]);

    // Função para obter o ícone de ordenação
    const getSortIcon = (columnKey) => {
        if (sortConfig.key !== columnKey) {
            return '↕️';
        }
        return sortConfig.direction === 'asc' ? '↑' : '↓';
    };

    const handleConnectNew = () => {
        navigate('/connect');
    };

    const handleRefresh = async () => {
        try {
            setLoading(true);
            const data = await getInstances();
            setInstances(Array.isArray(data) ? data : []);
            setError(null);
        } catch (err) {
            setError('Falha ao atualizar instâncias');
            debugError('Erro ao atualizar instâncias:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateInstance = async (e) => {
        e.preventDefault();
        
        if (!instanceName.trim()) {
            setError('Nome da instância é obrigatório');
            return;
        }

        if (!number.trim()) {
            setError('Número é obrigatório');
            return;
        }

        try {
            setCreating(true);
            setError(null);

            await createInstance(instanceName, number);

            // Sucesso - fechar modal e atualizar lista
            setShowCreateModal(false);
            setInstanceName('');
            setNumber('');
            await handleRefresh();
            
        } catch (err) {
            setError(`Erro ao criar instância: ${err.message}`);
            debugError('Erro ao criar instância:', err);
        } finally {
            setCreating(false);
        }
    };

    const handleWebhookClick = async (instance) => {
        setSelectedInstance(instance);
        setWebhookUrl('');
        setCurrentWebhookUrl('');
        setShowWebhookModal(true);
        setError(null);

        // Buscar webhook atual se existir
        if (instance.token) {
            try {
                const webhookData = await getWebhook(instance.instanceName, instance.token);
                console.log('Resposta do webhook:', webhookData); // Debug
                
                // Se a resposta é uma string (texto puro)
                if (typeof webhookData === 'string' && webhookData.trim()) {
                    setWebhookUrl(webhookData.trim());
                    setCurrentWebhookUrl(webhookData.trim());
                }
                // Se a resposta é um objeto com webhookUrl
                else if (webhookData && webhookData.webhookUrl) {
                    setWebhookUrl(webhookData.webhookUrl);
                    setCurrentWebhookUrl(webhookData.webhookUrl);
                }
            } catch (err) {
                // Se não encontrar webhook ou der erro, apenas continua sem preencher
                console.log('Nenhum webhook configurado ou erro ao buscar:', err.message);
            }
        }
    };

    const handleSetWebhook = async () => {
        if (!webhookUrl.trim()) {
            setError('URL do webhook é obrigatória');
            return;
        }

        if (!selectedInstance?.token) {
            setError('Token da instância não encontrado');
            return;
        }

        setSettingWebhook(true);
        setError('');

        try {
            await setWebhook(selectedInstance.instanceName, webhookUrl, selectedInstance.token);
            
            setShowWebhookModal(false);
            setWebhookUrl('');
            setSelectedInstance(null);
            // Opcional: atualizar a lista se necessário
            // await handleRefresh();
        } catch (err) {
            setError(`Erro ao configurar webhook: ${err.message}`);
        } finally {
            setSettingWebhook(false);
        }
    };

    if (loading) {
        return (
            <div className="instances-container">
                <div className="loading-message">Carregando instâncias...</div>
            </div>
        );
    }

    return (
        <div className="instances-container">
            <div className="header-container">
                <h2>Instâncias WhatsApp</h2>
                <div className="header-actions">
                    <button onClick={handleRefresh} className="refresh-button" title="Atualizar">
                        🔄 Atualizar
                    </button>
                    <button onClick={() => setShowCreateModal(true)} className="add-instance-button">
                        ➕ Criar Instância
                    </button>
                </div>
            </div>

            {error && <div className="error-message">{error}</div>}

            {instances.length === 0 ? (
                <div className="empty-state">
                    <p>Nenhuma instância encontrada.</p>
                    <button onClick={() => setShowCreateModal(true)} className="add-instance-button">
                        Criar primeira instância
                    </button>
                </div>
            ) : (
                <div className="table-container">
                    <table className="instances-table">
                        <thead>
                            <tr>
                                <th 
                                    className="sortable-header" 
                                    onClick={() => handleSort('instanceName')}
                                >
                                    Nome da Instância {getSortIcon('instanceName')}
                                </th>
                                <th 
                                    className="sortable-header" 
                                    onClick={() => handleSort('owner')}
                                >
                                    Número {getSortIcon('owner')}
                                </th>
                                <th 
                                    className="sortable-header" 
                                    onClick={() => handleSort('profileName')}
                                >
                                    Nome do Perfil {getSortIcon('profileName')}
                                </th>
                                <th>Token</th>
                                <th 
                                    className="sortable-header" 
                                    onClick={() => handleSort('projectInfo')}
                                >
                                    Projeto {getSortIcon('projectInfo')}
                                </th>
                                <th 
                                    className="sortable-header" 
                                    onClick={() => handleSort('status')}
                                >
                                    Status {getSortIcon('status')}
                                </th>
                                <th>Última Atividade</th>
                                {userData?.isAdmin && <th>Ações</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {sortedInstances.map((instance, index) => {
                                const projectInfo = getProjectInfo(instance.projectId);
                                const statusInfo = getInstanceStatus(instance);
                                
                                return (
                                    <tr key={instance.id || index}>
                                        <td>
                                            <div className="instance-name">
                                                {instance.instanceName || 'N/A'}
                                            </div>
                                        </td>
                                        <td>
                                            <div className="instance-number">
                                                {instance.owner || 'N/A'}
                                            </div>
                                        </td>
                                        <td>
                                            <div className="profile-info">
                                                {instance.profileName || 'N/A'}
                                            </div>
                                        </td>
                                        <td>
                                            <div className="token-info">
                                                {instance.token ? (
                                                    <span className="token-display" title={instance.token}>
                                                        {instance.token.substring(0, 12)}...
                                                    </span>
                                                ) : (
                                                    <span className="token-empty">N/A</span>
                                                )}
                                            </div>
                                        </td>
                                        <td>
                                            <div className="project-info">
                                                <div className="project-name">{projectInfo.name}</div>
                                                {projectInfo.code !== 'N/A' && (
                                                    <div className="project-code">({projectInfo.code})</div>
                                                )}
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`status-badge ${statusInfo.class}`}>
                                                {statusInfo.label}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="last-activity">
                                                {instance.lastActivity 
                                                    ? new Date(instance.lastActivity).toLocaleString('pt-BR')
                                                    : instance.updatedAt 
                                                        ? new Date(instance.updatedAt).toLocaleString('pt-BR')
                                                        : 'N/A'
                                                }
                                            </div>
                                        </td>
                                        {userData?.isAdmin && (
                                            <td>
                                                <div className="instance-actions">
                                                    {statusInfo.status === 'connected' ? (
                                                        <button 
                                                            className="action-button disconnect-button"
                                                            title="Desconectar instância"
                                                        >
                                                            🔌 Desconectar
                                                        </button>
                                                    ) : (
                                                        <button 
                                                            className="action-button reconnect-button"
                                                            title="Reconectar instância"
                                                        >
                                                            🔄 Reconectar
                                                        </button>
                                                    )}
                                                    <button 
                                                        className="action-button webhook-button"
                                                        onClick={() => handleWebhookClick(instance)}
                                                        title="Configurar webhook"
                                                    >
                                                        🔗 Webhook
                                                    </button>
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal de Criação de Instância */}
            {showCreateModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>Criar Nova Instância</h3>
                            <button 
                                className="close-btn"
                                onClick={() => {
                                    setShowCreateModal(false);
                                    setInstanceName('');
                                    setNumber('');
                                    setError(null);
                                }}
                            >
                                ×
                            </button>
                        </div>
                        <form onSubmit={handleCreateInstance} className="instance-form">
                            <div className="form-group">
                                <label htmlFor="instanceName">Nome da Instância:</label>
                                <input
                                    type="text"
                                    id="instanceName"
                                    value={instanceName}
                                    onChange={(e) => setInstanceName(e.target.value)}
                                    placeholder="Digite o nome da instância"
                                    required
                                    disabled={creating}
                                />
                                <small className="form-help">
                                    O nome deve ser único e será usado para identificar a instância.
                                </small>
                            </div>
                            
                            <div className="form-group">
                                <label htmlFor="number">Número do WhatsApp:</label>
                                <input
                                    type="text"
                                    id="number"
                                    value={number}
                                    onChange={(e) => setNumber(e.target.value)}
                                    placeholder="Ex: 5511999999999"
                                    required
                                    disabled={creating}
                                />
                                <small className="form-help">
                                    Digite o número completo com código do país (ex: 5511999999999).
                                </small>
                            </div>
                            
                            {error && <div className="error-message">{error}</div>}
                            
                            <div className="form-actions">
                                <button 
                                    type="button" 
                                    onClick={() => {
                                        setShowCreateModal(false);
                                        setInstanceName('');
                                        setNumber('');
                                        setError(null);
                                    }}
                                    disabled={creating}
                                >
                                    Cancelar
                                </button>
                                <button 
                                    type="submit" 
                                    className="btn-primary"
                                    disabled={creating || !instanceName.trim() || !number.trim()}
                                >
                                    {creating ? '⏳ Criando...' : '✅ Criar Instância'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal de Configuração de Webhook */}
            {showWebhookModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>Configurar Webhook</h3>
                            <button 
                                className="close-btn"
                                onClick={() => {
                                    setShowWebhookModal(false);
                                    setWebhookUrl('');
                                    setSelectedInstance(null);
                                    setError(null);
                                }}
                            >
                                ×
                            </button>
                        </div>
                        <div className="instance-form">
                            <div className="webhook-instance-info">
                                <h4>Informações da Instância</h4>
                                <p><strong>Nome:</strong> <span className="instance-name">{selectedInstance?.instanceName}</span></p>
                                <p><strong>Número:</strong> <span className="instance-number">{selectedInstance?.owner || 'N/A'}</span></p>
                                <p><strong>Token:</strong> <span className="token-display">{selectedInstance?.token ? `${selectedInstance.token.substring(0, 12)}...` : 'N/A'}</span></p>
                            </div>
                            
                            <div className="form-group">
                                <label htmlFor="webhookUrl">URL do Webhook:</label>
                                {currentWebhookUrl && (
                                    <div className="current-webhook-info">
                                        <span className="webhook-status">✅ Webhook configurado</span>
                                        <small>URL atual: {currentWebhookUrl}</small>
                                    </div>
                                )}
                                <input
                                    type="url"
                                    id="webhookUrl"
                                    value={webhookUrl}
                                    onChange={(e) => setWebhookUrl(e.target.value)}
                                    placeholder="https://exemplo.com/webhook"
                                    required
                                    disabled={settingWebhook}
                                />
                                <small className="form-help">
                                    {currentWebhookUrl 
                                        ? "Modifique a URL para atualizar o webhook ou mantenha a atual."
                                        : "Digite a URL completa onde os eventos da instância serão enviados."
                                    }
                                </small>
                            </div>
                            
                            {error && <div className="error-message">{error}</div>}
                            
                            <div className="form-actions">
                                <button 
                                    type="button" 
                                    onClick={() => {
                                        setShowWebhookModal(false);
                                        setWebhookUrl('');
                                        setSelectedInstance(null);
                                        setError(null);
                                    }}
                                    disabled={settingWebhook}
                                >
                                    Cancelar
                                </button>
                                <button 
                                    type="button" 
                                    className="btn-primary"
                                    onClick={handleSetWebhook}
                                    disabled={settingWebhook || !webhookUrl.trim()}
                                >
                                    {settingWebhook ? '⏳ Configurando...' : '✅ Salvar Webhook'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Instances;
