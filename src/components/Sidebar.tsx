"use client";

import { listCampaignIds, getCampaign } from "@/campaigns";
import type { CampaignId } from "@/campaigns";
import { useMediaQuery } from "@/hooks/useMediaQuery";

export const PDF_DOCS = [
  { src: "/Player-Survival-Guide-v1.2.pdf", title: "Player's Survival Guide" },
  { src: "/Shipbreakers-Toolkit-v1.2.pdf", title: "Shipbreaker's Toolkit" },
] as const;

interface SidebarProps {
  selectedCampaignId: CampaignId | null;
  onSelectCampaign: (id: CampaignId | null) => void;
  onOpenPdf?: (src: string, title: string) => void;
  /** Mobile drawer: when true on mobile, sidebar is open; onClose for backdrop/close */
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({
  selectedCampaignId,
  onSelectCampaign,
  onOpenPdf,
  isOpen = true,
  onClose,
}: SidebarProps) {
  const campaignIds = listCampaignIds().filter((id) => id !== "warden");
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const showAsOverlay = !isDesktop;
  const visible = isDesktop || isOpen;

  return (
    <>
      {showAsOverlay && visible && (
        <button
          type="button"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          aria-label="Close menu"
        />
      )}
      <aside
        className={`flex h-full w-56 shrink-0 flex-col border-r border-neutral-800 bg-black transition-transform duration-200 ease-out ${
          showAsOverlay
            ? `fixed inset-y-0 left-0 z-50 ${isOpen ? "translate-x-0" : "-translate-x-full"}`
            : "relative"
        }`}
        aria-hidden={showAsOverlay && !isOpen}
      >
        {showAsOverlay && (
          <button
            type="button"
            onClick={onClose}
            className="absolute right-3 top-4 rounded p-1.5 text-neutral-400 hover:bg-neutral-800 hover:text-white lg:hidden"
            aria-label="Close sidebar"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      <div className="border-b border-neutral-800 p-4">
        <h2 className="text-xs font-medium uppercase tracking-widest text-neutral-400">
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
                  ? "bg-neutral-800 text-white"
                  : "text-neutral-300 hover:bg-neutral-800/50 hover:text-white"
              }`}
            >
              {campaign.name}
            </button>
          );
        })}
      </nav>
      <div className="space-y-2 border-t border-neutral-800 p-4">
        <h3 className="text-[10px] font-medium uppercase tracking-widest text-neutral-400">
          Rules
        </h3>
        {PDF_DOCS.map((doc) => (
          <button
            key={doc.src}
            type="button"
            onClick={() => onOpenPdf?.(doc.src, doc.title)}
            className="block w-full rounded px-2 py-1.5 text-left text-xs text-neutral-300 hover:bg-neutral-800/50 hover:text-white"
          >
            {doc.title}
          </button>
        ))}
        <button
          type="button"
          onClick={() => onSelectCampaign(null)}
          className="mt-2 block text-xs text-neutral-500 hover:text-neutral-300"
        >
          Clear selection
        </button>
      </div>
    </aside>
    </>
  );
}
