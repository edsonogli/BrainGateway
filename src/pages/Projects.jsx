import React, { useEffect, useState } from 'react';
import { useApi } from '../contexts/ApiContext';
import './Contacts.css';
import { useNavigate } from 'react-router-dom';

const Projects = () => {
    const { getProjects } = useApi();
    const [projects, setProjects] = useState([]);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProjects = async () => {
            try{
                const data = await getProjects();
                setProjects(data);
            }
            catch (err)
            {
                setError('Falha ao obter Projetos');
                console.error(err);
            }
        };

        fetchProjects();
    }, [getProjects]); 

    const handleDetails = (projectId) => {
        navigate(`/admin/projects/${projectId}`); // Redireciona para a rota dentro de /admin
    };

    const handleCreate = () => {
        navigate('/admin/projects/create'); // Navega para a página de criação
    };

    return (<div className="contacts-container">
            <h2>Projetos</h2>
            {error && <p className="error-message">{error}</p>}
            <button onClick={handleCreate} className="create-button">Criar Projeto</button>
            <table className="contacts-table">
                <thead>
                    <tr>
                        <th>Nome</th>
                        <th>Projeto</th>
                        <th>Número</th>
                        <th>Assistente</th>
                        <th>Instância</th>
                        <th>Active</th>
                        <th>Ação</th>
                    </tr>
                </thead>
                <tbody>
                    {projects.map((project, index) => (
                        <tr key={index}>
                            <td>{project.name}</td>
                            <td>{project.projectId}</td>
                            <td>{project.number}</td>
                            <td>{project.assistantId}</td>
                            <td>{project.instance}</td>
                            <td>{project.active.toString()}</td>
                            <td>
                                <button onClick={() => handleDetails(project.id)}>
                                    Detalhes
                                </button>
                            </td>
                            {/* <td>
                                {contact.active ? (
                                    <button
                                        onClick={() => handleInactivate(contact.id)}
                                        className="inactivate-button"
                                    >
                                        Inativar
                                    </button>
                                ) : (
                                    'Inativado'
                                )}
                            </td> */}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>);
};

export default Projects;
