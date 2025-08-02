import React, { useEffect, useState } from 'react';
import { useApi } from '../contexts/ApiContext';
import { useAuth } from '../components/AuthContext';
import { useNavigate } from 'react-router-dom';
import { debugError } from '../config';
import './Instances.css';

const Instances = () => {
    const { getInstances, getProjects } = useApi();
    const { userData } = useAuth();
    const navigate = useNavigate();
    const [instances, setInstances] = useState([]);
    const [projects, setProjects] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

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
                    <button onClick={handleConnectNew} className="add-instance-button">
                        ➕ Nova Instância
                    </button>
                </div>
            </div>

            {error && <div className="error-message">{error}</div>}

            {instances.length === 0 ? (
                <div className="empty-state">
                    <p>Nenhuma instância encontrada.</p>
                    <button onClick={handleConnectNew} className="add-instance-button">
                        Conectar primeira instância
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
        </div>
    );
};

export default Instances;
