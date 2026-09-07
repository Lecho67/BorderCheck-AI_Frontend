import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Pagination } from "./Pagination";

describe("Pagination", () => {
  it("no renderiza nada con una sola página", () => {
    const { container } = render(<Pagination page={1} pageCount={1} onChange={() => {}} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("deshabilita 'Anterior' en la primera página", () => {
    render(<Pagination page={1} pageCount={3} onChange={() => {}} />);
    expect(screen.getByRole("button", { name: /anterior/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /siguiente/i })).toBeEnabled();
  });

  it("deshabilita 'Siguiente' en la última página", () => {
    render(<Pagination page={3} pageCount={3} onChange={() => {}} />);
    expect(screen.getByRole("button", { name: /siguiente/i })).toBeDisabled();
  });

  it("emite la página objetivo al navegar", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<Pagination page={2} pageCount={3} onChange={onChange} />);

    await user.click(screen.getByRole("button", { name: /siguiente/i }));
    await user.click(screen.getByRole("button", { name: /anterior/i }));

    expect(onChange).toHaveBeenNthCalledWith(1, 3);
    expect(onChange).toHaveBeenNthCalledWith(2, 1);
  });
});
