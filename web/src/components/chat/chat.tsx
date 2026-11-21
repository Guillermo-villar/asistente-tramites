import { useChat } from "@ai-sdk/react";
import { isToolUIPart, getToolName, type UIMessage } from "ai";
import { BadgeCheckIcon, CalendarClockIcon, FileTextIcon, LandmarkIcon, ListChecksIcon } from "lucide-react";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputBody,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
  type PromptInputMessage,
} from "@/components/ai-elements/prompt-input";
import { Reasoning, ReasoningContent, ReasoningTrigger } from "@/components/ai-elements/reasoning";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { Source, Sources, SourcesContent, SourcesTrigger } from "@/components/ai-elements/sources";
import { Tool, ToolContent, ToolHeader, ToolInput, ToolOutput, type ToolPart } from "@/components/ai-elements/tool";
import { LogoMark, Waves } from "@/components/brand/logo";
import { ToolResultCard, toolLabels } from "@/components/chat/tool-cards";
import { MockTramitesTransport } from "@/lib/mock-transport";

const transport = new MockTramitesTransport();

const sugerencias = [
  { icon: BadgeCheckIcon, titulo: "Necesito el NIE", texto: "Necesito sacar el NIE, ¿qué tengo que llevar?" },
  { icon: ListChecksIcon, titulo: "¿Cómo van mis trámites?", texto: "¿Cómo van mis trámites?" },
  { icon: CalendarClockIcon, titulo: "Buscar cita previa", texto: "Búscame cita para el NIE" },
  { icon: LandmarkIcon, titulo: "Empadronarme", texto: "Quiero empadronarme en Madrid" },
  { icon: FileTextIcon, titulo: "Hacer la renta", texto: "¿Cómo hago la declaración de la renta?" },
];

export function Chat() {
  const { messages, sendMessage, status, stop } = useChat({ transport });

  const send = (text: string) => {
    if (text.trim()) sendMessage({ text });
  };
  const onSubmit = (m: PromptInputMessage) => send(m.text);
  const empty = messages.length === 0;

  return (
    <div className="flex h-full min-h-0 flex-col">
      {empty ? (
        <div className="flex flex-1 flex-col items-center justify-center overflow-y-auto px-4 py-10">
          <div className="w-full max-w-2xl">
            <LogoMark size={44} />
            <h1 className="mt-6 font-slab text-3xl leading-tight tracking-tight sm:text-4xl">
              ¿Qué trámite necesitas hoy?
            </h1>
            <p className="mt-3 max-w-lg text-muted-foreground">
              Te digo qué necesitas, busco cita y sigo el estado por ti. Tú revisas y firmas: nada se envía sin tu
              confirmación.
            </p>
            <Waves className="mt-6" />
            <div className="mt-6">
              <Composer onSubmit={onSubmit} status={status} stop={stop} />
            </div>
            <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {sugerencias.map((s) => (
                <button
                  key={s.titulo}
                  className="group flex items-center gap-3 rounded-xl border bg-card px-3.5 py-3 text-left text-sm transition-colors hover:border-foreground/20 hover:bg-muted/50"
                  onClick={() => send(s.texto)}
                  type="button"
                >
                  <s.icon className="size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-brand-red" />
                  <span className="font-medium">{s.titulo}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <>
          <Conversation className="min-h-0 flex-1">
            <ConversationContent className="mx-auto w-full max-w-3xl gap-6 px-4 py-8">
              {messages.map((m, i) => (
                <ChatMessage
                  key={m.id}
                  message={m}
                  streaming={status === "streaming" && i === messages.length - 1}
                />
              ))}
              {status === "submitted" && (
                <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
                  <LogoMark size={18} />
                  <Shimmer>Leyendo tu consulta…</Shimmer>
                </div>
              )}
            </ConversationContent>
            <ConversationScrollButton />
          </Conversation>
          <div className="mx-auto w-full max-w-3xl px-4 pb-4">
            <Composer onSubmit={onSubmit} status={status} stop={stop} />
            <p className="mt-2 text-center text-[11px] text-muted-foreground">
              Servicio no oficial. Revisa siempre la información en la sede electrónica antes de presentar.
            </p>
          </div>
        </>
      )}
    </div>
  );
}

function Composer({
  onSubmit,
  status,
  stop,
}: {
  onSubmit: (m: PromptInputMessage) => void;
  status: ReturnType<typeof useChat>["status"];
  stop: () => void;
}) {
  return (
    <PromptInput className="rounded-2xl bg-card shadow-[0_1px_2px_rgb(0_0_0/0.04),0_8px_24px_-12px_rgb(0_0_0/0.12)]" onSubmit={onSubmit}>
      <PromptInputBody>
        <PromptInputTextarea />
      </PromptInputBody>
      <PromptInputFooter>
        <PromptInputTools>
          <span className="px-2 text-xs text-muted-foreground">Conectado con Cl@ve</span>
        </PromptInputTools>
        <PromptInputSubmit onStop={stop} status={status} />
      </PromptInputFooter>
    </PromptInput>
  );
}

function ChatMessage({ message, streaming }: { message: UIMessage; streaming: boolean }) {
  const sources = message.parts.filter((p) => p.type === "source-url");

  return (
    <Message from={message.role}>
      <MessageContent className="w-full">
        {message.parts.map((part, i) => {
          const key = `${message.id}-${i}`;
          if (part.type === "text") {
            return <MessageResponse key={key}>{part.text}</MessageResponse>;
          }
          if (part.type === "reasoning") {
            return (
              <Reasoning key={key} className="mb-0" isStreaming={streaming && part.state === "streaming"}>
                <ReasoningTrigger />
                <ReasoningContent>{part.text}</ReasoningContent>
              </Reasoning>
            );
          }
          if (isToolUIPart(part)) {
            return <ToolBlock key={key} part={part} />;
          }
          return null;
        })}
        {sources.length > 0 && (
          <Sources>
            <SourcesTrigger count={sources.length} />
            <SourcesContent>
              {sources.map((s) => (
                <Source key={s.sourceId} href={s.url} title={s.title ?? s.url} />
              ))}
            </SourcesContent>
          </Sources>
        )}
      </MessageContent>
    </Message>
  );
}

function ToolBlock({ part }: { part: ToolPart }) {
  const name = getToolName(part);
  const label = toolLabels[name] ?? { running: `${name}…`, done: name };

  if (part.state !== "output-available") {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span className="size-1.5 animate-pulse rounded-full bg-brand-red" />
        <Shimmer>{label.running}</Shimmer>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <ToolResultCard name={name} output={part.output} />
      {/* Raw call, for transparency: what the assistant asked and what came back. */}
      <Tool className="mb-0 border-dashed">
        <ToolHeader title={`Consultado: ${label.done}`} type={part.type as `tool-${string}`} state={part.state} />
        <ToolContent>
          <ToolInput input={part.input} />
          <ToolOutput errorText={part.errorText} output={part.output} />
        </ToolContent>
      </Tool>
    </div>
  );
}
