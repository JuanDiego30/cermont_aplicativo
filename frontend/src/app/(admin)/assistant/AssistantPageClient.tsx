'use client';

import { Bot, Sparkles, MessageSquare, Lightbulb } from 'lucide-react';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import { ChatContainer } from '@/features/assistant';

export default function AssistantPageClient() {
  return (
    <div className="flex flex-col gap-6">
      <PageBreadcrumb pageTitle="Asistente IA" />

      {/* Header Card */}
      <div className="rounded-xl border border-gray-200 bg-linear-to-r from-purple-500 to-pink-500 p-6 text-white shadow-lg dark:border-gray-700">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20">
            <Bot className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">Asistente Virtual CERMONT</h1>
            <p className="mt-1 text-white/80">
              Tu asistente inteligente impulsado por IA para consultas sobre operaciones, mantenimiento y gestión de trabajo.
            </p>
          </div>
        </div>

        {/* Features */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="flex items-center gap-3 rounded-lg bg-white/10 p-3">
            <MessageSquare className="h-5 w-5" />
            <div>
              <p className="font-medium">Chat en tiempo real</p>
              <p className="text-sm text-white/70">Respuestas instantáneas</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg bg-white/10 p-3">
            <Lightbulb className="h-5 w-5" />
            <div>
              <p className="font-medium">Conocimiento CERMONT</p>
              <p className="text-sm text-white/70">Especializado en petróleo</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg bg-white/10 p-3">
            <Sparkles className="h-5 w-5" />
            <div>
              <p className="font-medium">IA Avanzada</p>
              <p className="text-sm text-white/70">Powered by LLaMA</p>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Container */}
      <div className="h-[600px]">
        <ChatContainer />
      </div>
    </div>
  );
}
