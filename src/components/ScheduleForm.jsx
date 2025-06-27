import React from 'react';
import { useApi } from '../contexts/ApiContext';

const ScheduleForm = ({ onScheduleCreated, editingSchedule, onScheduleUpdated, onCancelEdit }) => {
    const { createSchedule, updateSchedule } = useApi();
    const [formData, setFormData] = React.useState({
        notificationId: '',
        number: '',
        executeAt: '',
        executed: false,
        error: '',
        params: ''
    });

    React.useEffect(() => {
        if (editingSchedule) {
            setFormData({
                notificationId: editingSchedule.notificationId || '',
                number: editingSchedule.number || '',
                executeAt: editingSchedule.executeAt ? new Date(editingSchedule.executeAt).toISOString().slice(0, 16) : '',
                executed: editingSchedule.executed || false,
                error: editingSchedule.error || '',
                params: editingSchedule.params ? JSON.stringify(editingSchedule.params) : ''
            });
        } else {
            setFormData({
                notificationId: '',
                number: '',
                executeAt: '',
                executed: false,
                error: '',
                params: ''
            });
        }
    }, [editingSchedule]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const scheduleData = {
                ...formData,
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
                executed: false,
                error: '',
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
                <label htmlFor="notificationId">ID da Notificação:</label>
                <input
                    type="number"
                    id="notificationId"
                    name="notificationId"
                    value={formData.notificationId}
                    onChange={handleChange}
                    required
                />
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
                <label htmlFor="executed">Executado:</label>
                <input
                    type="checkbox"
                    id="executed"
                    name="executed"
                    checked={formData.executed}
                    onChange={handleChange}
                />
            </div>

            <div className="form-group">
                <label htmlFor="error">Erro:</label>
                <input
                    type="text"
                    id="error"
                    name="error"
                    value={formData.error}
                    onChange={handleChange}
                />
            </div>

            <div className="form-group">
                <label htmlFor="params">Parâmetros (JSON):</label>
                <textarea
                    id="params"
                    name="params"
                    value={formData.params}
                    onChange={handleChange}
                    placeholder="{}"
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