import React, { useState, useEffect } from 'react';
import { useApi } from '../contexts/ApiContext';
import ScheduleForm from '../components/ScheduleForm';
import ScheduleList from '../components/ScheduleList';
import './Schedules.css';

const Schedules = () => {
    const [schedules, setSchedules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingSchedule, setEditingSchedule] = useState(null);
    const [activeTab, setActiveTab] = useState('list'); // 'list' ou 'create'
    const { getSchedules, createSchedule, deleteSchedule, updateSchedule } = useApi();

    const fetchSchedules = async () => {
        try {
            const data = await getSchedules();
            setSchedules(Array.isArray(data) ? data : []);
            setLoading(false);
        } catch (err) {
            console.error('Erro ao carregar agendamentos:', err);
            setError(`Erro ao carregar agendamentos: ${err.message || 'Erro desconhecido'}`);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSchedules();
    }, []);

    const handleDelete = async (id) => {
        try {
            await deleteSchedule(id);
            await fetchSchedules();
        } catch (err) {
            console.error('Erro ao deletar agendamento:', err);
            setError('Erro ao deletar agendamento');
        }
    };

    const handleScheduleCreated = async () => {
        await fetchSchedules();
        setActiveTab('list'); // Volta para a lista após criar
    };

    const handleScheduleUpdated = async () => {
        await fetchSchedules();
        setEditingSchedule(null);
        setActiveTab('list'); // Volta para a lista após editar
    };

    const handleEdit = (schedule) => {
        setEditingSchedule(schedule);
        setActiveTab('create'); // Muda para a aba de criação ao editar
    };

    const handleCancelEdit = () => {
        setEditingSchedule(null);
        setActiveTab('list'); // Volta para a lista ao cancelar edição
    };

    if (loading) return <div>Carregando...</div>;
    if (error) return <div className="error-message">{error}</div>;

    return (
        <div className="schedules-container">
            <div className="schedules-header">
                <h2>Agendamentos</h2>
                <div className="tab-buttons">
                    <button 
                        className={`tab-button ${activeTab === 'list' ? 'active' : ''}`}
                        onClick={() => setActiveTab('list')}
                    >
                        Visualizar Agendamentos
                    </button>
                    <button 
                        className={`tab-button ${activeTab === 'create' ? 'active' : ''}`}
                        onClick={() => setActiveTab('create')}
                    >
                        {editingSchedule ? 'Editar Agendamento' : 'Criar Agendamento'}
                    </button>
                </div>
            </div>
            
            <div className="schedules-content">
                {activeTab === 'create' ? (
                    <ScheduleForm
                        onScheduleCreated={handleScheduleCreated}
                        editingSchedule={editingSchedule}
                        onScheduleUpdated={handleScheduleUpdated}
                        onCancelEdit={handleCancelEdit}
                    />
                ) : (
                    <ScheduleList
                        schedules={schedules}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                    />
                )}
            </div>
        </div>
    );
};

export default Schedules;