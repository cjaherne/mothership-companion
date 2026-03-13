/**
 * Shared matchMedia mock instance for responsive tests.
 * Jest setup initializes and configures it; tests can call setViewport().
 */
import MatchMediaMock from "jest-matchmedia-mock";

export const matchMediaMock = new MatchMediaMock();
