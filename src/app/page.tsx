"use client";

import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { PdfViewerOverlay } from "@/components/PdfViewerOverlay";
import { ScenarioContextMenu } from "@/components/ScenarioContextMenu";
import { BriefingLandingPage } from "@/components/BriefingLandingPage";
import { CampaignRunOptions } from "@/components/CampaignRunOptions";
import { RunSetupView } from "@/components/RunSetupView";
import { ClickToTalkPanel } from "@/components/ClickToTalkPanel";
import { RunStatePanel } from "@/components/RunStatePanel";
import type { CampaignId } from "@/campaigns";
import type { CampaignRun } from "@/lib/runs";

type ViewState = "home" | "campaign" | "setup" | "briefing" | "session";

export default function Home() {
  const [selectedCampaignId, setSelectedCampaignId] =
    useState<CampaignId | null>(null);
  const [viewState, setViewState] = useState<ViewState>("home");
  const [setupRun, setSetupRun] = useState<{
    campaignId: CampaignId;
    run: CampaignRun;
  } | null>(null);
  const [activeRun, setActiveRun] = useState<{
    campaignId: CampaignId;
    runId: string;
  } | null>(null);
  const [scenarioRefreshKey, setScenarioRefreshKey] = useState(0);
  const [pdfOverlay, setPdfOverlay] = useState<{
    src: string;
    title: string;
  } | null>(null);

  const handleSetupRun = (campaignId: CampaignId, run: CampaignRun) => {
    setSetupRun({ campaignId, run });
    setViewState("setup");
  };

  const handleStartFromSetup = (campaignId: CampaignId, runId: string) => {
    setSetupRun(null);
    setActiveRun({ campaignId, runId });
    setViewState("briefing");
  };

  const handleStartRun = (campaignId: CampaignId, runId: string) => {
    setSetupRun(null);
    setActiveRun({ campaignId, runId });
    setViewState("briefing");
  };

  const handleProceedToSession = () => {
    setViewState("session");
  };

  const handleExitSession = () => {
    setViewState("briefing");
  };

  const goHome = () => {
    setSelectedCampaignId(null);
    setSetupRun(null);
    setActiveRun(null);
    setViewState("home");
  };

  return (
    <div className="flex h-screen overflow-hidden bg-neutral-950 text-neutral-100 scanlines">
      <Sidebar
        selectedCampaignId={selectedCampaignId}
        onSelectCampaign={(id) => {
          setSelectedCampaignId(id);
          setViewState(id ? "campaign" : "home");
          if (!id) setActiveRun(null);
        }}
        onOpenPdf={(src, title) => setPdfOverlay({ src, title })}
      />

      {pdfOverlay && (
        <PdfViewerOverlay
          src={pdfOverlay.src}
          title={pdfOverlay.title}
          onClose={() => setPdfOverlay(null)}
        />
      )}

      <main
        className={`flex flex-1 flex-col ${
          viewState === "briefing" ? "overflow-hidden min-h-0" : "overflow-y-auto"
        }`}
      >
        <header className="relative shrink-0 overflow-x-hidden border-b border-neutral-800 bg-black px-8 py-6">
          <div
            className="absolute inset-y-0 left-1/3 right-0 bg-cover bg-center bg-no-repeat opacity-20 overflow-hidden"
            style={{
              backgroundImage: "url(/images/ui/header-bg.png)",
            }}
            aria-hidden
          />
          <div className="relative z-10 py-0.5">
            <button
              type="button"
              onClick={goHome}
              className="text-left text-2xl font-bold leading-tight tracking-tight transition hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-black"
            >
              <span className="text-white">MOTHER</span>
              <span className="text-neon-pink">SHIP</span>
              <span className="text-white"> COMPANION</span>
            </button>
            <p className="mt-1 text-sm text-neutral-400">
              Voice-interactive Warden for Mothership RPG scenarios
            </p>
          </div>
        </header>

        {(viewState === "briefing" || viewState === "session") && activeRun && (
          <ScenarioContextMenu
            campaignId={activeRun.campaignId}
            runId={activeRun.runId}
            viewState={viewState}
            onProceedToSession={handleProceedToSession}
            onScenarioChange={() => setScenarioRefreshKey((k) => k + 1)}
            onBack={() => {
              setActiveRun(null);
              setViewState("campaign");
            }}
          />
        )}

        <div
          className={`flex-1 p-8 bg-black text-white ${
            viewState === "briefing" ? "min-h-0 overflow-hidden flex flex-col" : ""
          }`}
        >
          {viewState === "session" && activeRun ? (
            <div className="flex flex-col gap-6 p-8">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-neutral-100">
                  Voice Session — Warden
                </h3>
                <button
                  type="button"
                  onClick={handleExitSession}
                  className="text-xs text-neutral-500 hover:text-red-400"
                >
                  Exit session
                </button>
              </div>
              <ClickToTalkPanel
                key={`session-${activeRun.runId}-${scenarioRefreshKey}`}
                campaignId={activeRun.campaignId}
                runId={activeRun.runId}
                agentType="warden"
                label="Talk to Warden"
              />
              <RunStatePanel runId={activeRun.runId} campaignId={activeRun.campaignId} />
            </div>
          ) : viewState === "briefing" && activeRun ? (
            <div className="min-h-0 flex-1 flex flex-col">
            <BriefingLandingPage
              key={`briefing-${activeRun.runId}-${scenarioRefreshKey}`}
              campaignId={activeRun.campaignId}
              runId={activeRun.runId}
              onProceed={handleProceedToSession}
            />
            </div>
          ) : viewState === "setup" && setupRun && selectedCampaignId ? (
            <RunSetupView
              campaignId={setupRun.campaignId}
              run={setupRun.run}
              onStart={() => handleStartFromSetup(setupRun.campaignId, setupRun.run.id)}
              onBack={() => {
                setSetupRun(null);
                setViewState("campaign");
              }}
            />
          ) : viewState === "campaign" && selectedCampaignId ? (
            <CampaignRunOptions
              campaignId={selectedCampaignId}
              onStartRun={handleStartRun}
              onSetupRun={handleSetupRun}
            />
          ) : (
            <HomeContent
              onSelectCampaign={(id) => {
                setSelectedCampaignId(id);
                setViewState("campaign");
              }}
            />
          )}
        </div>
      </main>
    </div>
  );
}

