import { useChat } from "@ai-sdk/react";
import { ChatPanel } from "@/components/chat/chat";
import { ExtensionSection, HeroCopy, SiteFooter, SiteHeader } from "@/components/landing/sections";
import { MockTramitesTransport } from "@/lib/mock-transport";

const transport = new MockTramitesTransport();

/** Public landing: the assistant first, then how the browser extension works. */
export default function App() {
  const chat = useChat({ transport });

  return (
    <div className="min-h-dvh bg-background" id="top">
      <SiteHeader />
      <main>
        <section className="scroll-mt-16" id="asistente">
          <div className="mx-auto max-w-5xl px-4 pb-16 pt-16 sm:px-6 sm:pt-24">
            <HeroCopy />
            <ChatPanel chat={chat} className="mx-auto mt-9 max-w-2xl" />
          </div>
        </section>
        <ExtensionSection />
      </main>
      <SiteFooter />
    </div>
  );
}
