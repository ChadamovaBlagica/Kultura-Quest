import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useCulturalData } from '../context/CulturalContext';
import { VerificationBadge } from '../components/VerificationBadge';
import {
  ShieldAlert,
  CheckCircle2,
  XCircle,
  FileCheck,
  Calendar,
  MapPin,
  ExternalLink,
  Coins,
  Clock,
  Sparkles,
} from 'lucide-react';

interface AdminPageProps {
  navigate: (route: string) => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({ navigate }) => {
  const { t } = useLanguage();
  const { submissions, approveSubmission, rejectSubmission, events } = useCulturalData();

  const [activeTab, setActiveTab] = useState<'pending' | 'all' | 'approved'>('pending');
  const [actionNotice, setActionNotice] = useState<string>('');

  const filteredSubmissions = submissions.filter((s) => {
    if (activeTab === 'pending') return s.status === 'pending';
    if (activeTab === 'approved') return s.status === 'approved';
    return true;
  });

  const handleApprove = (id: string, title: string) => {
    approveSubmission(id);
    setActionNotice(
      t(`Настанот „${title}“ е успешно одобрен и објавен во каталогот!`,
        `Event "${title}" has been approved and published to live catalog!`)
    );
    setTimeout(() => setActionNotice(''), 4000);
  };

  const handleReject = (id: string, title: string) => {
    rejectSubmission(id);
    setActionNotice(
      t(`Настанот „${title}“ е одбиен.`, `Event "${title}" marked as rejected.`)
    );
    setTimeout(() => setActionNotice(''), 4000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Editorial Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-stone-200 pb-6">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-amber-800 font-semibold">
            <ShieldAlert className="w-4 h-4" />
            <span>{t('ДЕМО АДМИНИСТРАТИВЕН ПАНЕЛ', 'DEMO ADMIN VERIFICATION PANEL')}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-stone-900">
            {t('Преглед и верификација на настани', 'Review & Verification of Submissions')}
          </h1>
          <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">
            {t(
              'Овде администраторите на KULTURA QUEST ги прегледуваат предлозите од независни уметници, галерии и организатори пред тие да станат јавно достапни во авантурите.',
              'Inspect organizer submissions, review date/price validity, and approve records for immediate insertion into the live catalog.'
            )}
          </p>
        </div>

        {/* Tab Switch */}
        <div className="flex items-center p-1 bg-stone-100 rounded-lg self-start md:self-auto">
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              activeTab === 'pending'
                ? 'bg-white text-stone-900 shadow-xs font-bold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            {t('За преглед', 'Pending Review')} ({submissions.filter((s) => s.status === 'pending').length})
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              activeTab === 'all'
                ? 'bg-white text-stone-900 shadow-xs font-bold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            {t('Сите поднесоци', 'All')} ({submissions.length})
          </button>
        </div>
      </div>

      {actionNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-lg text-xs font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Submissions List */}
      <div className="space-y-4">
        {filteredSubmissions.length === 0 ? (
          <div className="p-12 text-center bg-white border border-dashed border-stone-300 rounded-xl space-y-2">
            <CheckCircle2 className="w-10 h-10 text-stone-300 mx-auto" />
            <h3 className="text-sm font-serif font-bold text-stone-700">
              {t('Нема поднесоци во оваа категорија', 'No submissions in this view')}
            </h3>
            <p className="text-xs text-stone-500">
              {t('Сите поднесени настани се прегледани.', 'All cultural submissions have been processed.')}
            </p>
          </div>
        ) : (
          filteredSubmissions.map((sub) => (
            <div
              key={sub.id}
              className="bg-white border border-stone-200 rounded-xl p-6 shadow-xs space-y-4 hover:border-stone-400 transition-colors"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 pb-3">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-bold ${
                      sub.status === 'pending'
                        ? 'bg-amber-100 text-amber-900'
                        : sub.status === 'approved'
                        ? 'bg-emerald-100 text-emerald-900'
                        : 'bg-red-100 text-red-900'
                    }`}
                  >
                    {sub.status === 'pending'
                      ? t('ВО ОЧЕКУВАЊЕ НА ПРЕГЛЕД', 'PENDING REVIEW')
                      : sub.status === 'approved'
                      ? t('ОДОБРЕНО И ОБЈАВЕНО', 'APPROVED & PUBLISHED')
                      : t('ОДБИЕНО', 'REJECTED')}
                  </span>
                  <span className="text-xs font-mono text-stone-400">
                    {new Date(sub.submittedAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="text-xs text-stone-500 font-mono">
                  {t('Организатор:', 'Organizer:')} <span className="font-semibold text-stone-800">{sub.organizerName}</span> ({sub.organizerEmail})
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-serif font-bold text-stone-900">{sub.title}</h3>

                <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-stone-600">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-stone-400" />
                    <span>{sub.date} · {sub.startTime} ч.</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-stone-400" />
                    <span>{sub.venue} ({sub.address})</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Coins className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="font-bold text-emerald-800">
                      {sub.priceMKD === 0 ? t('Бесплатно', 'Free') : `${sub.priceMKD} МКД`}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-stone-700 leading-relaxed max-w-3xl">
                  {sub.description}
                </p>
              </div>

              {/* Admin Decision Actions */}
              <div className="pt-3 border-t border-stone-100 flex flex-wrap items-center justify-between gap-3">
                <a
                  href={sub.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-stone-500 hover:text-stone-800 underline flex items-center gap-1 font-mono"
                >
                  <span>{t('Провери изворна веб-страница', 'Verify Source Link')}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>

                {sub.status === 'pending' && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleReject(sub.id, sub.title)}
                      className="px-3.5 py-1.5 border border-red-200 text-red-700 hover:bg-red-50 text-xs font-medium rounded-lg cursor-pointer flex items-center gap-1"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>{t('Одбиј', 'Reject')}</span>
                    </button>

                    <button
                      onClick={() => handleApprove(sub.id, sub.title)}
                      className="px-4 py-1.5 bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg cursor-pointer flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{t('Одобри и објави во каталог', 'Approve & Publish')}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