interface HomeContentProps {
  onSelectCampaign: (id: CampaignId) => void;
}

function HomeContent({ onSelectCampaign }: HomeContentProps) {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-10">
      {/* Hero - full width */}
      <section className="border-b border-neutral-700 pb-8">
        <h2 className="font-heading mb-3 text-2xl font-bold tracking-tight text-white">
          Mothership Companion
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-neutral-400">
          A voice-interactive Warden for Mothership RPG scenarios. Real-time
          voice chat with NPCs powered by LiveKit and the Vercel AI SDK. Create
          characters, read the briefing, explore locations, and talk to the
          Warden—ideal for in-person play with a shared device.
        </p>
      </section>

      {/* Setup + How to play - two columns on large screens */}
      <div className="grid gap-10 lg:grid-cols-2">
      {/* Setup guide */}
      <section>
        <h3 className="font-heading mb-4 text-lg font-semibold tracking-wide text-amber-200/90">
          Setup
        </h3>
        <div className="space-y-4">
          <div className="rounded-lg border-2 border-neutral-600 bg-neutral-800/60 p-4">
            <h4 className="mb-2 font-medium text-neutral-200">1. Configure environment</h4>
            <p className="mb-2 text-sm text-neutral-400">
              Copy <code className="rounded bg-neutral-700 px-1.5 py-0.5 text-xs text-neutral-200">.env.example</code> to{" "}
              <code className="rounded bg-neutral-700 px-1.5 py-0.5 text-xs text-neutral-200">.env.local</code> and set:
            </p>
            <ul className="list-inside list-disc space-y-1 text-sm text-neutral-400">
              <li><strong className="text-neutral-300">LIVEKIT_URL</strong>, <strong className="text-neutral-300">LIVEKIT_API_KEY</strong>, <strong className="text-neutral-300">LIVEKIT_API_SECRET</strong></li>
              <li><strong className="text-neutral-300">OPENAI_API_KEY</strong> (required for AI and TTS)</li>
              <li><strong className="text-neutral-300">REPLICATE_API_TOKEN</strong> (optional, for character artwork)</li>
            </ul>
          </div>
          <div className="rounded-lg border-2 border-neutral-600 bg-neutral-800/60 p-4">
            <h4 className="mb-2 font-medium text-neutral-200">2. Run the app and agent</h4>
            <p className="mb-3 text-sm text-neutral-400">
              Use two terminals:
            </p>
            <ol className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="shrink-0 font-medium text-neutral-500">Terminal 1:</span>
                <code className="rounded bg-neutral-700 px-2 py-1 text-xs text-neutral-200">npm run dev</code>
              </li>
              <li className="flex items-start gap-2">
                <span className="shrink-0 font-medium text-neutral-500">Terminal 2:</span>
                <code className="rounded bg-neutral-700 px-2 py-1 text-xs text-neutral-200">npm run agent:dev</code>
              </li>
            </ol>
            <p className="mt-3 text-xs text-neutral-500">
              The agent processes voice and must run before you connect.
            </p>
          </div>
        </div>
      </section>

      {/* How to play */}
      <section className="lg:min-w-0">
        <h3 className="font-heading mb-4 text-lg font-semibold tracking-wide text-amber-200/90">
          How to play
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border-2 border-neutral-600 bg-neutral-800/60 p-4">
            <span className="mb-2 inline-block rounded-full bg-amber-900/60 px-2.5 py-0.5 text-xs font-medium text-amber-200">Step 1</span>
            <h4 className="font-medium text-neutral-100">Select a campaign</h4>
            <p className="mt-1 text-sm text-neutral-400">
              Choose from the sidebar (e.g. Another Bug Hunt). Create a new run or resume a previous one.
            </p>
          </div>
          <div className="rounded-lg border-2 border-neutral-600 bg-neutral-800/60 p-4">
            <span className="mb-2 inline-block rounded-full bg-amber-900/60 px-2.5 py-0.5 text-xs font-medium text-amber-200">Step 2</span>
            <h4 className="font-medium text-neutral-100">Create characters</h4>
            <p className="mt-1 text-sm text-neutral-400">
              Add player characters with Mothership stats. Roll random or enter details manually.
            </p>
          </div>
          <div className="rounded-lg border-2 border-neutral-600 bg-neutral-800/60 p-4">
            <span className="mb-2 inline-block rounded-full bg-amber-900/60 px-2.5 py-0.5 text-xs font-medium text-amber-200">Step 3</span>
            <h4 className="font-medium text-neutral-100">Read the briefing</h4>
            <p className="mt-1 text-sm text-neutral-400">
              Review the Background, explore the planet map and locations, and see NPCs in the area.
            </p>
          </div>
          <div className="rounded-lg border-2 border-neutral-600 bg-neutral-800/60 p-4">
            <span className="mb-2 inline-block rounded-full bg-amber-900/60 px-2.5 py-0.5 text-xs font-medium text-amber-200">Step 4</span>
            <h4 className="font-medium text-neutral-100">Talk to the Warden</h4>
            <p className="mt-1 text-sm text-neutral-400">
              Click &quot;Talk to Warden&quot; to connect your mic and speak with NPCs in real time.
            </p>
          </div>
        </div>
      </section>
      </div>

      {/* Campaigns - full width */}
      <section>
        <h3 className="font-heading mb-4 text-lg font-semibold tracking-wide text-amber-200/90">
          Campaigns
        </h3>
        <div className="grid gap-6 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => onSelectCampaign("another-bug-hunt")}
            className="group relative overflow-hidden rounded-lg border-2 border-neutral-600 bg-neutral-800/60 text-left transition hover:border-amber-500/50 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
          >
            <div className="aspect-[3/4] overflow-hidden bg-neutral-700">
              <img
                src="/images/campaigns/another-bug-hunt.png"
                alt="Another Bug Hunt"
                className="h-full w-full object-cover transition group-hover:scale-105"
              />
            </div>
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-4 py-4">
              <h4 className="font-semibold text-white">Another Bug Hunt</h4>
              <p className="text-sm text-neutral-300">Distress Signals scenario</p>
            </div>
          </button>
          <div className="flex aspect-[3/4] flex-col items-center justify-center rounded-lg border-2 border-dashed border-neutral-600 bg-neutral-800/40">
            <span className="text-4xl text-neutral-500">+</span>
            <p className="mt-2 text-sm font-medium text-neutral-500">Future Content</p>
          </div>
        </div>
      </section>
    </div>
  );
}
