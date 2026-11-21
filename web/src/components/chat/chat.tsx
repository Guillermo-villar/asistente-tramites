import type { UseChatHelpers } from "@ai-sdk/react";
import { getToolName, isToolUIPart, type UIMessage } from "ai";
import { LockIcon, MicIcon, PhoneOffIcon, PuzzleIcon, RotateCcwIcon } from "lucide-react";
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
import type { ToolPart } from "@/components/ai-elements/tool";
import { LogoMark } from "@/components/brand/logo";
import { AskContext, ToolResultCard, UserWordsContext } from "@/components/chat/tool-cards";
import { VoiceOrb } from "@/components/chat/voice-orb";
import { useVoiceSession } from "@/components/chat/use-voice-session";
import { Button } from "@/components/ui/button";
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
  const voice = useVoiceSession();
  const voiceActive = voice.status !== "idle";
  const voiceLabel = voiceActive ? t.chat.voice.stop : t.chat.voice.start;
  // The first suggestion is about the extension, so it gets the puzzle icon.
  const sugerencias = t.chat.suggestions.map((text, i) => ({ text, icon: i === 0 ? PuzzleIcon : undefined }));
  const send = (text: string) => {
    if (text.trim()) sendMessage({ text });
  };
  const empty = messages.length === 0;
  const userWords = messages
    .filter((m) => m.role === "user")
    .map((m) => m.parts.map((p) => (p.type === "text" ? p.text : "")).join(" ").trim())
    .filter(Boolean);
  const composer = voiceActive ? (
    <div
      className={cn(
        "flex items-center border bg-card",
        empty
          ? "flex-col gap-5 rounded-[24px] border-foreground/10 px-6 py-8 shadow-[0_1px_2px_rgb(0_0_0/0.04),0_20px_48px_-24px_rgb(0_0_0/0.25)]"
          : "gap-4 rounded-2xl px-4 py-3"
      )}
    >
      <VoiceOrb
        className={empty ? "my-3" : "m-1"}
        getLevels={voice.getLevels}
        size={empty ? 136 : 52}
        state={voice.status === "connecting" ? "connecting" : "live"}
      />
      <p className={cn("text-sm text-muted-foreground", empty ? "text-center" : "flex-1")} role="status">
        {voice.status === "connecting" ? t.chat.voice.connecting : t.chat.voice.connected}
      </p>
      {voice.error && <p className="text-xs text-destructive" role="alert">{t.chat.voice[voice.error]}</p>}
      <Button
        aria-label={voiceLabel}
        className={cn("rounded-full", !empty && "size-9")}
        onClick={voice.stop}
        size={empty ? "default" : "icon"}
        title={voiceLabel}
        type="button"
        variant="destructive"
      >
        <PhoneOffIcon aria-hidden="true" />
        {empty && voiceLabel}
      </Button>
    </div>
  ) : (
    <PromptInput
      className={cn(
        "[&_[data-slot=input-group]]:bg-card",
        empty &&
          "[&_[data-slot=input-group]]:rounded-[24px] [&_[data-slot=input-group]]:border-foreground/10 [&_[data-slot=input-group]]:shadow-[0_1px_2px_rgb(0_0_0/0.04),0_20px_48px_-24px_rgb(0_0_0/0.25)]",
        !empty && "[&_[data-slot=input-group]]:rounded-2xl"
      )}
      onSubmit={(m: PromptInputMessage) => send(m.text)}
    >
      <PromptInputBody>
        <PromptInputTextarea
          className={cn(
            empty ? "min-h-24 px-5 pt-5 text-[17px] md:text-[17px]" : "min-h-11 px-3.5 pt-3 text-[15px] md:text-[15px]",
            "placeholder:text-muted-foreground/70"
          )}
          placeholder={empty ? t.chat.placeholderEmpty : t.chat.placeholder}
        />
      </PromptInputBody>
      <PromptInputFooter className={cn(empty ? "px-4 pb-4" : "px-3 pb-3")}>
        <PromptInputTools>
          <span className="flex items-center gap-1.5 px-1 text-xs font-normal text-muted-foreground">
            <LockIcon className="size-3 shrink-0" /> {t.chat.footnote}
          </span>
        </PromptInputTools>
        <div className="flex shrink-0 items-center gap-1">
          <button
            aria-label={voiceLabel}
            className="relative grid size-9 place-items-center rounded-full outline-none transition-transform hover:scale-110 focus-visible:ring-3 focus-visible:ring-ring active:scale-95"
            onClick={() => void voice.start()}
            title={voiceLabel}
            type="button"
          >
            <VoiceOrb size={32} state="idle" />
            <MicIcon aria-hidden="true" className="absolute size-3.5 text-white drop-shadow-[0_1px_1px_rgb(0_0_0/0.35)]" />
          </button>
          <PromptInputSubmit
            className="size-9 rounded-full bg-brand-red-solid text-white hover:bg-brand-red-solid/90"
            onStop={stop}
            status={status}
          />
        </div>
      </PromptInputFooter>
      {voice.error && <p className="px-4 pb-3 text-xs text-destructive" role="alert">{t.chat.voice[voice.error]}</p>}
    </PromptInput>
  );

  if (empty) {
    return (
      <div className={cn("max-w-2xl", className)}>
        {composer}
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          {sugerencias.map((s) => (
            <button
              key={s.text}
              className="inline-flex items-center gap-1.5 rounded-full border bg-background px-3.5 py-1.5 text-[13px] text-foreground/75 transition-colors hover:border-brand-red/40 hover:text-brand-red"
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
      <UserWordsContext.Provider value={userWords}>
        <div
          className={cn(
            "flex h-[680px] max-h-[calc(100dvh-6rem)] min-h-[460px] max-w-3xl flex-col overflow-hidden rounded-3xl border bg-card shadow-[0_1px_2px_rgb(0_0_0/0.04),0_24px_60px_-24px_rgb(0_0_0/0.18)]",
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
                voice.stop();
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
      </UserWordsContext.Provider>
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

  return (
    <ToolResultCard name={name} output={part.output} />
  );
}
