import { useParams } from 'react-router-dom';
import { useProposalByToken } from '@/hooks/useProposals';
import { ProposalPreview } from '@/components/proposals/ProposalPreview';
import { Loader2, FileX } from 'lucide-react';

export default function ProposalPublic() {
  const { token } = useParams<{ token: string }>();
  const { data: proposal, isLoading, error } = useProposalByToken(token || null);

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

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <ProposalPreview proposal={proposal} />
    </div>
  );
}
