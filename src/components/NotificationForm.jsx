import React, { useState, useEffect } from 'react';
import { useApi } from '../contexts/ApiContext';
import './NotificationForm.css';

const NotificationForm = ({ formData, onInputChange, onSubmit, editingId, onCancel }) => {
    const [projects, setProjects] = useState([]);
    const { getProjects } = useApi();

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const projectsData = await getProjects();
                setProjects(Array.isArray(projectsData) ? projectsData : []);
            } catch (error) {
                console.error('Erro ao buscar projetos:', error);
                setProjects([]);
            }
        };

        fetchProjects();
    }, [getProjects]);
    return (
        <div className="notification-form-container">
            <h3>{editingId ? 'Editar Notificação' : 'Criar Nova Notificação'}</h3>
            
            <form onSubmit={onSubmit} className="notification-form">
                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="name">Nome</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={onInputChange}
                            placeholder="Nome da notificação"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="type">Tipo</label>
                        <input
                            type="number"
                            id="type"
                            name="type"
                            value={formData.type}
                            onChange={onInputChange}
                            placeholder="Tipo da notificação"
                            required
                        />
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="projectId">Projeto:</label>
                        <select
                            id="projectId"
                            name="projectId"
                            value={formData.projectId}
                            onChange={onInputChange}
                            required
                        >
                            <option value="">Selecione um projeto</option>
                            {projects.map((project) => (
                                <option key={project.id} value={project.id}>
                                    {project.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="afterDays">Dias Após</label>
                        <input
                            type="number"
                            id="afterDays"
                            name="afterDays"
                            value={formData.afterDays}
                            onChange={onInputChange}
                            placeholder="Número de dias"
                            required
                        />
                    </div>
                </div>
                
                <div className="form-group">
                    <label htmlFor="message">Mensagem</label>
                    <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={onInputChange}
                        placeholder="Mensagem da notificação"
                        rows="4"
                    />
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="mediaFile">Arquivo de Mídia</label>
                        <input
                            type="text"
                            id="mediaFile"
                            name="mediaFile"
                            value={formData.mediaFile}
                            onChange={onInputChange}
                            placeholder="URL ou caminho do arquivo de mídia"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="audioFile">Arquivo de Áudio</label>
                        <input
                            type="text"
                            id="audioFile"
                            name="audioFile"
                            value={formData.audioFile}
                            onChange={onInputChange}
                            placeholder="URL ou caminho do arquivo de áudio"
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label htmlFor="regex">Regex</label>
                    <input
                        type="text"
                        id="regex"
                        name="regex"
                        value={formData.regex}
                        onChange={onInputChange}
                        placeholder="Expressão regular"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="active">Ativo</label>
                    <select
                        id="active"
                        name="active"
                        value={formData.active}
                        onChange={onInputChange}
                    >
                        <option value={true}>Sim</option>
                        <option value={false}>Não</option>
                    </select>
                </div>

                <div className="form-actions">
                    <button type="submit" className="btn btn-primary">
                        {editingId ? 'Atualizar' : 'Criar'} Notificação
                    </button>
                    {editingId && (
                        <button type="button" className="btn btn-secondary" onClick={onCancel}>
                            Cancelar
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
};

export default NotificationForm;