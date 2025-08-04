import React, { useState, useEffect } from 'react';
import { useApi } from '../contexts/ApiContext';
import './Users.css';

const Users = () => {
    const { getUsers, createUser, activateUser, disableUser, getProjects } = useApi();
    const [users, setUsers] = useState([]);
    const [projects, setProjects] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        username: '',
        projectId: ''
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadUsers();
        loadProjects();
    }, []);

    const loadUsers = async () => {
        try {
            const usersData = await getUsers();
            setUsers(usersData);
        } catch (error) {
            console.error('Erro ao carregar usuários:', error);
        }
    };

    const loadProjects = async () => {
        try {
            const projectsData = await getProjects();
            setProjects(projectsData);
        } catch (error) {
            console.error('Erro ao carregar projetos:', error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Limpar erro do campo quando o usuário começar a digitar
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.email.trim()) {
            newErrors.email = 'Email é obrigatório';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email inválido';
        }

        if (!formData.password.trim()) {
            newErrors.password = 'Senha é obrigatória';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Senha deve ter pelo menos 6 caracteres';
        }

        if (!formData.username.trim()) {
            newErrors.username = 'Nome de usuário é obrigatório';
        }

        if (!formData.projectId) {
            newErrors.projectId = 'Projeto é obrigatório';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        setLoading(true);
        try {
            await createUser({
                email: formData.email,
                password: formData.password,
                username: formData.username,
                projectId: parseInt(formData.projectId)
            });
            
            setShowModal(false);
            setFormData({
                email: '',
                password: '',
                username: '',
                projectId: ''
            });
            setErrors({});
            await loadUsers();
        } catch (error) {
            console.error('Erro ao criar usuário:', error);
            setErrors({ submit: 'Erro ao criar usuário. Tente novamente.' });
        } finally {
            setLoading(false);
        }
    };

    const handleStatusToggle = async (userId, currentStatus) => {
        try {
            console.log(`Tentando ${currentStatus ? 'desativar' : 'ativar'} usuário ID: ${userId}`);
            
            if (currentStatus) {
                await disableUser(userId);
            } else {
                await activateUser(userId);
            }
            
            // Recarregar a lista de usuários após a mudança
            await loadUsers();
            
        } catch (error) {
            console.error('Erro ao alterar status do usuário:', error);
            // Em caso de erro, mostrar uma mensagem para o usuário
            alert('Erro ao alterar status do usuário. Tente novamente.');
        }
    };

    const getProjectName = (projectId) => {
        const project = projects.find(p => p.projectId === projectId || p.id === projectId);
        return project ? project.name : 'Projeto não encontrado';
    };

    return (
        <div className="users-page">
            <div className="users-header">
                <h1>Gerenciamento de Usuários</h1>
                <button 
                    className="btn-primary"
                    onClick={() => setShowModal(true)}
                >
                    Adicionar Usuário
                </button>
            </div>

            <div className="users-table-container">
                <table className="users-table">
                    <thead>
                            <tr>
                                <th>ID</th>
                                <th>Email</th>
                                <th>Nome</th>
                                <th>Projeto</th>
                                <th>Status</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                    <tbody>
                            {users.map((user, index) => (
                                <tr key={user.id || index}>
                                    <td>{user.id}</td>
                                    <td>{user.email}</td>
                                    <td>{user.name}</td>
                                    <td>{getProjectName(user.projectId)}</td>
                                    <td>
                                        <span className={`status-badge ${user.active ? 'active' : 'inactive'}`}>
                                            {user.active ? 'Ativo' : 'Inativo'}
                                        </span>
                                    </td>
                                    <td>
                                        <button
                                            className={`action-btn ${user.active ? 'deactivate' : 'activate'}`}
                                            onClick={() => handleStatusToggle(user.id, user.active)}
                                        >
                                            {user.active ? 'Desativar' : 'Ativar'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                </table>

                {users.length === 0 && (
                    <div className="no-users">
                        <p>Nenhum usuário encontrado.</p>
                    </div>
                )}
            </div>

            {/* Modal para adicionar usuário */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal">
                        <div className="modal-header">
                            <h2>Adicionar Novo Usuário</h2>
                            <button 
                                className="modal-close"
                                onClick={() => {
                                    setShowModal(false);
                                    setFormData({
                                        email: '',
                                        password: '',
                                        username: '',
                                        projectId: ''
                                    });
                                    setErrors({});
                                }}
                            >
                                ×
                            </button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="user-form">
                            <div className="form-group">
                                <label htmlFor="username">Nome de Usuário</label>
                                <input
                                    type="text"
                                    id="username"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleInputChange}
                                    className={errors.username ? 'error' : ''}
                                    placeholder="Digite o nome de usuário"
                                />
                                {errors.username && <span className="error-message">{errors.username}</span>}
                            </div>

                            <div className="form-group">
                                <label htmlFor="email">Email</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className={errors.email ? 'error' : ''}
                                    placeholder="Digite o email"
                                />
                                {errors.email && <span className="error-message">{errors.email}</span>}
                            </div>

                            <div className="form-group">
                                <label htmlFor="password">Senha</label>
                                <input
                                    type="password"
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    className={errors.password ? 'error' : ''}
                                    placeholder="Digite a senha"
                                />
                                {errors.password && <span className="error-message">{errors.password}</span>}
                            </div>

                            <div className="form-group">
                                <label htmlFor="projectId">Projeto</label>
                                <select
                                    id="projectId"
                                    name="projectId"
                                    value={formData.projectId}
                                    onChange={handleInputChange}
                                    className={errors.projectId ? 'error' : ''}
                                >
                                    <option value="">Selecione um projeto</option>
                                    {projects.map(project => (
                                        <option key={project.id} value={project.projectId || project.id}>
                                            {project.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.projectId && <span className="error-message">{errors.projectId}</span>}
                            </div>

                            {errors.submit && (
                                <div className="error-message submit-error">
                                    {errors.submit}
                                </div>
                            )}

                            <div className="form-actions">
                                <button 
                                    type="button" 
                                    className="btn-secondary"
                                    onClick={() => {
                                        setShowModal(false);
                                        setFormData({
                                            email: '',
                                            password: '',
                                            username: '',
                                            projectId: ''
                                        });
                                        setErrors({});
                                    }}
                                >
                                    Cancelar
                                </button>
                                <button 
                                    type="submit" 
                                    className="btn-primary"
                                    disabled={loading}
                                >
                                    {loading ? 'Criando...' : 'Criar Usuário'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Users;