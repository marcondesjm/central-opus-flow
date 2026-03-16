import { forwardRef } from 'react';
import type { Proposal } from '@/hooks/useProposals';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ProposalPreviewProps {
  proposal: Partial<Proposal>;
}

export const ProposalPreview = forwardRef<HTMLDivElement, ProposalPreviewProps>(
  ({ proposal }, ref) => {
    const brandColor = proposal.brand_color || '#3b82f6';
    const secondaryColor = proposal.brand_secondary_color || '#1e293b';
    const services = proposal.services || [];
    const subtotal = services.reduce((sum, s) => sum + ((Number(s.quantity) || 0) * (Number(s.unit_price) || 0)), 0);
    const discount = Number(proposal.discount) || 0;
    const total = subtotal - discount;
    const createdAt = proposal.created_at ? new Date(proposal.created_at) : new Date();
    const validUntil = new Date(createdAt);
    validUntil.setDate(validUntil.getDate() + (proposal.validity_days || 15));

    return (
      <div
        ref={ref}
        className="bg-white text-gray-900 w-full max-w-[800px] mx-auto shadow-xl rounded-lg overflow-hidden"
        style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif" }}
      >
        {/* Header */}
        <div
          className="p-8 flex items-center justify-between"
          style={{ backgroundColor: brandColor }}
        >
          <div className="flex items-center gap-4">
            {proposal.company_logo_url ? (
              <img
                src={proposal.company_logo_url}
                alt="Logo empresa"
                className="w-16 h-16 rounded-xl object-contain bg-white/20 p-1"
              />
            ) : (
              <div className="w-16 h-16 rounded-xl bg-white/20 flex items-center justify-center">
                <span className="text-white text-2xl font-bold">
                  {(proposal.company_name || 'E').charAt(0)}
                </span>
              </div>
            )}
            <div>
              <h1 className="text-xl font-bold text-white">
                {proposal.company_name || 'Sua Empresa'}
              </h1>
              {proposal.company_email && (
                <p className="text-white/80 text-sm">{proposal.company_email}</p>
              )}
              {proposal.company_phone && (
                <p className="text-white/80 text-sm">{proposal.company_phone}</p>
              )}
            </div>
          </div>
          <div className="text-right">
            <p className="text-white/60 text-xs uppercase tracking-wider font-semibold">Proposta</p>
            <p className="text-white text-2xl font-bold">#{String(Math.floor(Math.random() * 9000) + 1000)}</p>
          </div>
        </div>

        {/* Title bar */}
        <div className="px-8 py-5" style={{ backgroundColor: secondaryColor }}>
          <h2 className="text-lg font-bold text-white">{proposal.proposal_title || 'Proposta Comercial'}</h2>
          <p className="text-white/60 text-sm mt-1">
            Emitida em {format(createdAt, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })} •
            Válida até {format(validUntil, "dd/MM/yyyy")}
          </p>
        </div>

        {/* Client info */}
        <div className="px-8 py-6 border-b border-gray-100">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-2">Cliente</p>
              <div className="flex items-center gap-3">
                {proposal.client_logo_url && (
                  <img
                    src={proposal.client_logo_url}
                    alt="Logo cliente"
                    className="w-12 h-12 rounded-lg object-contain border border-gray-200 p-0.5"
                  />
                )}
                <div>
                  <p className="font-bold text-lg">{proposal.client_name || 'Nome do Cliente'}</p>
                  {proposal.client_company && (
                    <p className="text-gray-500 text-sm">{proposal.client_company}</p>
                  )}
                  {proposal.client_email && (
                    <p className="text-gray-500 text-sm">{proposal.client_email}</p>
                  )}
                  {proposal.client_phone && (
                    <p className="text-gray-500 text-sm">{proposal.client_phone}</p>
                  )}
                </div>
              </div>
            </div>
            {proposal.deadline_days && (
              <div className="text-right">
                <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-2">Prazo de Entrega</p>
                <p className="font-bold text-lg">{proposal.deadline_days} dias</p>
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        {proposal.description && (
          <div className="px-8 py-6 border-b border-gray-100">
            <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-2">Descrição</p>
            <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
              {proposal.description}
            </p>
          </div>
        )}

        {/* Services table */}
        {services.length > 0 && (
          <div className="px-8 py-6 border-b border-gray-100">
            <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-4">Serviços</p>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2" style={{ borderColor: brandColor + '40' }}>
                  <th className="text-left py-3 font-semibold text-gray-600">Serviço</th>
                  <th className="text-center py-3 font-semibold text-gray-600 w-20">Qtd</th>
                  <th className="text-right py-3 font-semibold text-gray-600 w-28">Valor Unit.</th>
                  <th className="text-right py-3 font-semibold text-gray-600 w-28">Total</th>
                </tr>
              </thead>
              <tbody>
                {services.map((service, i) => (
                  <tr key={i} className="border-b border-gray-50">
                    <td className="py-3">
                      <p className="font-medium">{service.name}</p>
                      {service.description && (
                        <p className="text-gray-400 text-xs mt-0.5">{service.description}</p>
                      )}
                    </td>
                    <td className="py-3 text-center">{service.quantity}</td>
                    <td className="py-3 text-right">
                      R$ {service.unit_price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 text-right font-medium">
                      R$ {(service.quantity * service.unit_price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals */}
            <div className="mt-4 flex flex-col items-end gap-1">
              <div className="flex justify-between w-56 text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span>R$ {subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between w-56 text-sm text-emerald-600">
                  <span>Desconto</span>
                  <span>- R$ {discount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
              )}
              <div
                className="flex justify-between w-56 text-lg font-bold mt-2 pt-2 border-t-2"
                style={{ borderColor: brandColor }}
              >
                <span>Total</span>
                <span style={{ color: brandColor }}>
                  R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Payment conditions */}
        {proposal.payment_conditions && (
          <div className="px-8 py-6 border-b border-gray-100">
            <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-2">Condições de Pagamento</p>
            <p className="text-gray-700 text-sm whitespace-pre-wrap">{proposal.payment_conditions}</p>
          </div>
        )}

        {/* Notes */}
        {proposal.notes && (
          <div className="px-8 py-6 border-b border-gray-100">
            <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-2">Observações</p>
            <p className="text-gray-700 text-sm whitespace-pre-wrap">{proposal.notes}</p>
          </div>
        )}

        {/* Signatures section */}
        <div className="px-8 py-6 border-b border-gray-100">
          <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-4">Assinaturas</p>
          <div className="grid grid-cols-2 gap-8">
            {/* Company signature */}
            <div className="text-center">
              {proposal.company_signature_url ? (
                <div>
                  <img src={proposal.company_signature_url} alt="Assinatura empresa" className="max-h-16 mx-auto mb-2" />
                  <div className="border-t border-gray-300 pt-2 mt-2">
                    <p className="text-xs font-medium text-gray-700">{proposal.company_signer_name}</p>
                    <p className="text-[10px] text-gray-400">{proposal.company_signer_document}</p>
                    {proposal.company_signed_at && (
                      <p className="text-[10px] text-gray-400">
                        {new Date(proposal.company_signed_at).toLocaleString('pt-BR')}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="h-20 border-b-2 border-dashed border-gray-200 flex items-end justify-center pb-2">
                  <p className="text-xs text-gray-300">Assinatura da empresa</p>
                </div>
              )}
              <p className="text-xs text-gray-500 mt-2 font-medium">{proposal.company_name || 'Empresa'}</p>
            </div>

            {/* Client signature */}
            <div className="text-center">
              {proposal.client_signature_url ? (
                <div>
                  <img src={proposal.client_signature_url} alt="Assinatura cliente" className="max-h-16 mx-auto mb-2" />
                  <div className="border-t border-gray-300 pt-2 mt-2">
                    <p className="text-xs font-medium text-gray-700">{proposal.client_signer_name}</p>
                    <p className="text-[10px] text-gray-400">{proposal.client_signer_document}</p>
                    {proposal.client_signed_at && (
                      <p className="text-[10px] text-gray-400">
                        {new Date(proposal.client_signed_at).toLocaleString('pt-BR')}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="h-20 border-b-2 border-dashed border-gray-200 flex items-end justify-center pb-2">
                  <p className="text-xs text-gray-300">Assinatura do cliente</p>
                </div>
              )}
              <p className="text-xs text-gray-500 mt-2 font-medium">{proposal.client_name || 'Cliente'}</p>
            </div>
          </div>

          {/* Certificate info */}
          {proposal.certificate_file_name && (
            <div className="mt-4 text-center">
              <p className="text-[10px] text-gray-400 flex items-center justify-center gap-1">
                🔒 Certificado digital anexado: {proposal.certificate_file_name}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 py-6 text-center" style={{ backgroundColor: secondaryColor + '08' }}>
          <p className="text-gray-400 text-xs">
            {proposal.company_name || 'Sua Empresa'} {proposal.company_address ? `• ${proposal.company_address}` : ''}
          </p>
          <p className="text-gray-300 text-[10px] mt-2">
            Documento gerado digitalmente • Assinatura com validade jurídica (MP 2.200-2/2001)
          </p>
        </div>
      </div>
    );
  }
);

ProposalPreview.displayName = 'ProposalPreview';
