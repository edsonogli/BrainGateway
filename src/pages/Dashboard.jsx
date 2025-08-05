import React, { useState, useEffect } from 'react';
import { useApi } from '../contexts/ApiContext';
import { debugError, debugLog } from '../config';
import TermsModal from '../components/TermsModal';
import './Dashboard.css';

const Dashboard = () => {
    const { getDashboard, checkTermsAcceptance, acceptTerms, isLoading } = useApi();
    const [stats, setStats] = useState({
        totalScheduledMessagesToday: 0,
        totalMessagesSentToday: 0,
        totalSchedulesSentToday: 0,
        totalActiveContacts: 0,
        totalInactiveContacts: 0,
        totalIntegrationsActive: 0,
        totalIntegrationsInactive: 0
    });
    const [error, setError] = useState(null);
    const [showTermsModal, setShowTermsModal] = useState(false);
    const [termsVersion, setTermsVersion] = useState(null);

    useEffect(() => {
        let isMounted = true;
        
        const checkTermsAndFetchData = async () => {
            try {
                setError(null);
                
                // Verificar status dos termos primeiro
                debugLog('Verificando status dos termos no dashboard...');
                const termsStatus = await Promise.race([
                    checkTermsAcceptance(),
                    new Promise((_, reject) => 
                        setTimeout(() => reject(new Error('Timeout na verificação de termos')), 15000)
                    )
                ]);
                
                debugLog('Status dos termos no dashboard:', termsStatus);
                
                if (termsStatus && termsStatus.requiresAcceptance && isMounted) {
                    debugLog('Usuário precisa aceitar termos, exibindo modal no dashboard');
                    setTermsVersion(termsStatus.currentTermsVersion);
                    setShowTermsModal(true);
                    return; // Não carrega dados até aceitar os termos
                }
                
                // Se não precisa aceitar termos, carrega os dados do dashboard
                const data = await getDashboard();
                if (data && isMounted) {
                    setStats(data);
                }
            } catch (error) {
                if (isMounted) {
                    debugError('Erro ao carregar dashboard:', error);
                    setError('Não foi possível carregar as informações. Tente novamente mais tarde.');
                }
            }
        };

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

        checkTermsAndFetchData();
        
        // Só configura o intervalo se não estiver mostrando o modal de termos
        let interval;
        if (!showTermsModal) {
            interval = setInterval(fetchDashboardStats, 5 * 60 * 1000);
        }
        
        return () => {
            isMounted = false;
            if (interval) {
                clearInterval(interval);
            }
        };
    }, [getDashboard, checkTermsAcceptance, showTermsModal]);

    const handleTermsAccept = async () => {
        try {
            debugLog('Aceitando termos no dashboard, versão:', termsVersion);
            
            const result = await Promise.race([
                acceptTerms(termsVersion),
                new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Timeout ao aceitar termos')), 15000)
                )
            ]);
            
            debugLog('Resultado da aceitação dos termos:', result);
            setShowTermsModal(false);
            
            // Pequeno delay para garantir que o estado seja atualizado
            setTimeout(() => {
                debugLog('Modal fechado, carregando dados do dashboard...');
                // Recarregar dados do dashboard após aceitar os termos
                window.location.reload();
            }, 500);
            
        } catch (error) {
            debugError('Erro ao aceitar termos:', error);
            setError('Erro ao aceitar os termos. Tente novamente.');
        }
    };

    const handleTermsDecline = () => {
        debugLog('Usuário recusou os termos');
        setShowTermsModal(false);
        setError('É necessário aceitar os termos para continuar usando o sistema.');
    };

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

                <div className="stat-card integrations-active">
                    <div className="stat-icon">🔗</div>
                    <div className="stat-content">
                        <h3>Integrações Ativas</h3>
                        <div className="stat-value">{stats.totalIntegrationsActive}</div>
                        <div className="stat-subtitle">Total atual</div>
                    </div>
                </div>

                <div className="stat-card integrations-inactive">
                    <div className="stat-icon">⚠️</div>
                    <div className="stat-content">
                        <h3>Integrações Inativas</h3>
                        <div className="stat-value">{stats.totalIntegrationsInactive}</div>
                        <div className="stat-subtitle">Total atual</div>
                    </div>
                </div>
            </div>
            
            {error && (
                <div className="error-message" style={{
                    position: 'fixed',
                    top: '20px',
                    right: '20px',
                    background: '#fee2e2',
                    color: '#dc2626',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    border: '1px solid #fecaca',
                    zIndex: 1000,
                    maxWidth: '400px'
                }}>
                    {error}
                </div>
            )}
            
            <TermsModal
                isOpen={showTermsModal}
                onAccept={handleTermsAccept}
                onDecline={handleTermsDecline}
            />
        </div>
    );
};

export default Dashboard;
