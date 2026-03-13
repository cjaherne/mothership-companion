import { render, screen } from "@testing-library/react";
import LoginPage from "../login/page";
import { setViewport } from "@/__tests__/utils/responsive";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn(), refresh: jest.fn() }),
  useSearchParams: () => ({ get: () => null }),
}));

describe("LoginPage", () => {
  it("renders login form with username and password fields", () => {
    render(<LoginPage />);
    expect(screen.getByLabelText("Username")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sign in" })).toBeInTheDocument();
  });

  it("renders MOTHERSHIP COMPANION branding", () => {
    render(<LoginPage />);
    expect(screen.getByText("MOTHER")).toBeInTheDocument();
    expect(screen.getByText("SHIP")).toBeInTheDocument();
    expect(screen.getByText("COMPANION")).toBeInTheDocument();
  });

  it("form fits at mobile viewport", () => {
    setViewport("mobile");
    render(<LoginPage />);
    const form = screen.getByRole("button", { name: "Sign in" }).closest("form");
    expect(form).toBeInTheDocument();
    const container = form?.closest(".max-w-sm");
    expect(container).toBeInTheDocument();
  });
});
