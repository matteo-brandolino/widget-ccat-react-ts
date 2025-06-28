import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { CheshireCatWidget } from "../src/CheshireCatWidget";

describe("CheshireCatWidget", () => {
  it("renders with title", () => {
    render(<CheshireCatWidget title="Hello" />);
    expect(screen.getByText("Hello")).toBeInTheDocument();
  });
});
