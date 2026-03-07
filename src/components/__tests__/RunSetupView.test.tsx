import { render, screen, fireEvent } from "@testing-library/react";
import { RunSetupView } from "../RunSetupView";
import { createRun } from "@/lib/runs";

describe("RunSetupView", () => {
  const mockRun = () => {
    const run = createRun("another-bug-hunt");
    return run;
  };

  it("renders campaign name and add character form", () => {
    const run = mockRun();
    render(
      <RunSetupView
        campaignId="another-bug-hunt"
        run={run}
        onStart={() => {}}
        onBack={() => {}}
      />
    );
    expect(screen.getByText(/Set up: Another Bug Hunt/)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Corporal Vasquez/)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/paranoid, tactical/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Add character/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Start session/ })).toBeDisabled();
  });

  it("enables Start session after adding a character", () => {
    const run = mockRun();
    render(
      <RunSetupView
        campaignId="another-bug-hunt"
        run={run}
        onStart={() => {}}
        onBack={() => {}}
      />
    );
    fireEvent.change(screen.getByPlaceholderText(/Corporal Vasquez/), {
      target: { value: "Corporal Vasquez" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Add character/ }));
    expect(screen.getByText("Corporal Vasquez")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Start session/ })).toBeEnabled();
  });

  it("calls onBack when Back clicked", () => {
    const run = mockRun();
    const onBack = jest.fn();
    render(
      <RunSetupView
        campaignId="another-bug-hunt"
        run={run}
        onStart={() => {}}
        onBack={onBack}
      />
    );
    fireEvent.click(screen.getByText(/Back/));
    expect(onBack).toHaveBeenCalled();
  });
});
