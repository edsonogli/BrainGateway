import React, { useEffect, useState } from 'react';
import { useApi } from '../contexts/ApiContext';
import { debugError } from '../config';
import './Assistants.css';

const Assistants = () => {
    const { getAssistants, updateAssistant } = useApi();
    const [assistants, setAssistants] = useState([]);
    const [error, setError] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [editingText, setEditingText] = useState('');

    useEffect(() => {
        let isMounted = true;
        const fetchAssistants = async () => {
            try {
                const data = await getAssistants();
                if (isMounted) {
                    setAssistants(data);
                }
            } catch (err) {
                if (isMounted) {
                    setError('Falha ao carregar assistentes');
                    debugError('Erro ao carregar assistentes:', err);
                }
            }
        };
        fetchAssistants();
        return () => {
            isMounted = false;
        };
    }, [getAssistants]);

    const handleEdit = (assistant) => {
        setEditingId(assistant.id);
        setEditingText(assistant.instructions || '');
    };

    const handleSave = async (id) => {
        try {
            await updateAssistant(id, editingText);
            setAssistants(prevAssistants => 
                prevAssistants.map(assistant => 
                    assistant.id === id 
                        ? { ...assistant, instructions: editingText }
                        : assistant
                )
            );
            setEditingId(null);
            setEditingText('');
        } catch (err) {
            setError('Falha ao atualizar assistente');
            console.error(err);
        }
    };

    const handleCancel = () => {
        setEditingId(null);
        setEditingText('');
    };

    return (
        <div className="assistants-container">
            <h2>Assistentes</h2>
            {error && <p className="error-message">{error}</p>}
            <div className="assistants-grid">
                {assistants.map((assistant) => (
                    <div key={assistant.id} className="assistant-card">
                        <div className="assistant-header">
                            <h3>{assistant.name}</h3>
                            <span className="assistant-model">{assistant.model}</span>
                        </div>
                        <div className="assistant-content">
                            {editingId === assistant.id ? (
                                <div className="edit-form">
                                    <textarea
                                        value={editingText}
                                        onChange={(e) => setEditingText(e.target.value)}
                                        rows="10"
                                        placeholder="Instruções do assistente"
                                    />
                                    <div className="edit-actions">
                                        <button onClick={() => handleSave(assistant.id)} className="save-button">
                                            Salvar
                                        </button>
                                        <button onClick={handleCancel} className="cancel-button">
                                            Cancelar
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <p className="assistant-instructions">{assistant.instructions}</p>
                                    <button onClick={() => handleEdit(assistant)} className="edit-button">
                                        Editar Instruções
                                    </button>
                                </>    
                            )}
                        </div>
                        <div className="assistant-footer">
                            <span>ID: {assistant.id}</span>
                            <span>Criado em: {new Date(assistant.created_at * 1000).toLocaleDateString()}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Assistants;
