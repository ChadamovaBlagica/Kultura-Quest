import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useCulturalData } from '../context/CulturalContext';
import { VerificationBadge } from '../components/VerificationBadge';
import { Quest, QuestType } from '../types';
import {
  Award,
  Sparkles,
  QrCode,
  CheckCircle2,
  HelpCircle,
  ArrowRight,
  BookOpen,
  Compass,
  Check,
  X,
  RotateCcw,
} from 'lucide-react';

interface QuestsPageProps {
  navigate: (route: string) => void;
}

export const QuestsPage: React.FC<QuestsPageProps> = ({ navigate }) => {
  const { t } = useLanguage();
  const { quests, passport, completeQuest } = useCulturalData();

  const [selectedType, setSelectedType] = useState<string>('all');
  const [activeQuest, setActiveQuest] = useState<Quest | null>(null);

  // Active Quest solving modal state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [questFinished, setQuestFinished] = useState(false);

  // QR Code Simulator
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [qrCodeInput, setQrCodeInput] = useState('');
  const [qrError, setQrError] = useState('');

  const questTypes: { id: string; labelMK: string; labelEN: string }[] = [
    { id: 'all', labelMK: 'Сите мисии', labelEN: 'All Quests' },
    { id: 'art_explorer', labelMK: 'Уметнички истражувач', labelEN: 'Art Explorer' },
    { id: 'history_detective', labelMK: 'Историски детектив', labelEN: 'History Detective' },
    { id: 'hidden_gem', labelMK: 'Ловец на скриени бисери', labelEN: 'Hidden Gem Hunter' },
    { id: 'local_creator', labelMK: 'Локален творец и занаети', labelEN: 'Local Creator' },
  ];

  const filteredQuests = quests.filter((q) => {
    return selectedType === 'all' || q.type === selectedType;
  });

  const handleStartQuest = (quest: Quest) => {
    setActiveQuest(quest);
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setIsCorrect(false);
    setQuestFinished(false);
  };

  const handleSubmitAnswer = () => {
    if (selectedOption === null || !activeQuest) return;

    const currentQ = activeQuest.questions[currentQuestionIndex];
    const correct = selectedOption === currentQ.correctAnswerIndex;
    setIsCorrect(correct);
    setIsAnswerSubmitted(true);
  };

  const handleNextQuestion = () => {
    if (!activeQuest) return;

    if (currentQuestionIndex + 1 < activeQuest.questions.length) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
      setIsCorrect(false);
    } else {
      // Finished all questions!
      completeQuest(activeQuest.id, activeQuest.points, activeQuest.badgeAwarded);
      setQuestFinished(true);
    }
  };

  const handleQrSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setQrError('');
    const matchedQuest = quests.find(
      (q) => q.qrCodeValue.toLowerCase() === qrCodeInput.trim().toLowerCase()
    );

    if (matchedQuest) {
      setQrModalOpen(false);
      setQrCodeInput('');
      handleStartQuest(matchedQuest);
    } else {
      setQrError(t('Невалиден QR код. Обиди се со пример код подолу.', 'Invalid QR code. Try sample code below.'));
    }
  };

  const handleUseSampleQr = (sampleCode: string) => {
    setQrCodeInput(sampleCode);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-10">
      {/* Editorial Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-stone-200 pb-6">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-amber-800 font-semibold">
            <Award className="w-4 h-4" />
            <span>{t('ИНТЕРАКТИВНИ КУЛТУРНИ МИСИИ', 'INTERACTIVE CULTURAL QUESTS')}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-stone-900">
            {t('Учи, истражувај и заработи поени', 'Explore, Learn & Earn Cultural XP')}
          </h1>
          <p className="text-stone-600 text-sm leading-relaxed">
            {t(
              'Секоја мисија пренесува автентична културна приказна од Скопје. Одговори на прашањата на локациите за да го надградиш својот Дигитален пасош.',
              'Every quest reveals authentic local history. Answer verified questions on-site or online to level up your Digital Cultural Passport.'
            )}
          </p>
        </div>

        {/* QR Scanner Simulator Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setQrModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-medium cursor-pointer transition-colors shadow-xs"
          >
            <QrCode className="w-4 h-4 text-amber-400" />
            <span>{t('Скенирај QR мисија', 'Simulate QR Code')}</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {questTypes.map((tItem) => {
          const isSelected = selectedType === tItem.id;
          return (
            <button
              key={tItem.id}
              onClick={() => setSelectedType(tItem.id)}
              className={`px-3.5 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                isSelected
                  ? 'bg-blue-900 text-white'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              {t(tItem.labelMK, tItem.labelEN)}
            </button>
          );
        })}
      </div>

      {/* Quest Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredQuests.map((quest) => {
          const isCompleted = passport.completedQuestIds.includes(quest.id);

          return (
            <div
              key={quest.id}
              className={`bg-white border rounded-xl p-6 flex flex-col justify-between space-y-4 transition-all ${
                isCompleted
                  ? 'border-emerald-300 bg-emerald-50/20'
                  : 'border-stone-200 hover:border-stone-400 shadow-xs'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-amber-800 bg-amber-100/70 px-2 py-0.5 rounded">
                    +{quest.points} XP
                  </span>
                  {isCompleted ? (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{t('Завршено', 'Completed')}</span>
                    </span>
                  ) : (
                    <span className="text-xs font-mono text-stone-400">
                      {quest.questions.length} {t('прашања', 'questions')}
                    </span>
                  )}
                </div>

                <h3 className="text-lg font-serif font-bold text-stone-900">
                  {t(quest.title.mk, quest.title.en)}
                </h3>

                <p className="text-xs text-stone-500 font-mono flex items-center gap-1">
                  <span>{t(quest.venueName.mk, quest.venueName.en)}</span>
                </p>

                <p className="text-xs text-stone-600 leading-relaxed">
                  {t(quest.description.mk, quest.description.en)}
                </p>
              </div>

              <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
                <span className="text-[11px] font-mono text-stone-400">
                  {quest.isOnlineFeasible ? t('Онлајн достапно', 'Online ready') : t('На лице место', 'On-site')}
                </span>

                <button
                  onClick={() => handleStartQuest(quest)}
                  className={`px-4 py-2 rounded text-xs font-semibold cursor-pointer transition-colors ${
                    isCompleted
                      ? 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                      : 'bg-blue-900 hover:bg-blue-800 text-white'
                  }`}
                >
                  {isCompleted ? t('Прегледај мисија', 'Review Quest') : t('Започни мисија →', 'Start Quest →')}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ACTIVE QUEST SOLVING MODAL */}
      {activeQuest && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-stone-300 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-xl">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 border-b border-stone-200 pb-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-mono text-amber-800 font-bold uppercase">
                  <span>+{activeQuest.points} XP</span>
                  <span aria-hidden="true">·</span>
                  <span>{t(activeQuest.venueName.mk, activeQuest.venueName.en)}</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900 mt-1">
                  {t(activeQuest.title.mk, activeQuest.title.en)}
                </h2>
              </div>
              <button
                onClick={() => setActiveQuest(null)}
                className="p-1 text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {!questFinished ? (
              <div className="space-y-6">
                {/* Cultural Storyteller Clue Box */}
                <div className="p-4 bg-[#FAF7F0] border border-stone-200 rounded-lg space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-stone-800 uppercase font-mono">
                    <BookOpen className="w-3.5 h-3.5 text-stone-600" />
                    <span>{t('Историски & културен контекст', 'Historical Clue & Story')}</span>
                  </div>
                  <p className="text-xs text-stone-700 leading-relaxed">
                    {t(activeQuest.culturalBackground.mk, activeQuest.culturalBackground.en)}
                  </p>
                </div>

                {/* Question Section */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs font-mono text-stone-500">
                    <span>
                      {t('Прашање', 'Question')} {currentQuestionIndex + 1} / {activeQuest.questions.length}
                    </span>
                    <span>
                      {passport.completedQuestIds.includes(activeQuest.id) && t('(Веќе решено)', '(Already Solved)')}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-stone-900">
                    {t(
                      activeQuest.questions[currentQuestionIndex].question.mk,
                      activeQuest.questions[currentQuestionIndex].question.en
                    )}
                  </h3>

                  {/* Options */}
                  <div className="space-y-2 pt-2">
                    {activeQuest.questions[currentQuestionIndex].options.mk.map((optMK, idx) => {
                      const optEN = activeQuest.questions[currentQuestionIndex].options.en[idx];
                      const isOptionSelected = selectedOption === idx;

                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => !isAnswerSubmitted && setSelectedOption(idx)}
                          disabled={isAnswerSubmitted}
                          className={`w-full text-left p-3 rounded-lg border text-xs font-medium transition-colors cursor-pointer flex items-center justify-between ${
                            isAnswerSubmitted
                              ? idx === activeQuest.questions[currentQuestionIndex].correctAnswerIndex
                                ? 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold'
                                : isOptionSelected
                                ? 'bg-red-50 border-red-400 text-red-950'
                                : 'bg-stone-50 border-stone-200 text-stone-400'
                              : isOptionSelected
                              ? 'bg-blue-50 border-blue-900 text-blue-950 font-bold'
                              : 'bg-white border-stone-200 hover:bg-stone-50 text-stone-800'
                          }`}
                        >
                          <span>{t(optMK, optEN)}</span>
                          {isAnswerSubmitted && idx === activeQuest.questions[currentQuestionIndex].correctAnswerIndex && (
                            <Check className="w-4 h-4 text-emerald-600" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Explanation on Answer Submission */}
                {isAnswerSubmitted && (
                  <div
                    className={`p-3 rounded-lg text-xs leading-relaxed ${
                      isCorrect ? 'bg-emerald-50 text-emerald-900' : 'bg-amber-50 text-amber-900'
                    }`}
                  >
                    <div className="font-bold mb-1">
                      {isCorrect ? t('Одлично! Точен одговор.', 'Correct!') : t('Обиди се повторно!', 'Incorrect')}
                    </div>
                    {t(
                      activeQuest.questions[currentQuestionIndex].explanation.mk,
                      activeQuest.questions[currentQuestionIndex].explanation.en
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-200">
                  {!isAnswerSubmitted ? (
                    <button
                      onClick={handleSubmitAnswer}
                      disabled={selectedOption === null}
                      className="px-5 py-2 bg-blue-900 hover:bg-blue-800 disabled:bg-stone-300 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                    >
                      {t('Потврди одговор', 'Submit Answer')}
                    </button>
                  ) : (
                    <button
                      onClick={handleNextQuestion}
                      className="px-5 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <span>
                        {currentQuestionIndex + 1 < activeQuest.questions.length
                          ? t('Следно прашање →', 'Next Question →')
                          : t('Заврши мисија и преземи поени →', 'Finish Quest & Claim XP →')}
                      </span>
                    </button>
                  )}
                </div>
              </div>
            ) : (
              /* Quest Success Celebration View */
              <div className="text-center py-6 space-y-4">
                <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
                  <Award className="w-8 h-8" />
                </div>

                <div className="space-y-1">
                  <h3 className="text-2xl font-serif font-bold text-stone-900">
                    {t('Честитки! Мисијата е завршена!', 'Congratulations! Quest Completed!')}
                  </h3>
                  <p className="text-sm text-stone-600 max-w-md mx-auto">
                    {t(
                      `Заработи +${activeQuest.points} XP и го збогати твојот Дигитален културен пасош на Скопје.`,
                      `Earned +${activeQuest.points} XP! Your Digital Cultural Passport has been updated.`
                    )}
                  </p>
                </div>

                <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
                  <button
                    onClick={() => {
                      setActiveQuest(null);
                      navigate('passport');
                    }}
                    className="px-5 py-2.5 bg-blue-900 text-white text-xs font-semibold rounded-lg hover:bg-blue-800 transition-colors cursor-pointer"
                  >
                    {t('Погледни го пасошот и напредокот', 'View Passport Progression')}
                  </button>
                  <button
                    onClick={() => setActiveQuest(null)}
                    className="px-4 py-2.5 bg-stone-100 text-stone-700 text-xs font-medium rounded-lg hover:bg-stone-200 transition-colors cursor-pointer"
                  >
                    {t('Назад кон мисиите', 'Back to Quests')}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* QR Code Simulator Modal */}
      {qrModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-stone-300 rounded-xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div className="flex items-center gap-2">
                <QrCode className="w-4 h-4 text-stone-700" />
                <h3 className="text-sm font-serif font-bold text-stone-900">
                  {t('QR Мисија Симулатор', 'QR Quest Simulator')}
                </h3>
              </div>
              <button
                onClick={() => setQrModalOpen(false)}
                className="p-1 text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-stone-600 leading-relaxed">
              {t(
                'На културните локации во Скопје се поставуваат QR ознаки. Внеси го кодот или кликни на пример за веднаш да ја активираш соодветната мисија.',
                'At partner cultural locations in Skopje, physical QR signs trigger interactive quests. Enter a code or tap below to test.'
              )}
            </p>

            <form onSubmit={handleQrSubmit} className="space-y-3">
              <input
                type="text"
                placeholder="KQ-QUEST-MSU-SOLIDARITY-2026"
                value={qrCodeInput}
                onChange={(e) => setQrCodeInput(e.target.value)}
                className="w-full p-2.5 border border-stone-300 rounded-md font-mono text-xs text-stone-900 uppercase"
              />

              {qrError && <div className="text-xs text-red-600">{qrError}</div>}

              {/* Sample QR Codes Quick Tap */}
              <div className="space-y-1.5 pt-1">
                <div className="text-[10px] font-mono uppercase text-stone-600 font-medium">
                  {t('Примери на QR кодови:', 'Available Demo QR codes:')}
                </div>
                <div className="space-y-1">
                  <button
                    type="button"
                    onClick={() => handleUseSampleQr('KQ-QUEST-MSU-SOLIDARITY-2026')}
                    className="block w-full text-left p-1.5 bg-stone-50 hover:bg-stone-100 rounded text-[11px] font-mono text-blue-900 border border-stone-200 cursor-pointer truncate"
                  >
                    KQ-QUEST-MSU-SOLIDARITY-2026 (МСУ Скопје)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUseSampleQr('KQ-QUEST-STATION-517-SKOPJE')}
                    className="block w-full text-left p-1.5 bg-stone-50 hover:bg-stone-100 rounded text-[11px] font-mono text-blue-900 border border-stone-200 cursor-pointer truncate"
                  >
                    KQ-QUEST-STATION-517-SKOPJE (Часовник 5:17)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUseSampleQr('KQ-QUEST-FILIGREE-CRAFT-SKOPJE')}
                    className="block w-full text-left p-1.5 bg-stone-50 hover:bg-stone-100 rounded text-[11px] font-mono text-blue-900 border border-stone-200 cursor-pointer truncate"
                  >
                    KQ-QUEST-FILIGREE-CRAFT-SKOPJE (Филигран)
                  </button>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setQrModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-stone-600 hover:text-stone-900 cursor-pointer"
                >
                  {t('Откажи', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-900 text-white text-xs font-semibold rounded cursor-pointer hover:bg-blue-800"
                >
                  {t('Активирај мисија', 'Activate Quest')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
