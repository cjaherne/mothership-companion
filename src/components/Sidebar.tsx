"use client";

import { listCampaignIds, getCampaign } from "@/campaigns";
import type { CampaignId } from "@/campaigns";

interface SidebarProps {
  selectedCampaignId: CampaignId | null;
  onSelectCampaign: (id: CampaignId | null) => void;
}

export function Sidebar({ selectedCampaignId, onSelectCampaign }: SidebarProps) {
  const campaignIds = listCampaignIds();

  return (
    <aside className="flex h-full w-56 flex-col border-r border-neutral-800 bg-black/50">
      <div className="border-b border-neutral-800 p-4">
        <h2 className="text-xs font-medium uppercase tracking-widest text-neutral-500">
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
                  ? "bg-neon-cyan/10 text-neon-cyan ring-1 ring-neon-cyan/50"
                  : "text-neutral-400 hover:bg-neutral-900 hover:text-neutral-200"
              }`}
            >
              {campaign.name}
            </button>
          );
        })}
      </nav>
      <div className="border-t border-neutral-800 p-4">
        <button
          type="button"
          onClick={() => onSelectCampaign(null)}
          className="text-xs text-neutral-500 hover:text-neutral-300"
        >
          Clear selection
        </button>
      </div>
    </aside>
  );
}
