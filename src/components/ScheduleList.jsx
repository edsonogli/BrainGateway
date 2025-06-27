import React, { useState } from 'react';

const ScheduleList = ({ schedules, onEdit, onDelete }) => {
    const [filters, setFilters] = useState({
        status: 'all', // all, pending, executed, error
        dateRange: {
            start: '',
            end: ''
        },
        notificationId: '',
        number: ''
    });

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        if (name.startsWith('date')) {
            setFilters(prev => ({
                ...prev,
                dateRange: {
                    ...prev.dateRange,
                    [name.replace('date', '').toLowerCase()]: value
                }
            }));
        } else {
            setFilters(prev => ({ ...prev, [name]: value }));
        }
    };

    const filteredSchedules = schedules
        .sort((a, b) => new Date(b.executeAt) - new Date(a.executeAt))
        .filter(schedule => {
        if (!schedule || typeof schedule !== 'object') return false;

        // Filtro por status
        if (filters.status !== 'all') {
            if (filters.status === 'error' && !schedule.error) return false;
            if (filters.status === 'executed' && !schedule.executed) return false;
            if (filters.status === 'pending' && schedule.executed) return false;
        }

        // Filtro por data
        if (filters.dateRange.start && new Date(schedule.executeAt) < new Date(filters.dateRange.start)) return false;
        if (filters.dateRange.end && new Date(schedule.executeAt) > new Date(filters.dateRange.end)) return false;

        // Filtro por ID da notificação
        if (filters.notificationId && schedule.notificationId.toString() !== filters.notificationId) return false;

        // Filtro por número
        if (filters.number && !schedule.number.toLowerCase().includes(filters.number.toLowerCase())) return false;

        return true;
    });

    return (
        <div className="schedules-section">
            <div className="filters-container">
                <div className="filter-group">
                    <label htmlFor="status">Status:</label>
                    <select
                        id="status"
                        name="status"
                        value={filters.status}
                        onChange={handleFilterChange}
                    >
                        <option value="all">Todos</option>
                        <option value="pending">Pendentes</option>
                        <option value="executed">Executados</option>
                        <option value="error">Com Erro</option>
                    </select>
                </div>

                <div className="filter-group">
                    <label htmlFor="dateStart">Período:</label>
                    <input
                        type="datetime-local"
                        id="dateStart"
                        name="dateStart"
                        value={filters.dateRange.start}
                        onChange={handleFilterChange}
                        placeholder="Data inicial"
                    />
                    <input
                        type="datetime-local"
                        id="dateEnd"
                        name="dateEnd"
                        value={filters.dateRange.end}
                        onChange={handleFilterChange}
                        placeholder="Data final"
                    />
                </div>

                <div className="filter-group">
                    <label htmlFor="notificationId">ID da Notificação:</label>
                    <input
                        type="text"
                        id="notificationId"
                        name="notificationId"
                        value={filters.notificationId}
                        onChange={handleFilterChange}
                        placeholder="Filtrar por ID"
                    />
                </div>

                <div className="filter-group">
                    <label htmlFor="number">Número:</label>
                    <input
                        type="text"
                        id="number"
                        name="number"
                        value={filters.number}
                        onChange={handleFilterChange}
                        placeholder="Filtrar por número"
                    />
                </div>
            </div>

            <div className="schedules-list">
                {filteredSchedules.map(schedule => (
                    <div key={schedule.id || 'temp-key'} className="schedule-card">
                        <div className="schedule-header">
                            <h3>Agendamento #{schedule.id}</h3>
                            <div className="schedule-status">
                                <span className={`status ${schedule.executed ? 'executed' : 'pending'}`}>
                                    {schedule.executed ? 'Executado' : 'Pendente'}
                                </span>
                                {schedule.error && 
                                    <span className="status error">Erro</span>
                                }
                            </div>
                        </div>
                        <div className="schedule-content">
                            <p><strong>ID da Notificação:</strong> {schedule.notificationId}</p>
                            <p><strong>Número:</strong> {schedule.number}</p>
                            <p><strong>Data de Execução:</strong> {
                                schedule.executeAt ? 
                                new Date(schedule.executeAt).toLocaleString() : 
                                'Não definida'
                            }</p>
                            {schedule.params && <p><strong>Parâmetros:</strong> {schedule.params}</p>}
                        </div>
                        <div className="schedule-footer">
                            <span className="timestamp">
                                Criado em: {new Date(schedule.createdAt).toLocaleString()}
                            </span>
                            <div className="schedule-actions">
                                <button 
                                    onClick={() => onEdit(schedule)}
                                    className="action-button edit"
                                >
                                    Editar
                                </button>
                                <button 
                                    onClick={() => schedule.id && onDelete(schedule.id)}
                                    className="action-button delete"
                                >
                                    Deletar
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ScheduleList;