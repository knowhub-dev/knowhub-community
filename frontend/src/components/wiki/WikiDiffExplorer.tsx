'use client';

import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { WikiDiffViewer } from './WikiDiffViewer';
import type {
  WikiDiffResponse,
  WikiProposalSummary,
} from '@/types';
import { Loader2, MessageSquareDiff } from 'lucide-react';

interface WikiDiffExplorerProps {
  slug: string;
}

async function fetchProposals(slug: string) {
  const res = await api.get(`/wiki/${slug}/proposals`);
  return res.data as { proposals: WikiProposalSummary[] };
}

async function fetchDiff(slug: string, proposalId: number) {
  const res = await api.get(`/wiki/${slug}/proposals/${proposalId}/diff`);
  return res.data as WikiDiffResponse;
}

function getInitialId(proposals?: WikiProposalSummary[]): number | null {
  if (!proposals || proposals.length === 0) {
    return null;
  }
  return proposals[0]?.id ?? null;
}

export function WikiDiffExplorer({ slug }: WikiDiffExplorerProps) {
  const { data: proposalsData, isLoading: isLoadingProposals, isError: isProposalsError } = useQuery({
    queryKey: ['wiki', slug, 'proposals'],
    queryFn: () => fetchProposals(slug),
  });

  const proposals = useMemo(
    () => proposalsData?.proposals ?? [],
    [proposalsData]
  );
  const [selectedProposalId, setSelectedProposalId] = useState<number | null>(() => getInitialId(proposals));

  useEffect(() => {
    const firstId = getInitialId(proposals);

    if (selectedProposalId === null && firstId !== null) {
      setSelectedProposalId(firstId);
      return;
    }

    if (selectedProposalId !== null && proposals.length > 0) {
      const exists = proposals.some((proposal) => proposal.id === selectedProposalId);
      if (!exists) {
        setSelectedProposalId(firstId);
      }
    }
  }, [proposals, selectedProposalId]);

  const {
    data: diffData,
    isLoading: isLoadingDiff,
    isError: isDiffError,
  } = useQuery({
    queryKey: ['wiki', slug, 'diff', selectedProposalId],
    queryFn: () => fetchDiff(slug, selectedProposalId as number),
    enabled: selectedProposalId !== null,
  });

  const statusLabels = useMemo(() => ({
    pending: { label: 'Ko’rib chiqilmoqda', className: 'bg-amber-50 text-amber-700 border border-amber-200' },
    merged: { label: 'Birlashtirilgan', className: 'bg-emerald-50 text-emerald-700 border border-emerald-200' },
    rejected: { label: 'Rad etilgan', className: 'bg-rose-50 text-rose-700 border border-rose-200' },
  } as const), []);

  return (
    <section className="mt-10 space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-full bg-green-100 text-green-700">
          <MessageSquareDiff className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Wiki takliflarini solishtirish</h2>
          <p className="text-sm text-gray-600">
            Hamjamiyat yuborgan takliflarni tanlab, o’zgarishlarni birma-bir ko’rib chiqing.
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[320px,1fr]">
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Takliflar</h3>
          <div className="space-y-3">
            {isLoadingProposals && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Loader2 className="w-4 h-4 animate-spin" /> Takliflar yuklanmoqda...
              </div>
            )}

            {isProposalsError && (
              <div className="text-sm text-rose-600">
                Takliflarni yuklashda xatolik yuz berdi. Iltimos qaytadan urinib ko’ring.
              </div>
            )}

            {!isLoadingProposals && proposals.length === 0 && (
              <div className="text-sm text-gray-500">
                Hozircha takliflar mavjud emas. Birinchi bo’lib tahrir taklif qiling!
              </div>
            )}

            {proposals.map((proposal) => {
              const status = statusLabels[proposal.status] ?? statusLabels.pending;
              return (
                <button
                  key={proposal.id}
                  onClick={() => setSelectedProposalId(proposal.id)}
                  className={`w-full text-left border rounded-lg px-4 py-3 transition bg-white shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-green-500 ${selectedProposalId === proposal.id ? 'border-green-400 ring-1 ring-green-400' : 'border-gray-200'}`}
                  type="button"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200">
                      {proposal.user?.avatar_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={proposal.user.avatar_url}
                          alt={proposal.user.name || 'Foydalanuvchi'}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-sm font-semibold text-gray-600">
                          {proposal.user?.name?.[0]?.toUpperCase() ?? '?'}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-gray-900 truncate">
                        {proposal.user?.name ?? 'Anonim foydalanuvchi'}
                        </span>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${status.className}`}>
                          {status.label}
                        </span>
                      </div>
                      {proposal.comment && (
                        <p className="text-sm text-gray-600 truncate">{proposal.comment}</p>
                      )}
                      <p className="text-xs text-gray-500">
                        {new Date(proposal.created_at).toLocaleString('uz-UZ', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">O’zgarishlar</h3>
          {selectedProposalId === null && (
            <div className="text-sm text-gray-500">
              Avval chap tomondan taklifni tanlang va uning tafovutlarini ko’ring.
            </div>
          )}

          {isLoadingDiff && selectedProposalId !== null && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Loader2 className="w-4 h-4 animate-spin" /> Tafovutlar yuklanmoqda...
            </div>
          )}

          {isDiffError && (
            <div className="text-sm text-rose-600">
              Tafovutlarni yuklashda xatolik yuz berdi. Iltimos qaytadan urinib ko’ring.
            </div>
          )}

          {diffData && selectedProposalId !== null && !isLoadingDiff && (
            <WikiDiffViewer
              lines={diffData.diff.lines}
              summary={diffData.summary}
            />
          )}
        </div>
      </div>
    </section>
  );
}
