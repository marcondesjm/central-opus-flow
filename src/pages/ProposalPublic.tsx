import { useParams } from 'react-router-dom';
import { useProposalByToken } from '@/hooks/useProposals';
import { ProposalPreview } from '@/components/proposals/ProposalPreview';
import { SignaturePad } from '@/components/proposals/SignaturePad';
import { Loader2, FileX, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useState } from 'react';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

export default function ProposalPublic() {
  const { token } = useParams<{ token: string }>();
  const { data: proposal, isLoading, error } = useProposalByToken(token || null);
  const [signed, setSigned] = useState(false);
  const [signing, setSigning] = useState(false);
  const queryClient = useQueryClient();

  const handleClientSign = async (data: {
    signatureUrl: string;
    type: 'draw' | 'type' | 'certificate';
    signerName: string;
    signerDocument: string;
    certificateFileName?: string;
  }) => {
    if (!proposal?.id) return;
    setSigning(true);

    try {
      // Upload signature image to storage
      let signatureStorageUrl = data.signatureUrl;
      
      if (data.type !== 'certificate') {
        const blob = await (await fetch(data.signatureUrl)).blob();
        const path = `signatures/${proposal.id}/client-${Date.now()}.png`;
        const { error: uploadError } = await supabase.storage
          .from('proposal-assets')
          .upload(path, blob, { contentType: 'image/png' });
        
        if (!uploadError) {
          const { data: urlData } = supabase.storage.from('proposal-assets').getPublicUrl(path);
          signatureStorageUrl = urlData.publicUrl;
        }
      }

      // Get client IP
      let clientIp = 'unknown';
      try {
        const ipResp = await fetch('https://api.ipify.org?format=json');
        const ipData = await ipResp.json();
        clientIp = ipData.ip;
      } catch { /* ignore */ }

      const { error: updateError } = await supabase
        .from('proposals')
        .update({
          client_signature_url: signatureStorageUrl,
          client_signature_type: data.type,
          client_signed_at: new Date().toISOString(),
          client_signed_ip: clientIp,
          client_signer_name: data.signerName,
          client_signer_document: data.signerDocument,
          certificate_file_name: data.certificateFileName || null,
          status: 'accepted',
          accepted_at: new Date().toISOString(),
        } as any)
        .eq('id', proposal.id);

      if (updateError) throw updateError;

      setSigned(true);
      queryClient.invalidateQueries({ queryKey: ['proposal-public', token] });
      toast.success('Proposta assinada com sucesso!');
    } catch (err) {
      console.error('Error signing proposal:', err);
      toast.error('Erro ao assinar proposta. Tente novamente.');
    } finally {
      setSigning(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error || !proposal) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-center px-4">
        <FileX className="w-16 h-16 text-gray-300 mb-4" />
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Proposta não encontrada</h1>
        <p className="text-gray-500">Este link pode ter expirado ou a proposta não está mais disponível.</p>
      </div>
    );
  }

  const alreadySigned = !!proposal.client_signature_url || !!proposal.accepted_at;

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <ProposalPreview proposal={proposal} />

      {/* Signature section */}
      <div className="max-w-[800px] mx-auto mt-6">
        {signed || alreadySigned ? (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-gray-800 mb-1">Proposta Aceita e Assinada!</h3>
            <p className="text-sm text-gray-500">
              Obrigado por assinar. O responsável será notificado automaticamente.
            </p>
          </div>
        ) : proposal.status === 'rejected' ? (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <FileX className="w-12 h-12 text-red-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-gray-800 mb-1">Proposta Recusada</h3>
            <p className="text-sm text-gray-500">Esta proposta foi recusada e não pode mais ser assinada.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <SignaturePad
              onSign={handleClientSign}
              brandColor={proposal.brand_color}
              disabled={signing}
            />
          </div>
        )}
      </div>
    </div>
  );
}
