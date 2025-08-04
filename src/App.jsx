// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './components/AuthContext';
import { ApiProvider } from './contexts/ApiContext'; // Importe o ApiProvider
import LoginPage from './pages/LoginPage';
import AdminLayout from './components/AdminLayout';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Projects from './pages/Projects';
import Logs from './pages/LogsWebhook';
import Instances from './pages/Instances';
import Assistants from './pages/Assistants';
import Contacts from './pages/Contacts';
import Chats from './pages/Chats';
import ProjectDetails from './pages/ProjectDetails';
import ProjectCreate from './pages/ProjectCreate';
import InstanceConnect from './pages/InstanceConnect';
import Notifications from './pages/Notifications';
import Schedules from './pages/Schedules';
import Campanhas from './pages/Campanhas';
import Users from './pages/Users';

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        // Exiba um spinner ou mensagem de carregamento enquanto verifica a autenticação
        return <div>Carregando...</div>;
    }

    return isAuthenticated ? children : <Navigate to="/login" />;
};

const App = () => {
    return (
        <Router>
            <AuthProvider>
              <ApiProvider> {/* Envolve o App com o ApiProvider */}
                <Routes>
                    <Route path="/" element={<Navigate to="/login" />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route
                        path="/admin"
                        element={
                            <ProtectedRoute>
                                <AdminLayout />
                            </ProtectedRoute>
                        }
                    >
                        <Route path="dashboard" element={<Dashboard />} />
                        <Route path="profile" element={<Profile />} />
                        <Route path="assistants" element={<Assistants />} />
                        <Route path="instances" element={<Instances />} />
                        <Route path="instances/connect" element={<InstanceConnect />} />
                        <Route path="users" element={<Users />} />
                        <Route path="settings" element={<Settings />} />
                        <Route path="projects" element={<Projects />} />
                        <Route path="contacts" element={<Contacts />} />
                        <Route path="campanhas" element={<Campanhas />} />
                        <Route path="chats" element={<Chats />} />
                        <Route path="notifications" element={<Notifications />} />
            <Route path="schedules" element={<Schedules />} />
            <Route path="logs" element={<Logs />} />
                        <Route path="projects/:id" element={<ProjectDetails />} /> {/* Detalhes do projeto como sub-rota */}
                        <Route path="projects/create" element={<ProjectCreate />} /> {/* Rota de criação */}
                    </Route>
                </Routes>
                </ApiProvider>
            </AuthProvider>
        </Router>
    );
};

export default App;
