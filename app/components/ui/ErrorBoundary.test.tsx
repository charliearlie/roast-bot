import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ErrorBoundary, ErrorBoundaryProps } from "./ErrorBoundary";

// Mock component that throws an error
const ThrowError = () => {
  throw new Error("Test error");
};

// Mock console.error to prevent test output noise
const originalError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalError;
});

describe("ErrorBoundary", () => {
  it("renders children when there is no error", () => {
    const { getByText } = render(
      <ErrorBoundary>
        <div>Normal content</div>
      </ErrorBoundary>
    );

    expect(getByText("Normal content")).toBeInTheDocument();
  });

  it("renders error UI when child component throws", () => {
    const { getByText } = render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(getByText("Something went wrong")).toBeInTheDocument();
    expect(getByText("Try again")).toBeInTheDocument();
  });

  it("renders custom fallback when provided", () => {
    const CustomFallback: ErrorBoundaryProps["fallback"] = ({ error }) => (
      <div>Custom error: {error.message}</div>
    );

    const { getByText } = render(
      <ErrorBoundary fallback={CustomFallback}>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(getByText("Custom error: Test error")).toBeInTheDocument();
  });

  it("reloads the page when retry button is clicked", () => {
    const reloadMock = jest.fn();
    Object.defineProperty(window, "location", {
      value: { reload: reloadMock },
      writable: true,
    });

    const { getByText } = render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    fireEvent.click(getByText("Try again"));
    expect(reloadMock).toHaveBeenCalled();
  });
});
