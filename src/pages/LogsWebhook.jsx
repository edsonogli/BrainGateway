import React, { useEffect, useState, useMemo } from 'react';
import { useApi } from '../contexts/ApiContext';
import './Logs.css';

const Logs = () => {
    const { getLogs } = useApi();
    const [logs, setLogs] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sortConfig, setSortConfig] = useState({ key: 'receivedAt', direction: 'desc' });
    const [selectedLog, setSelectedLog] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                setLoading(true);
                const data = await getLogs();
                setLogs(Array.isArray(data) ? data : []);
            } catch (err) {
                setError('Erro ao carregar logs');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchLogs();
    }, [getLogs]);

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        try {
            const date = new Date(dateString);
            return date.toLocaleString('pt-BR');
        } catch {
            return dateString;
        }
    };

    const formatPayload = (payload) => {
        if (!payload) return '';
        try {
            if (typeof payload === 'string') {
                return JSON.stringify(JSON.parse(payload), null, 2);
            }
            return JSON.stringify(payload, null, 2);
        } catch {
            return payload.toString();
        }
    };

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const filteredAndSortedLogs = useMemo(() => {
        let filtered = logs;

        // Filtrar por termo de busca
        if (searchTerm) {
            filtered = logs.filter(log => 
                (log.messageId && log.messageId.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (log.origin && log.origin.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (log.from && log.from.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (log.to && log.to.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (log.messageType && log.messageType.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (log.returnText && log.returnText.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }

        // Ordenar
        return filtered.sort((a, b) => {
            let aValue = a[sortConfig.key];
            let bValue = b[sortConfig.key];

            if (sortConfig.key === 'receivedAt') {
                aValue = new Date(aValue || 0);
                bValue = new Date(bValue || 0);
            }

            if (aValue < bValue) {
                return sortConfig.direction === 'asc' ? -1 : 1;
            }
            if (aValue > bValue) {
                return sortConfig.direction === 'asc' ? 1 : -1;
            }
            return 0;
        });
    }, [logs, sortConfig, searchTerm]);

    const getSortIcon = (columnKey) => {
        if (sortConfig.key !== columnKey) return '↕️';
        return sortConfig.direction === 'asc' ? '↑' : '↓';
    };

    const openPayloadModal = (log) => {
        setSelectedLog(log);
    };

    const closePayloadModal = () => {
        setSelectedLog(null);
    };

    if (loading) {
        return (
            <div className="logs-container">
                <div className="loading-state">Carregando logs...</div>
            </div>
        );
    }

    return (
        <div className="logs-container">
            <div className="logs-header">
                <h2>Logs de Webhook</h2>
                <div className="logs-controls">
                    <input
                        type="text"
                        placeholder="Buscar logs..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                    <button 
                        onClick={() => window.location.reload()} 
                        className="refresh-button"
                    >
                        Atualizar
                    </button>
                </div>
            </div>

            {error && <div className="error-message">{error}</div>}

            {filteredAndSortedLogs.length === 0 ? (
                <div className="empty-state">
                    {searchTerm ? 'Nenhum log encontrado para a busca.' : 'Nenhum log disponível.'}
                </div>
            ) : (
                <div className="table-container">
                    <table className="logs-table">
                        <thead>
                            <tr>
                                <th onClick={() => handleSort('receivedAt')} className="sortable">
                                    Data/Hora {getSortIcon('receivedAt')}
                                </th>
                                <th onClick={() => handleSort('messageId')} className="sortable">
                                    Message ID {getSortIcon('messageId')}
                                </th>
                                <th onClick={() => handleSort('origin')} className="sortable">
                                    Origem {getSortIcon('origin')}
                                </th>
                                <th onClick={() => handleSort('from')} className="sortable">
                                    De {getSortIcon('from')}
                                </th>
                                <th onClick={() => handleSort('to')} className="sortable">
                                    Para {getSortIcon('to')}
                                </th>
                                <th onClick={() => handleSort('messageType')} className="sortable">
                                    Tipo {getSortIcon('messageType')}
                                </th>
                                <th>Retorno</th>
                                <th>Payload</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredAndSortedLogs.map((log) => (
                                <tr key={log.id || log.messageId}>
                                    <td className="date-cell">
                                        {formatDate(log.receivedAt)}
                                    </td>
                                    <td className="message-id-cell">
                                        {log.messageId || '-'}
                                    </td>
                                    <td className="origin-cell">
                                        <span className={`origin-badge ${log.origin?.toLowerCase()}`}>
                                            {log.origin || '-'}
                                        </span>
                                    </td>
                                    <td className="contact-cell">
                                        {log.from || '-'}
                                    </td>
                                    <td className="contact-cell">
                                        {log.to || '-'}
                                    </td>
                                    <td className="type-cell">
                                        <span className={`type-badge ${log.messageType?.toLowerCase()}`}>
                                            {log.messageType || '-'}
                                        </span>
                                    </td>
                                    <td className="return-text-cell">
                                        {log.returnText ? (
                                            <span title={log.returnText}>
                                                {log.returnText.length > 50 
                                                    ? `${log.returnText.substring(0, 50)}...` 
                                                    : log.returnText
                                                }
                                            </span>
                                        ) : '-'}
                                    </td>
                                    <td className="payload-cell">
                                        {log.payload ? (
                                            <button 
                                                onClick={() => openPayloadModal(log)}
                                                className="view-payload-button"
                                            >
                                                Ver JSON
                                            </button>
                                        ) : '-'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal para exibir payload */}
            {selectedLog && (
                <div className="modal-overlay" onClick={closePayloadModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Payload - {selectedLog.messageId}</h3>
                            <button onClick={closePayloadModal} className="close-button">×</button>
                        </div>
                        <div className="modal-body">
                            <pre className="payload-content">
                                {formatPayload(selectedLog.payload)}
                            </pre>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Logs;
