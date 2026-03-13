import { render, screen, fireEvent } from "@testing-library/react";
import { Sidebar } from "../Sidebar";
import { setViewport } from "@/__tests__/utils/responsive";

describe("Sidebar", () => {
  it("renders campaign list (excludes Warden, which is a meta-NPC type)", () => {
    render(
      <Sidebar selectedCampaignId={null} onSelectCampaign={() => {}} />
    );
    expect(screen.getByText("Campaigns")).toBeInTheDocument();
    expect(screen.getByText("Another Bug Hunt")).toBeInTheDocument();
    expect(screen.queryByText("Warden")).not.toBeInTheDocument();
  });

  it("highlights selected campaign", () => {
    render(
      <Sidebar
        selectedCampaignId="another-bug-hunt"
        onSelectCampaign={() => {}}
      />
    );
    const btn = screen.getByRole("button", { name: "Another Bug Hunt" });
    expect(btn.className).toContain("bg-neutral-800");
  });

  it("calls onSelectCampaign when campaign clicked", () => {
    const onSelect = jest.fn();
    render(
      <Sidebar selectedCampaignId={null} onSelectCampaign={onSelect} />
    );
    fireEvent.click(screen.getByRole("button", { name: "Another Bug Hunt" }));
    expect(onSelect).toHaveBeenCalledWith("another-bug-hunt");
  });

  it("clears selection when Clear selection clicked", () => {
    const onSelect = jest.fn();
    render(
      <Sidebar
        selectedCampaignId="another-bug-hunt"
        onSelectCampaign={onSelect}
      />
    );
    fireEvent.click(screen.getByText("Clear selection"));
    expect(onSelect).toHaveBeenCalledWith(null);
  });

  describe("responsive", () => {
    it("desktop: sidebar always visible", () => {
      setViewport("desktop");
      render(
        <Sidebar selectedCampaignId={null} onSelectCampaign={() => {}} isOpen={false} onClose={() => {}} />
      );
      expect(screen.getByText("Campaigns")).toBeInTheDocument();
    });

    it("mobile: calls onClose when backdrop clicked", () => {
      setViewport("mobile");
      const onClose = jest.fn();
      render(
        <Sidebar
          selectedCampaignId={null}
          onSelectCampaign={() => {}}
          isOpen={true}
          onClose={onClose}
        />
      );
      const backdrop = screen.getByLabelText("Close menu");
      fireEvent.click(backdrop);
      expect(onClose).toHaveBeenCalled();
    });

    it("mobile: sidebar content visible when isOpen", () => {
      setViewport("mobile");
      render(
        <Sidebar
          selectedCampaignId={null}
          onSelectCampaign={() => {}}
          isOpen={true}
          onClose={() => {}}
        />
      );
      expect(screen.getByText("Campaigns")).toBeInTheDocument();
      expect(screen.getByText("Another Bug Hunt")).toBeInTheDocument();
    });
  });
});
