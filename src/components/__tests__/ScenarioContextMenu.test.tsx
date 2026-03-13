import { render, screen } from "@testing-library/react";
import { ScenarioContextMenu } from "../ScenarioContextMenu";
import { createRun } from "@/lib/runs";
import { setViewport } from "@/__tests__/utils/responsive";

describe("ScenarioContextMenu", () => {
  const run = createRun("another-bug-hunt", "1-distress-signals");

  it("renders campaign name", () => {
    render(
      <ScenarioContextMenu
        campaignId="another-bug-hunt"
        runId={run.id}
        viewState="briefing"
        onProceedToSession={() => {}}
        onBack={() => {}}
      />
    );
    expect(screen.getByText(/Another Bug Hunt/)).toBeInTheDocument();
  });

  it("renders New Character and Talk to Warden buttons", () => {
    render(
      <ScenarioContextMenu
        campaignId="another-bug-hunt"
        runId={run.id}
        viewState="briefing"
        onProceedToSession={() => {}}
        onBack={() => {}}
      />
    );
    expect(screen.getByRole("button", { name: "New Character" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Talk to Warden" })).toBeInTheDocument();
  });

  it("renders without overflow at mobile viewport", () => {
    setViewport("mobile");
    const { container } = render(
      <ScenarioContextMenu
        campaignId="another-bug-hunt"
        runId={run.id}
        viewState="briefing"
        onProceedToSession={() => {}}
        onBack={() => {}}
      />
    );
    const toolbar = container.querySelector(".flex.flex-wrap");
    expect(toolbar).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Talk to Warden" })).toBeVisible();
  });
});
