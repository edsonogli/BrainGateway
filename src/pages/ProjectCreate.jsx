// src/pages/CreateProject.jsx
import React, { useState } from 'react';
import { useApi } from '../contexts/ApiContext';
import { useNavigate } from 'react-router-dom';
import './ProjectCreate.css';

const ProjectCreate = () => {
    const { createProject } = useApi(); // Função que chamará a API para criar o projeto
    const [project, setProject] = useState({ 
        name: '', 
        projectId: '',
        number: '', 
        assistantId: '',
        instance: '',
        wppService: '',
        active: true, 
        allowAudio: false, 
        autoNotification: false 
    });
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        let convertedValue = value;
        
        // Converter strings para booleanos para os campos específicos
        if (name === 'active' || name === 'allowAudio' || name === 'autoNotification') {
            convertedValue = value === 'true';
        }
        
        setProject((prevProject) => ({ ...prevProject, [name]: convertedValue }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await createProject(project);
            navigate('/admin/projects'); // Redireciona para a lista de projetos
        } catch (err) {
            setError('Falha ao criar projeto');
            console.error(err);
        }
    };

    return (
        <div className="create-project-container">
            <h2>Criar Novo Projeto</h2>
            {error && <p className="error-message">{error}</p>}
            <form onSubmit={handleSubmit}>
                <label>
                    Nome:
                    <input
                        type="text"
                        name="name"
                        value={project.name}
                        onChange={handleChange}
                        required
                    />
                </label>
                <label>
                    ID do Projeto:
                    <input
                        type="text"
                        name="projectId"
                        value={project.projectId}
                        onChange={handleChange}
                        required
                    />
                </label>
                <label>
                    Número:
                    <input
                        type="text"
                        name="number"
                        value={project.number}
                        onChange={handleChange}
                        required
                    />
                </label>
                <label>
                    Assistente:
                    <input
                        type="text"
                        name="assistantId"
                        value={project.assistantId || ''}
                        onChange={handleChange}
                    />
                </label>
                <label>
                    Instância:
                    <input
                        type="text"
                        name="instance"
                        value={project.instance || ''}
                        onChange={handleChange}
                    />
                </label>
                <label>
                    WPP Service:
                    <input
                        type="text"
                        name="wppService"
                        value={project.wppService || ''}
                        onChange={handleChange}
                    />
                </label>
                <label>
                    Ativo:
                    <select name="active" value={project.active} onChange={handleChange}>
                        <option value={true}>Sim</option>
                        <option value={false}>Não</option>
                    </select>
                </label>
                <label>
                    Permitir Áudio:
                    <select name="allowAudio" value={project.allowAudio} onChange={handleChange}>
                        <option value={true}>Sim</option>
                        <option value={false}>Não</option>
                    </select>
                </label>
                <label>
                    Notificação Automática:
                    <select name="autoNotification" value={project.autoNotification} onChange={handleChange}>
                        <option value={true}>Sim</option>
                        <option value={false}>Não</option>
                    </select>
                </label>
                <button type="submit">Salvar Projeto</button>
            </form>
        </div>
    );
};

export default ProjectCreate;
