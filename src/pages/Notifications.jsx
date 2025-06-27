import React, { useState, useEffect } from 'react';
import { useApi } from '../contexts/ApiContext';
import './Notifications.css';

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        type: 0,
        projectId: 0,
        message: '',
        mediaFile: '',
        audioFile: '',
        regex: '',
        active: true
    });
    const [editingId, setEditingId] = useState(null);
    const { getNotifications, createNotification, deleteNotification, updateNotification } = useApi();

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const token = localStorage.getItem('authToken');
                console.log('Token de autenticação:', token ? 'Presente' : 'Ausente');
                
                const data = await getNotifications();
                console.log('Dados recebidos da API:', data);
                setNotifications(Array.isArray(data) ? data : []);
                setLoading(false);
            } catch (err) {
                console.error('Erro ao carregar notificações:', err);
                setError(`Erro ao carregar notificações: ${err.message || 'Erro desconhecido'}`);
                setLoading(false);
            }
        };

        fetchNotifications();
    }, [getNotifications]);

    const handleDelete = async (id) => {
        try {
            await deleteNotification(id);
            setNotifications(notifications.filter(notification => notification.id !== id));
        } catch (err) {
            console.error('Erro ao deletar notificação:', err);
            setError('Erro ao deletar notificação');
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await updateNotification(editingId, formData);
                const updatedNotifications = notifications.map(notification =>
                    notification.id === editingId ? { ...notification, ...formData } : notification
                );
                setNotifications(updatedNotifications);
                setEditingId(null);
            } else {
                const newNotification = await createNotification(formData);
                setNotifications([...notifications, newNotification]);
            }
            setFormData({
                type: 0,
                projectId: 0,
                message: '',
                mediaFile: '',
                audioFile: '',
                regex: '',
                active: true
            });
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
            active: notification.active
        });
        setEditingId(notification.id);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    if (loading) return <div>Carregando...</div>;
    if (error) return <div className="error-message">{error}</div>;

    return (
        <div className="notifications-container">
            <h2>Notificações</h2>
            
            <form onSubmit={handleUpdate} className="notification-form">
                <div className="form-group">
                    <label htmlFor="type">Tipo</label>
                    <input
                        type="number"
                        id="type"
                        name="type"
                        value={formData.type}
                        onChange={handleInputChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="projectId">ID do Projeto</label>
                    <input
                        type="number"
                        id="projectId"
                        name="projectId"
                        value={formData.projectId}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                
                <div className="form-group">
                    <label htmlFor="message">Mensagem</label>
                    <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="mediaFile">Arquivo de Mídia</label>
                    <input
                        type="text"
                        id="mediaFile"
                        name="mediaFile"
                        value={formData.mediaFile}
                        onChange={handleInputChange}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="audioFile">Arquivo de Áudio</label>
                    <input
                        type="text"
                        id="audioFile"
                        name="audioFile"
                        value={formData.audioFile}
                        onChange={handleInputChange}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="regex">Regex</label>
                    <input
                        type="text"
                        id="regex"
                        name="regex"
                        value={formData.regex}
                        onChange={handleInputChange}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="active">
                        <input
                            type="checkbox"
                            id="active"
                            name="active"
                            checked={formData.active}
                            onChange={(e) => setFormData(prev => ({ ...prev, active: e.target.checked }))}
                        />
                        Ativo
                    </label>
                </div>
                
                <button type="submit" className="submit-button">
                    {editingId ? 'Atualizar' : 'Criar'} Notificação
                </button>
            </form>

            <div className="notifications-list">
                {notifications.map(notification => {
                    if (!notification || typeof notification !== 'object') return null;
                    
                    return (
                        <div key={notification.id || 'temp-key'} className="notification-card">
                            <div className="notification-header">
                                <h3>Notificação #{notification.id}</h3>
                                <span className={`status ${notification.active ? 'active' : 'inactive'}`}>
                                    {notification.active ? 'Ativo' : 'Inativo'}
                                </span>
                            </div>
                            <div className="notification-content">
                                <p><strong>Tipo:</strong> {notification.type}</p>
                                <p><strong>Projeto ID:</strong> {notification.projectId}</p>
                                <p><strong>Mensagem:</strong> {notification.message || 'Sem mensagem'}</p>
                                {notification.mediaFile && <p><strong>Arquivo de Mídia:</strong> {notification.mediaFile}</p>}
                                {notification.audioFile && <p><strong>Arquivo de Áudio:</strong> {notification.audioFile}</p>}
                                {notification.regex && <p><strong>Regex:</strong> {notification.regex}</p>}
                            </div>
                            <div className="notification-footer">
                                <span className="timestamp">
                                    {notification.createdAt ? new Date(notification.createdAt).toLocaleString() : 'Data não disponível'}
                                </span>
                                <div className="notification-actions">
                                    <button 
                                        onClick={() => handleEdit(notification)}
                                        className="action-button edit"
                                    >
                                        Editar
                                    </button>
                                    <button 
                                        onClick={() => notification.id && handleDelete(notification.id)}
                                        className="action-button delete"
                                    >
                                        Deletar
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Notifications;