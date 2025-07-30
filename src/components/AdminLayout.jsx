// src/components/AdminLayout.jsx
import React, { useState, useEffect } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useApi } from '../contexts/ApiContext';
import LoadingSpinner from './LoadingSpinner';
import ochatproLogo from '../assets/logo.png';
import './AdminLayout.css';

const AdminLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [userData, setUserData] = useState(null);
    const { isLoading } = useApi();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        const userDataStr = localStorage.getItem('userData');
        
        if (!token) {
            console.warn('Token não encontrado, redirecionando para login');
            navigate('/login');
        } else if (userDataStr) {
            setUserData(JSON.parse(userDataStr));
        }
    }, [navigate]);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    // Lista de menus que requerem permissão de administrador
    const adminOnlyMenus = [
        '/admin/settings',
        '/admin/projects',
        '/admin/instances',
        '/admin/instances/connect'
    ];

    // Função para verificar se um menu deve ser exibido
    const shouldShowMenu = (path) => {
        if (adminOnlyMenus.includes(path)) {
            return userData?.isAdmin === true;
        }
        return true;
    };

    // Função para verificar se o link está ativo
    const isActiveLink = (path) => {
        return location.pathname === path;
    };

    return (
        <div className="admin-container">
            <button className="menu-toggle" onClick={toggleSidebar}>
                ☰
            </button>

            <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <h1>OChatPro</h1>
                </div>
                <nav className="sidebar-nav">
                    <Link 
                        to="/admin/dashboard" 
                        onClick={toggleSidebar}
                        className={isActiveLink('/admin/dashboard') ? 'active' : ''}
                    >
                        <span className="nav-icon">📊</span>
                        Dashboard
                    </Link>
                    {shouldShowMenu('/admin/instances') && (
                        <Link 
                            to="/admin/instances" 
                            onClick={toggleSidebar}
                            className={isActiveLink('/admin/instances') ? 'active' : ''}
                        >
                            <span className="nav-icon">📱</span>
                            Instâncias
                        </Link>
                    )}
                    {shouldShowMenu('/admin/instances/connect') && (
                        <Link 
                            to="/admin/instances/connect" 
                            onClick={toggleSidebar}
                            className={isActiveLink('/admin/instances/connect') ? 'active' : ''}
                        >
                            <span className="nav-icon">🔗</span>
                            Conectar Nova Instância
                        </Link>
                    )}
                    {shouldShowMenu('/admin/assistants') && (
                        <Link 
                            to="/admin/assistants" 
                            onClick={toggleSidebar}
                            className={isActiveLink('/admin/assistants') ? 'active' : ''}
                        >
                            <span className="nav-icon">🤖</span>
                            Assistentes
                        </Link>
                    )}
                    {shouldShowMenu('/admin/settings') && (
                        <Link 
                            to="/admin/settings" 
                            onClick={toggleSidebar}
                            className={isActiveLink('/admin/settings') ? 'active' : ''}
                        >
                            <span className="nav-icon">⚙️</span>
                            Settings
                        </Link>
                    )}
                    {shouldShowMenu('/admin/projects') && (
                        <Link 
                            to="/admin/projects" 
                            onClick={toggleSidebar}
                            className={isActiveLink('/admin/projects') ? 'active' : ''}
                        >
                            <span className="nav-icon">📁</span>
                            Projetos
                        </Link>
                    )}
                    <Link 
                        to="/admin/contacts" 
                        onClick={toggleSidebar}
                        className={isActiveLink('/admin/contacts') ? 'active' : ''}
                    >
                        <span className="nav-icon">👥</span>
                        Contatos
                    </Link>
                    <Link 
                        to="/admin/chats" 
                        onClick={toggleSidebar}
                        className={isActiveLink('/admin/chats') ? 'active' : ''}
                    >
                        <span className="nav-icon">💬</span>
                        Chats
                    </Link>
                    <Link 
                        to="/admin/notifications" 
                        onClick={toggleSidebar}
                        className={isActiveLink('/admin/notifications') ? 'active' : ''}
                    >
                        <span className="nav-icon">🔔</span>
                        Notificações
                    </Link>
                    <Link 
                        to="/admin/schedules" 
                        onClick={toggleSidebar}
                        className={isActiveLink('/admin/schedules') ? 'active' : ''}
                    >
                        <span className="nav-icon">📅</span>
                        Agendamentos
                    </Link>
                    <Link 
                        to="/admin/logs" 
                        onClick={toggleSidebar}
                        className={isActiveLink('/admin/logs') ? 'active' : ''}
                    >
                        <span className="nav-icon">📋</span>
                        Logs
                    </Link>
                </nav>
            </aside>

            <main className="main-content">
                <div className="header-profile">
                    <div className="profile-info">
                        <img 
                            src={`https://ui-avatars.com/api/?name=${userData?.username || 'User'}&background=2e7d32&color=fff`} 
                            alt="Profile" 
                            className="profile-avatar" 
                        />
                        <span className="profile-name">{userData?.username || 'User'}</span>
                        {userData?.isAdmin && <span className="admin-badge">Admin</span>}
                    </div>
                    <button 
                        className="logout-button" 
                        onClick={() => {
                            localStorage.removeItem('authToken');
                            localStorage.removeItem('userData');
                            navigate('/login');
                        }}
                    >
                        <span className="logout-icon">🚪</span>
                        Sair
                    </button>
                </div>

                <div className="content-area">
                    {isLoading && <div className="loading-overlay"><LoadingSpinner /></div>}
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
