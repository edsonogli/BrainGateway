import React, { useState, useEffect } from 'react';
import { useApi } from '../contexts/ApiContext';
import { debugError } from '../config';
import './Dashboard.css';

const Dashboard = () => {
    const { getDashboard, isLoading } = useApi();
    const [stats, setStats] = useState({
        totalScheduledMessagesToday: 0,
        totalMessagesSentToday: 0,
        totalSchedulesSentToday: 0,
        totalActiveContacts: 0,
        totalInactiveContacts: 0
    });
    const [error, setError] = useState(null);

    useEffect(() => {
        let isMounted = true;
        const fetchDashboardStats = async () => {
            try {
                setError(null);
                const data = await getDashboard();
                if (data && isMounted) {
                    setStats(data);
                }
            } catch (error) {
                if (isMounted) {
                    debugError('Erro ao carregar estatísticas:', error);
                    setError('Não foi possível carregar as estatísticas. Tente novamente mais tarde.');
                }
            }
        };

        fetchDashboardStats();
        const interval = setInterval(fetchDashboardStats, 5 * 60 * 1000);
        return () => {
            isMounted = false;
            clearInterval(interval);
        };
    }, [getDashboard]);

    if (isLoading) {
        return (
            <div className="dashboard-loading">
                <div className="loading-spinner"></div>
                <p>Carregando estatísticas...</p>
            </div>
        );
    }

    return (
        <div className="dashboard-container">
            <h1 className="dashboard-title">Visão Geral</h1>
            
            <div className="stats-grid">
                
                <div className="stat-card schedules-sent">
                    <div className="stat-icon">✅</div>
                    <div className="stat-content">
                        <h3>Mensagens Enviadas</h3>
                        <div className="stat-value">{stats.totalMessagesSentToday}</div>
                        <div className="stat-subtitle">Total de hoje</div>
                    </div>
                </div>

                <div className="stat-card schedules">
                    <div className="stat-icon">📅</div>
                    <div className="stat-content">
                        <h3>Agendamentos para Hoje</h3>
                        <div className="stat-value">{stats.totalScheduledMessagesToday}</div>
                        <div className="stat-subtitle">Total agendado</div>
                    </div>
                </div>

                <div className="stat-card schedules-sent">
                    <div className="stat-icon">✅</div>
                    <div className="stat-content">
                        <h3>Agendamentos Enviados</h3>
                        <div className="stat-value">{stats.totalSchedulesSentToday}</div>
                        <div className="stat-subtitle">Total de hoje</div>
                    </div>
                </div>

                <div className="stat-card contacts-active">
                    <div className="stat-icon">👥</div>
                    <div className="stat-content">
                        <h3>Contatos Ativos</h3>
                        <div className="stat-value">{stats.totalActiveContacts}</div>
                        <div className="stat-subtitle">Total atual</div>
                    </div>
                </div>

                <div className="stat-card contacts-inactive">
                    <div className="stat-icon">🚫</div>
                    <div className="stat-content">
                        <h3>Contatos Inativos</h3>
                        <div className="stat-value">{stats.totalInactiveContacts}</div>
                        <div className="stat-subtitle">Total atual</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
