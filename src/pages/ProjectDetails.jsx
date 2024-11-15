// src/pages/ProjectDetails.jsx
import React, { useEffect, useState } from 'react';
import { useApi } from '../contexts/ApiContext';
import { useParams, useNavigate } from 'react-router-dom';
import './ProjectDetails.css';

const ProjectDetails = () => {
    const { id } = useParams();
    const { getProjectById, updateProject } = useApi();
    const [project, setProject] = useState(null);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProject = async () => {
            try {
                const data = await getProjectById(id);
                setProject(data);
            } catch (err) {
                setError('Falha ao carregar detalhes do projeto');
                console.error(err);
            }
        };

        fetchProject();
    }, [id, getProjectById]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProject((prevProject) => ({ ...prevProject, [name]: value }));
    };

    const handleSave = async () => {
        try {
            await updateProject(id, project);
            navigate('../projects');
        } catch (err) {
            setError('Falha ao atualizar o projeto');
            console.error(err);
        }
    };

    if (!project) {
        return <p>Carregando...</p>;
    }

    return (
        <div className="project-details-container">
            <h2>Detalhes do Projeto</h2>
            {error && <p className="error-message">{error}</p>}
            <form>
                <label>
                    Nome:
                    <input
                        type="text"
                        name="name"
                        value={project.name}
                        onChange={handleChange}
                    />
                </label>
                <label>
                    Número:
                    <input
                        type="text"
                        name="number"
                        value={project.number}
                        onChange={handleChange}
                    />
                </label>
                <label>
                    Assistente:
                    <input
                        type="text"
                        name="assistantId"
                        value={project.assistantId}
                        onChange={handleChange}
                    />
                </label>
                <label>
                    Instância:
                    <input
                        type="text"
                        name="instance"
                        value={project.instance}
                        onChange={handleChange}
                    />
                </label>
                <label>
                    Ativo:
                    <select
                        name="active"
                        value={project.active}
                        onChange={handleChange}
                    >
                        <option value={true}>Sim</option>
                        <option value={false}>Não</option>
                    </select>
                </label>
                <button type="button" onClick={handleSave}>
                    Salvar
                </button>
            </form>
        </div>
    );
};

export default ProjectDetails;
