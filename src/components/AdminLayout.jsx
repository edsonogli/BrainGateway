// src/components/AdminLayout.jsx
import React, { useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import './AdminLayout.css';

const AdminLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
                    <h1>Brain</h1>
                </div>
                <nav className="sidebar-nav">
                    <Link to="/admin/dashboard" onClick={toggleSidebar}>Dashboard</Link>
                    <Link to="/admin/profile" onClick={toggleSidebar}>Profile</Link>
                    <Link to="/admin/assistants" onClick={toggleSidebar}>Assistentes</Link>
                    <Link to="/admin/settings" onClick={toggleSidebar}>Settings</Link>
                    <Link to="/admin/projects" onClick={toggleSidebar}>Projetos</Link>
                    <Link to="/admin/contacts" onClick={toggleSidebar}>Contatos</Link>
                    <Link to="/admin/messages" onClick={toggleSidebar}>Mensagens</Link>
                    <Link to="/admin/campaings" onClick={toggleSidebar}>Campanhas</Link>
                    <Link to="/admin/logs" onClick={toggleSidebar}>Logs</Link>
                </nav>
            </aside>

            <main className="main-content">
                <header className="header">
                    <div className="header-left">
                        <h2>Admin Brain</h2>
                    </div>
                    <div className="header-right">
                        <span>User</span>
                        <img src="https://via.placeholder.com/30" alt="User" className="user-avatar" />
                    </div>
                </header>

                <Outlet /> {/* Renderiza as sub-rotas */}
            </main>
        </div>
    );
};

export default AdminLayout;
