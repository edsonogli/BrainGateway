import React, { useState } from 'react';
import './TermsModal.css';

const TermsModal = ({ isOpen, onAccept, onDecline }) => {
    const [isScrolledToBottom, setIsScrolledToBottom] = useState(false);
    const [hasAcceptedTerms, setHasAcceptedTerms] = useState(false);
    const [hasAcceptedPrivacy, setHasAcceptedPrivacy] = useState(false);

    const handleScroll = (e) => {
        const { scrollTop, scrollHeight, clientHeight } = e.target;
        const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10;
        setIsScrolledToBottom(isAtBottom);
    };

    const handleAccept = () => {
        if (hasAcceptedTerms && hasAcceptedPrivacy && isScrolledToBottom) {
            onAccept();
        }
    };

    const canAccept = hasAcceptedTerms && hasAcceptedPrivacy && isScrolledToBottom;

    if (!isOpen) return null;

    return (
        <div className="terms-modal-overlay">
            <div className="terms-modal">
                <div className="terms-modal-header">
                    <h2>Termos de Uso e Política de Privacidade</h2>
                    <p className="terms-subtitle">
                        Para continuar utilizando nossa plataforma, é necessário aceitar nossos termos de uso e política de privacidade.
                    </p>
                </div>

                <div className="terms-content" onScroll={handleScroll}>
                    <div className="terms-section">
                        <h3>Termo de Aceite para Uso Responsável</h3>
                        <p><strong>Compromisso com o uso ético e responsável do WhatsApp através da plataforma OchatPro</strong></p>
                        
                        <h4>Termo de Aceite e Responsabilidade</h4>
                        <p>Ao utilizar a plataforma OchatPro, você concorda em seguir as diretrizes de uso responsável do WhatsApp e assume total responsabilidade pelo uso adequado da ferramenta.</p>
                        
                        <p><strong>IMPORTANTE:</strong> O OchatPro segue as políticas e diretrizes do WhatsApp para evitar banimentos de números, mas não tem controle direto sobre as ações do WhatsApp e não pode garantir a prevenção de banimentos.</p>

                        <h4>1. Responsabilidades do Usuário</h4>
                        <p>Você se compromete a:</p>
                        <ul>
                            <li>Utilizar o número de telefone no WhatsApp de forma convencional por um período antes de conectar ao OchatPro</li>
                            <li>Interagir via celular ou WhatsApp Web antes de conectar no OchatPro para demonstrar que é um usuário genuíno</li>
                            <li>Aguardar pelo menos 24 horas após o registro no WhatsApp antes de escanear o QR code no OchatPro</li>
                            <li>Evitar enviar mensagens para números que não tenham seu número salvo nos contatos</li>
                            <li>Não utilizar a plataforma para envio de spam ou mensagens não solicitadas</li>
                            <li>Respeitar as políticas de uso do WhatsApp em todos os momentos</li>
                            <li>Manter práticas éticas de comunicação e marketing</li>
                        </ul>

                        <h4>2. Práticas Obrigatórias de Segurança</h4>
                        <p>Para minimizar riscos de banimento, você DEVE:</p>
                        <ul>
                            <li><strong>Maturação do Chip:</strong> Usar o número normalmente no WhatsApp por pelo menos 7 dias antes da integração</li>
                            <li><strong>Uso Gradual:</strong> Começar com baixo volume de mensagens e aumentar gradualmente</li>
                            <li><strong>Contatos Válidos:</strong> Enviar mensagens apenas para contatos que conhecem seu número</li>
                            <li><strong>Consentimento:</strong> Garantir que todos os contatos consentiram em receber suas mensagens</li>
                            <li><strong>Horários Adequados:</strong> Respeitar horários comerciais e evitar envios noturnos</li>
                            <li><strong>Conteúdo Relevante:</strong> Enviar apenas conteúdo útil e relevante para o destinatário</li>
                        </ul>

                        <h4>3. Limitações de Responsabilidade da OchatPro</h4>
                        <p>A OchatPro NÃO se responsabiliza por:</p>
                        <ul>
                            <li>Banimentos ou bloqueios de números do WhatsApp</li>
                            <li>Perda de acesso ao WhatsApp Business API</li>
                            <li>Consequências do uso inadequado da plataforma</li>
                            <li>Violações das políticas do WhatsApp pelo usuário</li>
                            <li>Práticas de spam ou uso não autorizado</li>
                            <li>Perdas comerciais decorrentes de banimentos</li>
                            <li>Interrupções no serviço do WhatsApp</li>
                        </ul>

                        <h4>4. Política Anti-Spam</h4>
                        <p>O WhatsApp mantém uma política severa contra spam. É PROIBIDO:</p>
                        <ul>
                            <li>Enviar mensagens em massa para contatos desconhecidos</li>
                            <li>Utilizar listas de contatos não autorizadas</li>
                            <li>Enviar conteúdo promocional sem consentimento</li>
                            <li>Usar automação para práticas abusivas</li>
                            <li>Ignorar solicitações de descadastro</li>
                            <li>Enviar mensagens repetitivas ou irrelevantes</li>
                        </ul>

                        <h4>5. Política de Privacidade</h4>
                        <p>Ao utilizar nossa plataforma, você concorda com nossa política de privacidade:</p>
                        <ul>
                            <li><strong>Coleta de Dados:</strong> Coletamos apenas dados necessários para o funcionamento da plataforma</li>
                            <li><strong>Uso de Dados:</strong> Seus dados são utilizados exclusivamente para prestação do serviço</li>
                            <li><strong>Compartilhamento:</strong> Não compartilhamos seus dados com terceiros sem autorização</li>
                            <li><strong>Segurança:</strong> Implementamos medidas de segurança para proteger suas informações</li>
                            <li><strong>Retenção:</strong> Mantemos seus dados pelo tempo necessário para prestação do serviço</li>
                            <li><strong>Direitos:</strong> Você tem direito de acessar, corrigir ou excluir seus dados</li>
                        </ul>

                        <h4>6. Proteção de Dados (LGPD)</h4>
                        <p>Em conformidade com a Lei Geral de Proteção de Dados (LGPD):</p>
                        <ul>
                            <li>Tratamos seus dados pessoais com transparência e segurança</li>
                            <li>Você pode solicitar acesso, correção ou exclusão de seus dados</li>
                            <li>Implementamos medidas técnicas e organizacionais adequadas</li>
                            <li>Notificaremos sobre qualquer incidente de segurança</li>
                            <li>Você pode revogar seu consentimento a qualquer momento</li>
                        </ul>

                        <h4>7. Monitoramento e Suspensão de Conta</h4>
                        <p>A OchatPro se reserva o direito de:</p>
                        <ul>
                            <li>Monitorar o uso da plataforma para detectar práticas inadequadas</li>
                            <li>Suspender contas que violem estas diretrizes</li>
                            <li>Encerrar o serviço para usuários que pratiquem spam</li>
                            <li>Reportar atividades suspeitas às autoridades competentes</li>
                            <li>Cooperar com investigações sobre uso inadequado</li>
                        </ul>

                        <h4>8. Consequências Legais</h4>
                        <p>O usuário está ciente de que:</p>
                        <ul>
                            <li>O uso inadequado pode resultar em processos judiciais</li>
                            <li>Práticas de spam podem violar a Lei Geral de Proteção de Dados (LGPD)</li>
                            <li>Mensagens não autorizadas podem configurar perturbação do sossego</li>
                            <li>O usuário é o único responsável por suas ações na plataforma</li>
                            <li>A OchatPro pode ser obrigada a fornecer dados em investigações</li>
                        </ul>

                        <h4>9. Boas Práticas Recomendadas</h4>
                        <p>Para um uso eficaz e seguro:</p>
                        <ul>
                            <li>Mantenha uma base de contatos limpa e atualizada</li>
                            <li>Personalize mensagens sempre que possível</li>
                            <li>Ofereça valor real em cada comunicação</li>
                            <li>Respeite a frequência de contato adequada</li>
                            <li>Monitore métricas de engajamento</li>
                            <li>Implemente opt-out fácil e claro</li>
                            <li>Mantenha registros de consentimento</li>
                        </ul>

                        <h4>10. Atualizações dos Termos</h4>
                        <p>Este termo pode ser atualizado periodicamente para refletir mudanças nas políticas do WhatsApp ou melhorias na plataforma. Usuários serão notificados sobre mudanças significativas.</p>

                        <h4>11. Contato e Suporte</h4>
                        <p>Para dúvidas sobre estes termos ou nossa política de privacidade, entre em contato através dos canais oficiais de suporte da OchatPro.</p>
                    </div>
                </div>

                <div className="terms-checkboxes">
                    <label className="checkbox-container">
                        <input
                            type="checkbox"
                            checked={hasAcceptedTerms}
                            onChange={(e) => setHasAcceptedTerms(e.target.checked)}
                        />
                        <span className="checkmark"></span>
                        Li e aceito os <strong>Termos de Uso</strong> da plataforma OchatPro
                    </label>

                    <label className="checkbox-container">
                        <input
                            type="checkbox"
                            checked={hasAcceptedPrivacy}
                            onChange={(e) => setHasAcceptedPrivacy(e.target.checked)}
                        />
                        <span className="checkmark"></span>
                        Li e aceito a <strong>Política de Privacidade</strong> e autorizo o tratamento dos meus dados pessoais
                    </label>
                </div>

                {!isScrolledToBottom && (
                    <div className="scroll-notice">
                        <p>⬇️ Role até o final para habilitar os botões de aceite</p>
                    </div>
                )}

                <div className="terms-actions">
                    <button 
                        className="btn-decline" 
                        onClick={onDecline}
                    >
                        Recusar e Sair
                    </button>
                    <button 
                        className={`btn-accept ${canAccept ? 'enabled' : 'disabled'}`}
                        onClick={handleAccept}
                        disabled={!canAccept}
                    >
                        Aceitar e Continuar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TermsModal;