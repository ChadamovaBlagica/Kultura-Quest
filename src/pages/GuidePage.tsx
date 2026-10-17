import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useCulturalData } from '../context/CulturalContext';
import {
  Sparkles,
  Send,
  Compass,
  MessageSquare,
  Bot,
  User,
  ShieldCheck,
  RotateCcw,
  Clock,
  Coins,
} from 'lucide-react';

interface GuidePageProps {
  navigate: (route: string) => void;
}

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  isLiveAI?: boolean;
  timestamp: string;
}

export const GuidePage: React.FC<GuidePageProps> = ({ navigate }) => {
  const { language, t } = useLanguage();
  const { venues, events } = useCulturalData();

  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'msg_welcome',
      sender: 'assistant',
      text:
        language === 'mk'
          ? 'Здраво! Јас сум AI Културниот Водич на KULTURA QUEST за Скопје. Постави ми прашање за слободното време, буџетот или омилениот уметнички жанр и ќе ти предложам точно една детална, практична културна патека.'
          : 'Welcome! I am the KULTURA QUEST AI Cultural Guide for Skopje. Ask me for recommendations based on your budget, timeframe, or interests and I will craft one definitive, focused cultural itinerary.',
      isLiveAI: false,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const quickPrompts = [
    {
      mk: 'Што можам да правам викендов во Скопје за под 300 МКД?',
      en: 'What can I do in Skopje this weekend for under 300 MKD?',
    },
    {
      mk: 'Предложи нешто необично и автентично за прв состанок.',
      en: 'Suggest something unusual and authentic for a first date.',
    },
    {
      mk: 'Имам 2 часа слободно време и сакам уметност и фотографија.',
      en: 'I have 2 hours of free time and love photography and contemporary art.',
    },
    {
      mk: 'Препорачај целосно бесплатни културни локации во чаршијата.',
      en: 'Recommend completely free cultural locations in the Old Bazaar.',
    },
  ];

  const handleSendMessage = async (userPromptText?: string) => {
    const textToSend = userPromptText || inputMessage;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: Message = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/guide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          language,
          budgetMKD: 300,
          availableHours: 3,
        }),
      });

      const data = await response.json();
      const botMsg: Message = {
        id: `bot_${Date.now()}`,
        sender: 'assistant',
        text: data.response || 'Извинете, дојде до грешка при препораката.',
        isLiveAI: data.isLiveAI,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error('Error fetching guide response:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Editorial Header */}
      <div className="border-b border-stone-200 pb-4 space-y-2">
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-blue-900 font-semibold">
          <Sparkles className="w-4 h-4" />
          <span>{t('ИНТЕЛИГЕНТЕН КУЛТУРЕН ВОДИЧ', 'AI CULTURAL GUIDE')}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">
          {t('Разговарај со локалниот културен водич', 'Converse with your Cultural Guide')}
        </h1>
        <p className="text-xs text-stone-600 leading-relaxed">
          {t(
            'Секој одговор содржи една прецизно насочена препорака базирана на реални локации во Скопје и почитување на буџет во денари.',
            'Every recommendation yields strictly one focused itinerary grounded in verified Skopje venue data and MKD budgets.'
          )}
        </p>
      </div>

      {/* Quick Prompts */}
      <div className="space-y-2">
        <div className="text-[11px] font-mono uppercase text-stone-500 font-medium">
          {t('Брзи прашања за тестирање:', 'Quick Demo Prompts:')}
        </div>
        <div className="flex flex-wrap gap-2">
          {quickPrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(t(p.mk, p.en))}
              className="text-left text-xs bg-white hover:bg-stone-100 border border-stone-200 hover:border-stone-300 text-stone-800 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
            >
              „{t(p.mk, p.en)}“
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages Box */}
      <div className="bg-white border border-stone-200 rounded-xl p-5 min-h-[420px] max-h-[550px] overflow-y-auto space-y-4 shadow-xs">
        {messages.map((m) => {
          const isUser = m.sender === 'user';

          return (
            <div
              key={m.id}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-mono ${
                  isUser ? 'bg-stone-900 text-white' : 'bg-blue-900 text-white'
                }`}
              >
                {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
              </div>

              <div
                className={`max-w-[85%] rounded-lg p-4 text-xs leading-relaxed ${
                  isUser
                    ? 'bg-stone-900 text-white'
                    : 'bg-[#FAF7F0] border border-stone-200 text-stone-900'
                }`}
              >
                <div className="flex items-center justify-between gap-3 text-[10px] opacity-75 mb-1.5 pb-1 border-b border-stone-200/40">
                  <span className="font-semibold">
                    {isUser ? t('Ти', 'You') : t('KULTURA QUEST Водич', 'KULTURA QUEST Guide')}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {!isUser && (
                      <span className="font-mono text-[9px] uppercase px-1 rounded bg-stone-200 text-stone-700">
                        {m.isLiveAI ? 'Gemini 3.8 Flash' : 'Грундиран модел'}
                      </span>
                    )}
                    <span className="font-mono">{m.timestamp}</span>
                  </div>
                </div>

                <div className="whitespace-pre-wrap">{m.text}</div>
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-stone-500 font-mono italic p-2">
            <Sparkles className="w-3.5 h-3.5 animate-pulse text-blue-900" />
            <span>{t('Водичот размислува и гради една дефинитивна патека...', 'Synthesizing one focused route...')}</span>
          </div>
        )}
      </div>

      {/* Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="flex items-center gap-2"
      >
        <input
          type="text"
          placeholder={t(
            'Напиши прашање (на пр. Имам 3 часа и 200 МКД за современа уметност)...',
            'Ask something (e.g. 3 hours, 200 MKD budget in Skopje)...'
          )}
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          className="flex-1 p-3 text-xs border border-stone-300 rounded-lg bg-white text-stone-900 focus:outline-none focus:border-blue-900"
        />
        <button
          type="submit"
          disabled={!inputMessage.trim() || isLoading}
          className="px-5 py-3 bg-blue-900 hover:bg-blue-800 disabled:bg-stone-300 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
        >
          <Send className="w-3.5 h-3.5" />
          <span>{t('Прашај', 'Send')}</span>
        </button>
      </form>
    </div>
  );
};
