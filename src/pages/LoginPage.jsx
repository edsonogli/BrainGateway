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
            await login(credentials);
            navigate('/admin/dashboard'); // Redireciona para o dashboard após login
        } catch (err) {
            setError('Login failed. Please check your credentials.');
        }
    };

    return (
        <div className="login-container">
            <div className="login-welcome">
                <h2>Novo Aqui?</h2>
                <p>Entre em contato com um de nossos representantes para obter acesso ao sistema e desfrutar de seus benefícios</p>
                <button className="signup-button">Enviar mensagem agora!</button>
            </div>
            <div className="login-form">
                <h2>Entrar</h2>
                <form onSubmit={handleLogin}>
                    <div className="input-container">
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
                        <input
                            type="password"
                            name="password"
                            value={credentials.password}
                            onChange={handleChange}
                            placeholder="Senha"
                            required
                        />
                    </div>
                    <button type="submit" className="login-button">Login</button>
                </form>
                {error && <p className="error-message">{error}</p>}
                {/* <p className="social-text">Or Sign in with social platforms</p>
                <div className="social-icons">
                    <i className="fab fa-facebook"></i>
                    <i className="fab fa-twitter"></i>
                    <i className="fab fa-google"></i>
                    <i className="fab fa-linkedin"></i>
                </div> */}
            </div>
        </div>
    );
};

export default LoginPage;
