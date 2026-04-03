import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle, XCircle, FileCheck, Loader2, Clock, AlertCircle } from 'lucide-react';

export default function ApprovalPublic() {
  const { token } = useParams<{ token: string }>();
  const [rejectionReason, setRejectionReason] = useState('');
  const [showReject, setShowReject] = useState(false);

  const { data: approval, isLoading, refetch } = useQuery({
    queryKey: ['approval-public', token],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('content_approvals')
        .select('*')
        .eq('share_token', token!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!token,
  });

  const approve = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('content_approvals')
        .update({ status: 'approved', approved_at: new Date().toISOString() } as any)
        .eq('share_token', token!);
      if (error) throw error;
    },
    onSuccess: () => refetch(),
  });

  const reject = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('content_approvals')
        .update({
          status: 'rejected',
          rejected_at: new Date().toISOString(),
          rejection_reason: rejectionReason.trim() || null,
        } as any)
        .eq('share_token', token!);
      if (error) throw error;
    },
    onSuccess: () => refetch(),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a1a]">
        <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
      </div>
    );
  }

  if (!approval) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a1a] text-white">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-400" />
          <h1 className="text-2xl font-bold mb-2">Link inválido</h1>
          <p className="text-white/50">Este link de aprovação não existe ou expirou.</p>
        </div>
      </div>
    );
  }

  const isPending = approval.status === 'pending';
  const isApproved = approval.status === 'approved';
  const isRejected = approval.status === 'rejected';

  return (
    <div className="min-h-screen bg-[#0a0a1a] text-white">
      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-purple-500/20 flex items-center justify-center mx-auto mb-4">
            <FileCheck className="w-8 h-8 text-purple-400" />
          </div>
          <h1 className="text-2xl font-bold mb-1">Aprovação de Conteúdo</h1>
          <p className="text-white/50 text-sm">Revise o conteúdo abaixo e aprove ou solicite alterações</p>
        </div>

        {/* Content Card */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs text-white/40">Enviado para:</span>
            <span className="text-sm font-medium">{approval.client_name}</span>
          </div>
          <div className="bg-white/5 rounded-xl p-5 border border-white/5">
            <p className="text-sm whitespace-pre-wrap leading-relaxed">{approval.content}</p>
          </div>
          <div className="flex items-center gap-2 mt-4 text-xs text-white/30">
            <Clock className="w-3 h-3" />
            <span>Enviado em {new Date(approval.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>

        {/* Status / Actions */}
        {isPending ? (
          <div className="space-y-4">
            {showReject ? (
              <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-5 space-y-3">
                <p className="text-sm font-medium text-red-300">Motivo da rejeição (opcional)</p>
                <Textarea
                  placeholder="Explique o que precisa ser alterado..."
                  value={rejectionReason}
                  onChange={e => setRejectionReason(e.target.value)}
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/30 min-h-[80px]"
                />
                <div className="flex gap-3">
                  <Button
                    onClick={() => reject.mutate()}
                    disabled={reject.isPending}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                  >
                    {reject.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <><XCircle className="w-4 h-4 mr-2" /> Confirmar Rejeição</>}
                  </Button>
                  <Button variant="ghost" onClick={() => setShowReject(false)} className="text-white/50 hover:text-white">
                    Cancelar
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex gap-3">
                <Button
                  onClick={() => approve.mutate()}
                  disabled={approve.isPending}
                  className="flex-1 h-14 text-base bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl"
                >
                  {approve.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <><CheckCircle className="w-5 h-5 mr-2" /> Aprovar</>}
                </Button>
                <Button
                  onClick={() => setShowReject(true)}
                  className="flex-1 h-14 text-base bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/30 rounded-xl"
                >
                  <XCircle className="w-5 h-5 mr-2" /> Rejeitar
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className={`rounded-2xl p-6 text-center ${isApproved ? 'bg-emerald-500/10 border border-emerald-500/30' : 'bg-red-500/10 border border-red-500/30'}`}>
            {isApproved ? (
              <>
                <CheckCircle className="w-12 h-12 mx-auto mb-3 text-emerald-400" />
                <h2 className="text-xl font-bold text-emerald-300">Conteúdo Aprovado!</h2>
                <p className="text-sm text-white/50 mt-1">
                  Aprovado em {approval.approved_at ? new Date(approval.approved_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}
                </p>
              </>
            ) : (
              <>
                <XCircle className="w-12 h-12 mx-auto mb-3 text-red-400" />
                <h2 className="text-xl font-bold text-red-300">Conteúdo Rejeitado</h2>
                {(approval as any).rejection_reason && (
                  <p className="text-sm text-white/60 mt-3 bg-white/5 rounded-lg p-3">
                    <strong>Motivo:</strong> {(approval as any).rejection_reason}
                  </p>
                )}
                <p className="text-sm text-white/50 mt-2">
                  Rejeitado em {approval.rejected_at ? new Date(approval.rejected_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}
                </p>
              </>
            )}
          </div>
        )}

        <p className="text-center text-[11px] text-white/20 mt-8">Central Opus Flow — Aprovação de Conteúdo</p>
      </div>
    </div>
  );
}
