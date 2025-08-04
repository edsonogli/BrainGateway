import React from 'react';
import { useApi } from '../contexts/ApiContext';

const ScheduleForm = ({ onScheduleCreated, editingSchedule, onScheduleUpdated, onCancelEdit }) => {
    const { createSchedule, updateSchedule, getNotifications } = useApi();
    const [notifications, setNotifications] = React.useState([]);
    const [formData, setFormData] = React.useState({
        notificationId: '',
        number: '',
        executeAt: '',
        params: ''
    });

    // Buscar notificações disponíveis
    React.useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const data = await getNotifications();
                setNotifications(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error('Erro ao carregar notificações:', error);
                setNotifications([]);
            }
        };
        fetchNotifications();
    }, [getNotifications]);

    React.useEffect(() => {
        if (editingSchedule) {
            setFormData({
                notificationId: editingSchedule.notificationId || '',
                number: editingSchedule.number || '',
                executeAt: editingSchedule.executeAt ? new Date(editingSchedule.executeAt).toISOString().slice(0, 16) : '',
                params: editingSchedule.params ? JSON.stringify(editingSchedule.params) : ''
            });
        } else {
            setFormData({
                notificationId: '',
                number: '',
                executeAt: '',
                params: ''
            });
        }
    }, [editingSchedule]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const scheduleData = {
                ...formData,
                executed: false, // Valor padrão
                error: '', // Valor padrão
                params: formData.params ? JSON.parse(formData.params) : null
            };

            if (editingSchedule) {
                await updateSchedule(editingSchedule.id, scheduleData);
                onScheduleUpdated();
            } else {
                await createSchedule(scheduleData);
                onScheduleCreated();
            }

            setFormData({
                notificationId: '',
                number: '',
                executeAt: '',
                params: ''
            });
        } catch (error) {
            console.error('Erro ao salvar agendamento:', error);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };
    return (
        <div className="form-section">
            <form onSubmit={handleSubmit} className="schedule-form">
            <div className="form-group">
                <label htmlFor="notificationId">Notificação:</label>
                <select
                    id="notificationId"
                    name="notificationId"
                    value={formData.notificationId}
                    onChange={handleChange}
                    required
                >
                    <option value="">Selecione uma notificação</option>
                    {notifications.map(notification => (
                        <option key={notification.id} value={notification.id}>
                            {notification.id} - {notification.name || 'Sem nome'}
                        </option>
                    ))}
                </select>
            </div>

            <div className="form-group">
                <label htmlFor="number">Número:</label>
                <input
                    type="text"
                    id="number"
                    name="number"
                    value={formData.number}
                    onChange={handleChange}
                    required
                />
            </div>
            
            <div className="form-group">
                <label htmlFor="executeAt">Data de Execução:</label>
                <input
                    type="datetime-local"
                    id="executeAt"
                    name="executeAt"
                    value={formData.executeAt}
                    onChange={handleChange}
                    required
                />
            </div>

            <div className="form-group">
                <label htmlFor="params">Texto para enviar ou Parâmetros (JSON):</label>
                <textarea
                    id="params"
                    name="params"
                    value={formData.params}
                    onChange={handleChange}
                    placeholder='Exemplo: "Olá, como você está?" ou {"nome": "João", "idade": 30}'
                />
            </div>
            
            <div className="form-actions">
                <button type="submit" className="submit-button">
                    {editingSchedule ? 'Atualizar' : 'Criar'}
                </button>
                {editingSchedule && (
                    <button type="button" className="cancel-button" onClick={onCancelEdit}>
                        Cancelar
                    </button>
                )}
            </div>
            </form>
        </div>
    );
};

export default ScheduleForm;