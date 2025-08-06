import React, { useState, useEffect } from 'react';
import './FileUpload.css';
import { useApi } from '../contexts/ApiContext';
import { useAuth } from '../components/AuthContext';

const FileUpload = () => {
    const { getFiles, uploadFile, downloadFile, deleteFile } = useApi();
    const { userData } = useAuth();
    
    // Estados principais
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState(null);
    
    // Estados de paginação
    const [pagination, setPagination] = useState({
        page: 1,
        pageSize: 20,
        totalCount: 0,
        totalPages: 0
    });
    
    // Estados do formulário de upload
    const [uploadData, setUploadData] = useState({
        file: null,
        fileType: 'juridico', // 'juridico' ou 'treinamento'
        description: ''
    });
    
    // Estados de filtros e busca
    const [filters, setFilters] = useState({
        fileType: 'todos',
        status: 'todos',
        dateRange: 'todos'
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });

    useEffect(() => {
        loadFiles();
    }, [pagination.page, pagination.pageSize]);

    const loadFiles = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const response = await getFiles(pagination.page, pagination.pageSize);

            if (response.success !== false) {
                // Mapear os dados da API para o formato esperado pelo componente
                const mappedFiles = response.files.map(file => ({
                    id: file.id,
                    name: file.fileName || file.originalName,
                    originalName: file.originalName,
                    fileType: file.contentType?.includes('spreadsheet') || file.originalName?.includes('.xlsx') || file.originalName?.includes('.xls') || file.originalName?.includes('.csv') ? 'juridico' : 'treinamento',
                    status: file.status, // Manter o status original da API
                    uploadDate: file.createdAt,
                    processedDate: file.updatedAt,
                    size: file.sizeInBytes,
                    description: file.description || '',
                    tags: file.tags || '',
                    url: file.blobUrl,
                    recordsCount: null,
                    errorCount: null,
                    contentType: file.contentType,
                    sizeFormatted: file.sizeFormatted
                }));

                setFiles(mappedFiles);
                setPagination(prev => ({
                    ...prev,
                    totalCount: response.totalCount || 0,
                    totalPages: response.totalPages || 0
                }));
            }
        } catch (error) {
            console.error('Erro ao carregar arquivos:', error);
            setError('Erro ao carregar arquivos. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            setUploadData(prev => ({
                ...prev,
                file: file
            }));
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        
        if (!uploadData.file) {
            alert('Por favor, selecione um arquivo.');
            return;
        }

        setIsUploading(true);
        setUploadProgress(0);
        setError(null);

        try {
            // Criar FormData para o upload
            const formData = new FormData();
            formData.append('File', uploadData.file);
            if (uploadData.description) {
                formData.append('Description', uploadData.description);
            }

            // Simular progresso durante o upload
            const progressInterval = setInterval(() => {
                setUploadProgress(prev => {
                    if (prev >= 90) {
                        clearInterval(progressInterval);
                        return 90;
                    }
                    return prev + 10;
                });
            }, 200);

            const response = await uploadFile(formData);

            clearInterval(progressInterval);
            setUploadProgress(100);

            if (response.success !== false && response.file) {
                // Mapear o arquivo retornado para o formato esperado
                const newFile = {
                    id: response.file.id,
                    name: response.file.fileName || response.file.originalName,
                    originalName: response.file.originalName,
                    fileType: response.file.contentType?.includes('spreadsheet') || response.file.originalName?.includes('.xlsx') || response.file.originalName?.includes('.xls') || response.file.originalName?.includes('.csv') ? 'juridico' : 'treinamento',
                    status: response.file.status, // Manter o status original da API
                    uploadDate: response.file.createdAt,
                    processedDate: response.file.updatedAt,
                    size: response.file.sizeInBytes,
                    description: response.file.description || '',
                    tags: response.file.tags || '',
                    url: response.file.blobUrl,
                    recordsCount: null,
                    errorCount: null,
                    contentType: response.file.contentType,
                    sizeFormatted: response.file.sizeFormatted
                };

                // Adicionar o novo arquivo ao início da lista
                setFiles(prev => [newFile, ...prev]);
                
                // Fechar modal e resetar formulário
                setShowUploadModal(false);
                setUploadData({
                    file: null,
                    fileType: 'juridico',
                    description: ''
                });
                
                alert('Arquivo enviado com sucesso!');
            } else {
                throw new Error(response.message || 'Erro no upload do arquivo');
            }

        } catch (error) {
            console.error('Erro no upload:', error);
            setError(error.message || 'Erro ao fazer upload do arquivo. Tente novamente.');
            alert('Erro ao fazer upload do arquivo: ' + (error.message || 'Erro desconhecido'));
        } finally {
            setIsUploading(false);
            setUploadProgress(0);
        }
    };

    const handleDownload = async (fileId, fileName) => {
        try {
            const response = await downloadFile(fileId);

            if (response.downloadUrl) {
                // Criar um link temporário para download
                const link = document.createElement('a');
                link.href = response.downloadUrl;
                link.download = fileName;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            } else {
                throw new Error('URL de download não encontrada');
            }
        } catch (error) {
            console.error('Erro ao fazer download:', error);
            alert('Erro ao fazer download do arquivo: ' + (error.message || 'Erro desconhecido'));
        }
    };

    const handleDelete = async (fileId, fileName) => {
        if (!confirm(`Tem certeza que deseja excluir o arquivo "${fileName}"?`)) {
            return;
        }

        try {
            const response = await deleteFile(fileId);

            if (response.success !== false) {
                // Remover o arquivo da lista
                setFiles(prev => prev.filter(file => file.id !== fileId));
                alert('Arquivo excluído com sucesso!');
            } else {
                throw new Error(response.message || 'Erro ao excluir arquivo');
            }
        } catch (error) {
            console.error('Erro ao excluir arquivo:', error);
            alert('Erro ao excluir arquivo: ' + (error.message || 'Erro desconhecido'));
        }
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('pt-BR');
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            uploaded: { class: 'success', text: 'Enviado', icon: '✅' },
            processing: { class: 'warning', text: 'Processando', icon: '⏳' },
            processed: { class: 'success', text: 'Processado', icon: '✅' },
            error: { class: 'error', text: 'Erro', icon: '❌' },
            deleted: { class: 'deleted', text: 'Excluído', icon: '🗑️' }
        };
        
        const config = statusConfig[status] || { class: 'pending', text: 'Desconhecido', icon: '❓' };
        return (
            <span className={`status-badge ${config.class}`}>
                <span className="status-icon">{config.icon}</span>
                {config.text}
            </span>
        );
    };

    const getFileTypeIcon = (fileType) => {
        return fileType === 'juridico' ? '⚖️' : '🤖';
    };

    const getFileTypeBadge = (fileType) => {
        const typeConfig = {
            juridico: { class: 'juridico', text: 'Jurídico' },
            treinamento: { class: 'treinamento', text: 'Treinamento IA' }
        };
        
        const config = typeConfig[fileType];
        return (
            <span className={`file-type-badge ${config.class}`}>
                {getFileTypeIcon(fileType)} {config.text}
            </span>
        );
    };

    // Filtrar e ordenar arquivos
    const filteredFiles = files.filter(file => {
        const matchesSearch = file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            file.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            file.tags.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesType = filters.fileType === 'todos' || file.fileType === filters.fileType;
        const matchesStatus = filters.status === 'todos' || file.status === filters.status;
        
        return matchesSearch && matchesType && matchesStatus;
    }).sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        
        if (sortConfig.direction === 'asc') {
            return aValue > bValue ? 1 : -1;
        } else {
            return aValue < bValue ? 1 : -1;
        }
    });

    const handleSort = (key) => {
        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    const getSortIcon = (key) => {
        if (sortConfig.key !== key) return '↕️';
        return sortConfig.direction === 'asc' ? '↑' : '↓';
    };

    return (
        <div className="file-upload-container">
            <div className="file-upload-header">
                <div className="header-content">
                <h2>Gerenciamento de Arquivos</h2>
                <p className="header-description">
                    Faça upload de planilhas jurídicas e documentos para treinamento da IA
                </p>
            </div>
                <button 
                    className="btn-upload"
                    onClick={() => setShowUploadModal(true)}
                >
                    📤 Novo Upload
                </button>
            </div>

            {/* Filtros e Busca */}
            <div className="filters-section">
                <div className="search-box">
                    <input
                        type="text"
                        placeholder="Buscar arquivos..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                </div>
                
                <div className="filters">
                    <select
                        value={filters.fileType}
                        onChange={(e) => setFilters(prev => ({ ...prev, fileType: e.target.value }))}
                        className="filter-select"
                    >
                        <option value="todos">Todos os tipos</option>
                        <option value="juridico">Jurídico</option>
                        <option value="treinamento">Treinamento IA</option>
                    </select>
                    
                    <select
                        value={filters.status}
                        onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                        className="filter-select"
                    >
                        <option value="todos">Todos os status</option>
                        <option value="processed">Processado</option>
                        <option value="processing">Processando</option>
                        <option value="uploaded">Enviado</option>
                        <option value="error">Com erro</option>
                        <option value="deleted">Excluído</option>
                    </select>
                </div>
            </div>

            {/* Mensagem de Erro */}
            {error && (
                <div className="error-message">
                    <span className="error-icon">⚠️</span>
                    {error}
                    <button 
                        className="btn-retry"
                        onClick={() => loadFiles()}
                    >
                        Tentar Novamente
                    </button>
                </div>
            )}

            {/* Lista de Arquivos */}
            <div className="files-section">
                {loading ? (
                    <div className="loading-state">
                        <div className="spinner"></div>
                        <p>Carregando arquivos...</p>
                    </div>
                ) : filteredFiles.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">📂</div>
                        <h3>Nenhum arquivo encontrado</h3>
                        <p>Faça o upload do seu primeiro arquivo para começar</p>
                        <button 
                            className="btn-upload"
                            onClick={() => setShowUploadModal(true)}
                        >
                            📤 Fazer Upload
                        </button>
                    </div>
                ) : (
                    <div className="files-table-container">
                        <table className="files-table">
                            <thead>
                                <tr>
                                    <th onClick={() => handleSort('name')} className="sortable">
                                        Nome {getSortIcon('name')}
                                    </th>
                                    <th onClick={() => handleSort('fileType')} className="sortable">
                                        Tipo {getSortIcon('fileType')}
                                    </th>
                                    <th onClick={() => handleSort('status')} className="sortable">
                                        Status {getSortIcon('status')}
                                    </th>
                                    <th onClick={() => handleSort('uploadDate')} className="sortable">
                                        Data Upload {getSortIcon('uploadDate')}
                                    </th>
                                    <th onClick={() => handleSort('size')} className="sortable">
                                        Tamanho {getSortIcon('size')}
                                    </th>
                                    <th>Detalhes</th>
                                    <th>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredFiles.map(file => (
                                    <tr key={file.id} className="file-row">
                                        <td className="file-name-cell">
                                            <div className="file-info">
                                                <span className="file-icon">📄</span>
                                                <div>
                                                    <div className="file-name">{file.name}</div>
                                                    {file.description && (
                                                        <div className="file-description">{file.description}</div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            {getFileTypeBadge(file.fileType)}
                                        </td>
                                        <td>
                                            {getStatusBadge(file.status)}
                                        </td>
                                        <td className="date-cell">
                                            {formatDate(file.uploadDate)}
                                        </td>
                                        <td className="size-cell">
                                            {formatFileSize(file.size)}
                                        </td>
                                        <td className="details-cell">
                                            {file.recordsCount !== null && (
                                                <div className="detail-item">
                                                    <span className="detail-label">Registros:</span>
                                                    <span className="detail-value">{file.recordsCount}</span>
                                                </div>
                                            )}
                                            {file.errorCount !== null && file.errorCount > 0 && (
                                                <div className="detail-item error">
                                                    <span className="detail-label">Erros:</span>
                                                    <span className="detail-value">{file.errorCount}</span>
                                                </div>
                                            )}
                                            {file.tags && (
                                                <div className="file-tags">
                                                    {file.tags.split(',').map((tag, index) => (
                                                        <span key={index} className="tag">{tag.trim()}</span>
                                                    ))}
                                                </div>
                                            )}
                                        </td>
                                        <td className="actions-cell">
                                            <div className="action-buttons">
                                                <button 
                                                    className="btn-action download" 
                                                    title="Download"
                                                    onClick={() => handleDownload(file.id, file.originalName)}
                                                >
                                                    📥
                                                </button>
                                                <button 
                                                    className="btn-action view" 
                                                    title="Visualizar"
                                                    onClick={() => window.open(file.url, '_blank')}
                                                >
                                                    👁️
                                                </button>
                                                {file.status !== 'processed' && (
                                                    <button 
                                                        className="btn-action delete" 
                                                        title="Excluir"
                                                        onClick={() => handleDelete(file.id, file.originalName)}
                                                    >
                                                        🗑️
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        
                        {/* Paginação */}
                        {pagination.totalPages > 1 && (
                            <div className="pagination">
                                <div className="pagination-info">
                                    Mostrando {((pagination.page - 1) * pagination.pageSize) + 1} a {Math.min(pagination.page * pagination.pageSize, pagination.totalCount)} de {pagination.totalCount} arquivos
                                </div>
                                <div className="pagination-controls">
                                    <button 
                                        className="btn-page"
                                        onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                                        disabled={pagination.page === 1}
                                    >
                                        ← Anterior
                                    </button>
                                    
                                    <span className="page-info">
                                        Página {pagination.page} de {pagination.totalPages}
                                    </span>
                                    
                                    <button 
                                        className="btn-page"
                                        onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                                        disabled={pagination.page === pagination.totalPages}
                                    >
                                        Próxima →
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Modal de Upload */}
            {showUploadModal && (
                <div className="modal-overlay">
                    <div className="modal-content upload-modal">
                        <div className="modal-header">
                            <h3>📤 Novo Upload de Arquivo</h3>
                            <button 
                                className="close-btn"
                                onClick={() => setShowUploadModal(false)}
                                disabled={isUploading}
                            >
                                ×
                            </button>
                        </div>
                        
                        <form onSubmit={handleUpload} className="upload-form">
                            <div className="form-group">
                                <label htmlFor="fileType">Tipo de Arquivo:</label>
                                <select
                                    id="fileType"
                                    name="fileType"
                                    value={uploadData.fileType}
                                    onChange={(e) => setUploadData(prev => ({ ...prev, fileType: e.target.value }))}
                                    className="form-select"
                                    disabled={isUploading}
                                >
                                    <option value="juridico">⚖️ Jurídico (Planilhas de Processos)</option>
                                    <option value="treinamento">🤖 Treinamento IA (PDFs, Word, etc.)</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label htmlFor="file">Arquivo:</label>
                                <div className="file-input-container">
                                    <input
                                        type="file"
                                        id="file"
                                        onChange={handleFileSelect}
                                        className="file-input"
                                        accept={uploadData.fileType === 'juridico' ? '.xlsx,.xls,.csv' : '.pdf,.doc,.docx,.txt'}
                                        disabled={isUploading}
                                    />
                                    <div className="file-input-display">
                                        {uploadData.file ? (
                                            <span className="file-selected">
                                                📄 {uploadData.file.name} ({formatFileSize(uploadData.file.size)})
                                            </span>
                                        ) : (
                                            <span className="file-placeholder">
                                                Clique para selecionar um arquivo
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="file-help">
                                    {uploadData.fileType === 'juridico' ? (
                                        <small>Formatos aceitos: .xlsx, .xls, .csv</small>
                                    ) : (
                                        <small>Formatos aceitos: .pdf, .doc, .docx, .txt</small>
                                    )}
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="description">Descrição:</label>
                                <textarea
                                    id="description"
                                    name="description"
                                    value={uploadData.description}
                                    onChange={(e) => setUploadData(prev => ({ ...prev, description: e.target.value }))}
                                    className="form-textarea"
                                    placeholder="Descreva o conteúdo do arquivo..."
                                    rows="3"
                                    disabled={isUploading}
                                />
                            </div>



                            {isUploading && (
                                <div className="upload-progress">
                                    <div className="progress-bar">
                                        <div 
                                            className="progress-fill" 
                                            style={{ width: `${uploadProgress}%` }}
                                        ></div>
                                    </div>
                                    <span className="progress-text">{uploadProgress}%</span>
                                </div>
                            )}

                            <div className="form-actions">
                                <button 
                                    type="button" 
                                    className="btn-cancel"
                                    onClick={() => setShowUploadModal(false)}
                                    disabled={isUploading}
                                >
                                    Cancelar
                                </button>
                                <button 
                                    type="submit" 
                                    className="btn-submit"
                                    disabled={!uploadData.file || isUploading}
                                >
                                    {isUploading ? 'Enviando...' : 'Fazer Upload'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FileUpload;