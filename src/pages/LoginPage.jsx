// src/pages/LoginPage.jsx
import React, { useState } from 'react';
import { useApi } from '../contexts/ApiContext';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css';

const LoginPage = () => {
    const { login } = useApi();
    const navigate = useNavigate();
    const [credentials, setCredentials] = useState({ email: '', password: '' });
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCredentials((prev) => ({ ...prev, [name]: value }));
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            console.log('Iniciando processo de login com:', credentials);
            await login(credentials);
            
            // Verifica se o token foi salvo corretamente
            const token = localStorage.getItem('authToken');
            console.log('Token após login:', token ? 'Presente' : 'Ausente');
            
            if (!token) {
                throw new Error('Token não foi salvo após login');
            }
            
            navigate('/admin/dashboard');
        } catch (err) {
            console.error('Erro durante login:', err);
            setError(`Falha no login: ${err.message || 'Verifique suas credenciais'}`);
        }
    };

    return (
        <div className="login-container">
            <div className="login-welcome">
                <div className="welcome-content">
                    <h1>Bem-vindo ao OChatPro</h1>
                    <h2>Novo Aqui?</h2>
                    <p>Entre em contato com um de nossos representantes para obter acesso ao sistema e desfrutar de seus benefícios</p>
                    <a href="https://wa.me/5541996870967" target="_blank" rel="noopener noreferrer" className="whatsapp-button">
                        <i className="whatsapp-icon">📱</i>
                        Falar com Representante
                    </a>
                </div>
            </div>
            <div className="login-form">
                <div className="form-container">
                    <h2>Entrar</h2>
                    <form onSubmit={handleLogin}>
                        <div className="input-container">
                            <i className="input-icon">📧</i>
                            <input
                                type="email"
                                name="email"
                                value={credentials.email}
                                onChange={handleChange}
                                placeholder="Email"
                                required
                            />
                        </div>
                        <div className="input-container">
                            <i className="input-icon">🔒</i>
                            <input
                                type="password"
                                name="password"
                                value={credentials.password}
                                onChange={handleChange}
                                placeholder="Senha"
                                required
                            />
                        </div>
                        <button type="submit" className="login-button">Entrar</button>
                    </form>
                    {error && <p className="error-message">{error}</p>}
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
