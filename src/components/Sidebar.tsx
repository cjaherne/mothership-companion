"use client";

import { listCampaignIds, getCampaign } from "@/campaigns";
import type { CampaignId } from "@/campaigns";

export const PDF_DOCS = [
  { src: "/Player-Survival-Guide-v1.2.pdf", title: "Player's Survival Guide" },
  { src: "/Shipbreakers-Toolkit-v1.2.pdf", title: "Shipbreaker's Toolkit" },
] as const;

interface SidebarProps {
  selectedCampaignId: CampaignId | null;
  onSelectCampaign: (id: CampaignId | null) => void;
  onOpenPdf?: (src: string, title: string) => void;
}

export function Sidebar({ selectedCampaignId, onSelectCampaign, onOpenPdf }: SidebarProps) {
  const campaignIds = listCampaignIds().filter((id) => id !== "warden");

  return (
    <aside className="flex h-full w-56 flex-col border-r border-amber-950/50 bg-black/80">
      <div className="border-b border-amber-950/50 p-4">
        <h2 className="text-xs font-medium uppercase tracking-widest text-amber-800/80">
          Campaigns
        </h2>
      </div>
      <nav className="flex-1 space-y-0.5 p-2">
        {campaignIds.map((id) => {
          const campaign = getCampaign(id);
          const isSelected = selectedCampaignId === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onSelectCampaign(isSelected ? null : id)}
              className={`w-full rounded px-3 py-2.5 text-left text-sm transition-all ${
                isSelected
                  ? "bg-amber-950/50 text-amber-200 ring-1 ring-amber-700/50"
                  : "text-amber-900/90 hover:bg-amber-950/30 hover:text-amber-200"
              }`}
            >
              {campaign.name}
            </button>
          );
        })}
      </nav>
      <div className="border-t border-amber-950/50 p-4 space-y-2">
        <h3 className="text-[10px] font-medium uppercase tracking-widest text-amber-800/60">
          Rules
        </h3>
        {PDF_DOCS.map((doc) => (
          <button
            key={doc.src}
            type="button"
            onClick={() => onOpenPdf?.(doc.src, doc.title)}
            className="block w-full rounded px-2 py-1.5 text-left text-xs text-amber-700/90 hover:bg-amber-950/30 hover:text-amber-200"
          >
            {doc.title}
          </button>
        ))}
        <button
          type="button"
          onClick={() => onSelectCampaign(null)}
          className="mt-2 block text-xs text-amber-800/60 hover:text-amber-600"
        >
          Clear selection
        </button>
      </div>
    </aside>
  );
}
