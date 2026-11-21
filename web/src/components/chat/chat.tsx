import type { UseChatHelpers } from "@ai-sdk/react";
import { getToolName, isToolUIPart, type UIMessage } from "ai";
import { PuzzleIcon, RotateCcwIcon } from "lucide-react";
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
import { LogoMark } from "@/components/brand/logo";
import { AskContext, ToolResultCard } from "@/components/chat/tool-cards";
import { useI18n } from "@/i18n/i18n";
import { cn } from "@/lib/utils";

export type ChatHelpers = UseChatHelpers<UIMessage>;

/**
 * The assistant, embedded in the landing hero. Empty, it is just a prompt box with a few
 * suggestions; once the conversation starts it opens into a full panel.
 */
export function ChatPanel({ chat, className }: { chat: ChatHelpers; className?: string }) {
  const { messages, sendMessage, status, stop, setMessages } = chat;
  const { t } = useI18n();
  // The first suggestion is about the extension, so it gets the puzzle icon.
  const sugerencias = t.chat.suggestions.map((text, i) => ({ text, icon: i === 0 ? PuzzleIcon : undefined }));
  const send = (text: string) => {
    if (text.trim()) sendMessage({ text });
  };
  const composer = (
    <PromptInput
      className="rounded-2xl bg-card"
      onSubmit={(m: PromptInputMessage) => send(m.text)}
    >
      <PromptInputBody>
        <PromptInputTextarea className="min-h-11" placeholder={t.chat.placeholder} />
      </PromptInputBody>
      <PromptInputFooter>
        <PromptInputTools>
          <span className="px-2 text-[11px] text-muted-foreground">{t.chat.footnote}</span>
        </PromptInputTools>
        <PromptInputSubmit onStop={stop} status={status} />
      </PromptInputFooter>
    </PromptInput>
  );

  if (messages.length === 0) {
    return (
      <div className={className}>
        <div className="rounded-2xl shadow-[0_1px_2px_rgb(0_0_0/0.04),0_18px_44px_-22px_rgb(0_0_0/0.22)]">
          {composer}
        </div>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {sugerencias.map((s) => (
            <button
              key={s.text}
              className="inline-flex items-center gap-1.5 rounded-full border bg-background px-3 py-1 text-[13px] text-muted-foreground transition-colors hover:border-brand-red/40 hover:text-brand-red"
              onClick={() => send(s.text)}
              type="button"
            >
              {s.icon && <s.icon className="size-3.5 text-brand-red" />}
              {s.text}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <AskContext.Provider value={send}>
      <div
        className={cn(
          "flex h-[600px] max-h-[calc(100dvh-7rem)] min-h-[440px] flex-col overflow-hidden rounded-3xl border bg-card shadow-[0_1px_2px_rgb(0_0_0/0.04),0_24px_60px_-24px_rgb(0_0_0/0.18)]",
          className
        )}
      >
        <header className="flex items-center gap-2.5 border-b px-4 py-2.5">
          <LogoMark size={22} />
          <p className="flex-1 text-sm font-medium">{t.chat.title}</p>
          <button
            className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
            onClick={() => {
              stop();
              setMessages([]);
            }}
            type="button"
          >
            <RotateCcwIcon className="size-3.5" /> {t.chat.reset}
          </button>
        </header>

        <Conversation className="min-h-0 flex-1">
          <ConversationContent className="gap-6 px-5 py-6">
            {messages.map((m, i) => (
              <ChatMessage key={m.id} message={m} streaming={status === "streaming" && i === messages.length - 1} />
            ))}
            {status === "submitted" && (
              <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
                <span className="size-1.5 animate-pulse rounded-full bg-brand-red" />
                <Shimmer>{t.chat.reading}</Shimmer>
              </div>
            )}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>

        <div className="border-t p-3">{composer}</div>
      </div>
    </AskContext.Provider>
  );
}

function ChatMessage({ message, streaming }: { message: UIMessage; streaming: boolean }) {
  const sources = message.parts.filter((p) => p.type === "source-url");

  return (
    <Message from={message.role}>
      <MessageContent className="w-full">
        {message.parts.map((part, i) => {
          const key = `${message.id}-${i}`;
          if (part.type === "text") return <MessageResponse key={key}>{part.text}</MessageResponse>;
          if (part.type === "reasoning") {
            return (
              <Reasoning key={key} className="mb-0" isStreaming={streaming && part.state === "streaming"}>
                <ReasoningTrigger />
                <ReasoningContent>{part.text}</ReasoningContent>
              </Reasoning>
            );
          }
          if (isToolUIPart(part)) return <ToolBlock key={key} part={part} />;
          return null;
        })}
        {sources.length > 0 && (
          <Sources className="mb-0">
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
  const { t } = useI18n();
  const name = getToolName(part);
  const label = t.tools[name] ?? { running: `${name}…`, done: name };

  if (part.state !== "output-available") {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span className="size-1.5 animate-pulse rounded-full bg-brand-red" />
        <Shimmer>{label.running}</Shimmer>
      </div>
    );
  }

  const header =
    part.type === "dynamic-tool" ? (
      <ToolHeader state={part.state} title={t.chat.consulted(label.done)} toolName={part.toolName} type={part.type} />
    ) : (
      <ToolHeader state={part.state} title={t.chat.consulted(label.done)} type={part.type} />
    );

  return (
    <div className="space-y-2">
      <ToolResultCard name={name} output={part.output} />
      {/* The raw call, for transparency: what the assistant asked and what came back. */}
      <Tool className="mb-0 border-dashed">
        {header}
        <ToolContent>
          <ToolInput input={part.input} />
          <ToolOutput errorText={part.errorText} output={part.output} />
        </ToolContent>
      </Tool>
    </div>
  );
}
