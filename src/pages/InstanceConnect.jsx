import React, { useState, useEffect } from 'react';
import { useApi } from '../contexts/ApiContext';
import './InstanceConnect.css';

const InstanceConnect = () => {
    const { connectInstance, getProjects } = useApi();
    const [projects, setProjects] = useState([]);
    const [selectedProject, setSelectedProject] = useState('');
    const [qrCode, setQrCode] = useState('');
    const [error, setError] = useState(null);
    const [infoMessage, setInfoMessage] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleError = (err, message) => {
        setError(message);
        console.error('Erro:', message, err);
    };

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const data = await getProjects();
                if (Array.isArray(data)) {
                    setProjects(data);
                } else {
                    handleError(null, 'Formato de dados inválido ao carregar projetos');
                    setProjects([]);
                }
            } catch (err) {
                handleError(err, 'Falha ao carregar projetos');
                setProjects([]);
            }
        };

        fetchProjects();
    }, [getProjects]);

    const handleConnect = async () => {
        if (!selectedProject) {
            setError('Por favor, selecione um projeto');
            return;
        }

        try {
            setLoading(true);
            setError(null);
            setInfoMessage(null);
            setQrCode('');
            const response = await connectInstance({ projectId: selectedProject });
            
            // Verifica se a resposta indica status 204 (já conectado ou sem conexões)
            if (response && response.status === 204) {
                setInfoMessage(response.message);
                setQrCode(''); // Limpa qualquer QR code anterior
            } else if (response && typeof response === 'string') {
                // Se a resposta é uma string (QR code)
                setQrCode(response);
                setInfoMessage(null);
            } else if (response) {
                // Se a resposta é um objeto com dados do QR code
                setQrCode(response);
                setInfoMessage(null);
            } else {
                setError('Resposta inválida do servidor');
            }
        } catch (err) {
            handleError(err, 'Falha ao conectar instância');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="instance-connect-container">
            <h2>Conectar Nova Instância</h2>
            
            <div className="form-section">
                <div className="form-group">
                    <label htmlFor="project">Selecione o Projeto:</label>
                    <select
                        id="project"
                        value={selectedProject}
                        onChange={(e) => setSelectedProject(e.target.value)}
                        className="project-select"
                    >
                        <option value="">Selecione um projeto...</option>
                        {Array.isArray(projects) && projects.map((project) => (
                            <option key={project.id} value={project.id}>
                                {project.code} - {project.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <button
                onClick={handleConnect}
                disabled={loading || !selectedProject}
                className="connect-button"
            >
                {loading ? 'Conectando...' : 'Conectar'}
            </button>

            {error && <p className="error-message">{error}</p>}
            {infoMessage && <p className="info-message">{infoMessage}</p>}

            {qrCode && (
                <div className="qr-code-container">
                    <h3>Escaneie o QR Code</h3>
                    <img
                        src={qrCode}
                        alt="QR Code para conexão"
                        className="qr-code-image"
                    />
                </div>
            )}
        </div>
    );
};

export default InstanceConnect;