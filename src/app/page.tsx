"use client";

import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { BriefingLandingPage } from "@/components/BriefingLandingPage";
import { CampaignRunOptions } from "@/components/CampaignRunOptions";
import { RunSetupView } from "@/components/RunSetupView";
import { VoiceSessionView } from "@/components/VoiceSessionView";
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

  return (
    <div className="flex h-screen overflow-hidden bg-black text-neutral-200 scanlines">
      <Sidebar
        selectedCampaignId={selectedCampaignId}
        onSelectCampaign={(id) => {
          setSelectedCampaignId(id);
          setViewState(id ? "campaign" : "home");
          if (!id) setActiveRun(null);
        }}
      />

      <main className="flex flex-1 flex-col overflow-y-auto">
        <header className="border-b border-neutral-800 px-8 py-6">
          <h1 className="text-2xl font-bold tracking-tight">
            <span className="text-neon-cyan">MOTHER</span>
            <span className="text-white">SHIP</span>
            <span className="text-neon-cyan"> COMPANION</span>
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            Voice-interactive Warden for Mothership RPG scenarios
          </p>
        </header>

        <div className="flex-1 p-8">
          {viewState === "session" && activeRun ? (
            <VoiceSessionView
              campaignId={activeRun.campaignId}
              runId={activeRun.runId}
              onExit={handleExitSession}
            />
          ) : viewState === "briefing" && activeRun ? (
            <BriefingLandingPage
              campaignId={activeRun.campaignId}
              runId={activeRun.runId}
              onProceed={handleProceedToSession}
              onBack={() => {
                setActiveRun(null);
                setViewState("campaign");
              }}
            />
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
            <HomeContent />
          )}
        </div>
      </main>
    </div>
  );
}

function HomeContent() {
  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <section>
        <h2 className="mb-4 text-lg font-semibold text-neon-cyan">
          What is this?
        </h2>
        <p className="leading-relaxed text-neutral-300">
          Mothership Companion is a voice-interactive assistant for running
          Mothership RPG scenarios. Connect your microphone, select a campaign,
          and speak with NPCs in real time. The Warden agent processes your
          speech and responds in character—ideal for in-person play where the
          table shares a single device.
        </p>
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold text-neon-cyan">
          Implemented Campaigns
        </h2>
        <p className="mb-6 text-sm text-neutral-500">
          Select a campaign from the sidebar to create a new run or resume a
          previous session.
        </p>
        <div className="rounded-lg border border-neutral-800 bg-neutral-950/50 p-6">
          <p className="text-sm text-neutral-400">
            Campaigns appear in the left sidebar. Click one to get started.
          </p>
        </div>
      </section>

      <section className="rounded-lg border border-neutral-800 p-6">
        <h3 className="mb-2 text-sm font-medium text-neutral-500">
          Quick start
        </h3>
        <ol className="list-inside list-decimal space-y-2 text-sm text-neutral-300">
          <li>Run the LiveKit agent: <code className="rounded bg-neutral-800 px-1.5 py-0.5">npm run agent:dev</code></li>
          <li>Choose a campaign from the sidebar</li>
          <li>Create a new run or resume a previous one</li>
          <li>Connect and speak with the Warden</li>
        </ol>
      </section>
    </div>
  );
}
