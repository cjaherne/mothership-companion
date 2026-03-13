import { render, screen } from "@testing-library/react";
import Home from "@/app/page";
import { setViewport } from "@/__tests__/utils/responsive";

describe("Layout responsive", () => {
  it("renders header and content at desktop viewport", () => {
    setViewport("desktop");
    render(<Home />);
    expect(screen.getByText("MOTHER")).toBeInTheDocument();
    expect(screen.getByText("Mothership Companion")).toBeInTheDocument();
  });

  it("renders header and content at mobile viewport", () => {
    setViewport("mobile");
    render(<Home />);
    expect(screen.getByText("MOTHER")).toBeInTheDocument();
    expect(screen.getByText("Mothership Companion")).toBeInTheDocument();
  });

  it("shows hamburger button at mobile viewport", () => {
    setViewport("mobile");
    render(<Home />);
    expect(screen.getByLabelText("Open menu")).toBeInTheDocument();
  });

  it("hides hamburger button at desktop viewport", () => {
    setViewport("desktop");
    render(<Home />);
    expect(screen.queryByLabelText("Open menu")).not.toBeInTheDocument();
  });
});
