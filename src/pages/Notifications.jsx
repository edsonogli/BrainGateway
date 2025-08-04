import React, { useState, useEffect } from 'react';
import { useApi } from '../contexts/ApiContext';
import NotificationForm from '../components/NotificationForm';
import './Notifications.css';

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('list'); // 'list' ou 'create'
    const [formData, setFormData] = useState({
        type: 0,
        projectId: 0,
        message: '',
        mediaFile: '',
        audioFile: '',
        regex: '',
        active: true,
        afterDays: 0,
        name: ''
    });
    const [editingId, setEditingId] = useState(null);
    const { getNotifications, createNotification, deleteNotification, updateNotification } = useApi();

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const data = await getNotifications();
            setNotifications(Array.isArray(data) ? data : []);
            setLoading(false);
        } catch (err) {
            console.error('Erro ao carregar notificações:', err);
            setError(`Erro ao carregar notificações: ${err.message || 'Erro desconhecido'}`);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, [getNotifications]);

    const handleDelete = async (id) => {
        try {
            await deleteNotification(id);
            await fetchNotifications();
        } catch (err) {
            console.error('Erro ao deletar notificação:', err);
            setError('Erro ao deletar notificação');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await updateNotification(editingId, formData);
                setEditingId(null);
            } else {
                await createNotification(formData);
            }
            
            // Reset form
            setFormData({
                type: 0,
                projectId: 0,
                message: '',
                mediaFile: '',
                audioFile: '',
                regex: '',
                active: true,
                afterDays: 0,
                name: ''
            });
            
            // Refresh notifications list
            await fetchNotifications();
            
            // Navigate to list tab
            setActiveTab('list');
            
        } catch (err) {
            console.error('Erro ao salvar notificação:', err);
            setError('Erro ao salvar notificação');
        }
    };

    const handleEdit = (notification) => {
        setFormData({
            type: notification.type,
            projectId: notification.projectId,
            message: notification.message,
            mediaFile: notification.mediaFile || '',
            audioFile: notification.audioFile || '',
            regex: notification.regex || '',
            active: notification.active,
            afterDays: notification.afterDays || 0,
            name: notification.name || ''
        });
        setEditingId(notification.id);
        setActiveTab('create');
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleCancel = () => {
        setEditingId(null);
        setFormData({
            type: 0,
            projectId: 0,
            message: '',
            mediaFile: '',
            audioFile: '',
            regex: '',
            active: true,
            afterDays: 0,
            name: ''
        });
        setActiveTab('list');
    };

    if (loading) return <div className="loading">Carregando...</div>;
    if (error) return <div className="error-message">{error}</div>;

    return (
        <div className="notifications-container">
            <h2>Notificações</h2>
            
            <div className="tabs">
                <button 
                    className={`tab ${activeTab === 'list' ? 'active' : ''}`}
                    onClick={() => setActiveTab('list')}
                >
                    Lista de Notificações
                </button>
                <button 
                    className={`tab ${activeTab === 'create' ? 'active' : ''}`}
                    onClick={() => setActiveTab('create')}
                >
                    {editingId ? 'Editar Notificação' : 'Criar Notificação'}
                </button>
            </div>

            <div className="tab-content">
                {activeTab === 'create' ? (
                    <NotificationForm
                        formData={formData}
                        onInputChange={handleInputChange}
                        onSubmit={handleSubmit}
                        editingId={editingId}
                        onCancel={handleCancel}
                    />
                ) : (
                    <div className="notifications-list">
                        <div className="list-header">
                            <h3>Lista de Notificações</h3>
                            <button 
                                className="btn btn-primary"
                                onClick={() => setActiveTab('create')}
                            >
                                Nova Notificação
                            </button>
                        </div>
                        
                        {notifications.length === 0 ? (
                            <div className="empty-state">
                                <p>Nenhuma notificação encontrada.</p>
                                <button 
                                    className="btn btn-primary"
                                    onClick={() => setActiveTab('create')}
                                >
                                    Criar primeira notificação
                                </button>
                            </div>
                        ) : (
                            <div className="notifications-grid">
                                {notifications.map(notification => (
                                    <div key={notification.id} className="notification-card">
                                        <div className="card-header">
                                            <h4>{notification.name || `Notificação ${notification.id}`}</h4>
                                            <div className="card-actions">
                                                <button 
                                                    className="btn btn-edit"
                                                    onClick={() => handleEdit(notification)}
                                                >
                                                    Editar
                                                </button>
                                                <button 
                                                    className="btn btn-delete"
                                                    onClick={() => handleDelete(notification.id)}
                                                >
                                                    Excluir
                                                </button>
                                            </div>
                                        </div>
                                        <div className="card-content">
                                            <div className="info-row">
                                                <span className="label">ID:</span>
                                                <span className="value">{notification.id}</span>
                                            </div>
                                            <div className="info-row">
                                                <span className="label">Tipo:</span>
                                                <span className="value">{notification.type}</span>
                                            </div>
                                            <div className="info-row">
                                                <span className="label">Projeto:</span>
                                                <span className="value">{notification.projectId}</span>
                                            </div>
                                            <div className="info-row">
                                                <span className="label">Dias Após:</span>
                                                <span className="value">{notification.afterDays}</span>
                                            </div>
                                            <div className="info-row">
                                                <span className="label">Status:</span>
                                                <span className={`status ${notification.active ? 'active' : 'inactive'}`}>
                                                    {notification.active ? 'Ativo' : 'Inativo'}
                                                </span>
                                            </div>
                                            {notification.message && (
                                                <div className="info-row">
                                                    <span className="label">Mensagem:</span>
                                                    <span className="value message">{notification.message}</span>
                                                </div>
                                            )}
                                            {notification.regex && (
                                                <div className="info-row">
                                                    <span className="label">Regex:</span>
                                                    <span className="value code">{notification.regex}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Notifications;