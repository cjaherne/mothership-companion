import { render, screen, fireEvent } from "@testing-library/react";
import { Sidebar } from "../Sidebar";

describe("Sidebar", () => {
  it("renders campaign list", () => {
    render(
      <Sidebar selectedCampaignId={null} onSelectCampaign={() => {}} />
    );
    expect(screen.getByText("Campaigns")).toBeInTheDocument();
    expect(screen.getByText("Warden")).toBeInTheDocument();
    expect(screen.getByText("Another Bug Hunt")).toBeInTheDocument();
  });

  it("highlights selected campaign", () => {
    render(
      <Sidebar
        selectedCampaignId="another-bug-hunt"
        onSelectCampaign={() => {}}
      />
    );
    const btn = screen.getByRole("button", { name: "Another Bug Hunt" });
    expect(btn.className).toContain("ring-neon-cyan");
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
});
