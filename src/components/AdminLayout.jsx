// src/components/AdminLayout.jsx
import React, { useState, useEffect } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useApi } from '../contexts/ApiContext';
import LoadingSpinner from './LoadingSpinner';
import ochatproLogo from '../assets/logo.png';
import './AdminLayout.css';

const AdminLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { isLoading } = useApi();
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        console.log('AdminLayout - Token atual:', token ? 'Presente' : 'Ausente');
        
        if (!token) {
            console.warn('Token não encontrado, redirecionando para login');
            navigate('/login');
        }
    }, [navigate]);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    return (
        <div className="admin-container">
            {/* Botão de menu para telas pequenas */}
            <button className="menu-toggle" onClick={toggleSidebar}>
                ☰
            </button>

            <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    {/*<img src={ochatproLogo} alt="OChatPro Logo" className="sidebar-logo" />*/}
                     <h1>OChatPro</h1>
                </div>
                <nav className="sidebar-nav">
                    <Link to="/admin/dashboard" onClick={toggleSidebar}>
                        <span className="nav-icon">📊</span>
                        Dashboard
                    </Link>
                    <Link to="/admin/profile" onClick={toggleSidebar}>
                        <span className="nav-icon">👤</span>
                        Profile
                    </Link>
                    <Link to="/admin/instances" onClick={toggleSidebar}>
                        <span className="nav-icon">📱</span>
                        Instâncias
                    </Link>
                    <Link to="/admin/instances/connect" onClick={toggleSidebar}>
                        <span className="nav-icon">🔗</span>
                        Conectar Nova Instância
                    </Link>
                    <Link to="/admin/assistants" onClick={toggleSidebar}>
                        <span className="nav-icon">🤖</span>
                        Assistentes
                    </Link>
                    <Link to="/admin/settings" onClick={toggleSidebar}>
                        <span className="nav-icon">⚙️</span>
                        Settings
                    </Link>
                    <Link to="/admin/projects" onClick={toggleSidebar}>
                        <span className="nav-icon">📁</span>
                        Projetos
                    </Link>
                    <Link to="/admin/contacts" onClick={toggleSidebar}>
                        <span className="nav-icon">👥</span>
                        Contatos
                    </Link>
                    <Link to="/admin/chats" onClick={toggleSidebar}>
                        <span className="nav-icon">💬</span>
                        Chats
                    </Link>
                    <Link to="/admin/messages" onClick={toggleSidebar}>
                        <span className="nav-icon">✉️</span>
                        Mensagens
                    </Link>
                    <Link to="/admin/campaings" onClick={toggleSidebar}>
                        <span className="nav-icon">📢</span>
                        Campanhas
                    </Link>
                    <Link to="/admin/notifications" onClick={toggleSidebar}>
                        <span className="nav-icon">🔔</span>
                        Notificações
                    </Link>
                    <Link to="/admin/schedules" onClick={toggleSidebar}>
                        <span className="nav-icon">📅</span>
                        Agendamentos
                    </Link>
                    <Link to="/admin/logs" onClick={toggleSidebar}>
                        <span className="nav-icon">📋</span>
                        Logs
                    </Link>
                </nav>
            </aside>

            <main className="main-content">
                <div className="header-profile">
                    <div className="profile-info">
                        <img src="https://ui-avatars.com/api/?name=Admin&background=2e7d32&color=fff" alt="Profile" className="profile-avatar" />
                        <span className="profile-name">Admin</span>
                    </div>
                    <button 
                        className="logout-button" 
                        onClick={() => {
                            localStorage.removeItem('authToken');
                            navigate('/login');
                        }}
                    >
                        <span className="logout-icon">🚪</span>
                        Sair
                    </button>
                </div>
                {/*<header className="header">
                    <div className="header-left">
                        <h2>Admin OChatPro</h2>
                    </div>
                    <div className="header-right">
                        <span>Usuário</span>
                        <img src="https://cdn.vectorstock.com/i/500p/21/23/default-user-icon-person-avatar-vector-47852123.jpg" alt="User" className="user-avatar" />
                    </div>
                </header>
                */}

                <div className="content-area">
                    {isLoading && <div className="loading-overlay"><LoadingSpinner /></div>}
                    <Outlet /> {/* Renderiza as sub-rotas */}
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
