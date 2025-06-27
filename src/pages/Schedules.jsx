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
    };

    const handleScheduleUpdated = async () => {
        await fetchSchedules();
        setEditingSchedule(null);
    };

    const handleEdit = (schedule) => {
        setEditingSchedule(schedule);
    };

    const handleCancelEdit = () => {
        setEditingSchedule(null);
    };

    if (loading) return <div>Carregando...</div>;
    if (error) return <div className="error-message">{error}</div>;

    return (
        <div className="schedules-container">
            <h2>Agendamentos</h2>
            
            <div className="schedules-layout">
                <ScheduleForm
                    onScheduleCreated={handleScheduleCreated}
                    editingSchedule={editingSchedule}
                    onScheduleUpdated={handleScheduleUpdated}
                    onCancelEdit={handleCancelEdit}
                />

                <ScheduleList
                    schedules={schedules}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />
            </div>
        </div>
    );
};

export default Schedules;