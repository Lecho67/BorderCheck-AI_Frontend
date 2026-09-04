import { describe, it, expect } from "vitest";
import { useRef, useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useFocusTrap } from "./useFocusTrap";

function Harness() {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  useFocusTrap(containerRef, open);

  return (
    <div>
      <button onClick={() => setOpen(true)}>abrir</button>
      {open && (
        <div ref={containerRef}>
          <button>uno</button>
          <button>dos</button>
          <button>tres</button>
          <button onClick={() => setOpen(false)}>cerrar</button>
        </div>
      )}
    </div>
  );
}

describe("useFocusTrap", () => {
  it("enfoca el primer elemento focuseable al activarse", async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.click(screen.getByText("abrir"));

    expect(screen.getByText("uno")).toHaveFocus();
  });

  it("Tab desde el último elemento vuelve al primero", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(screen.getByText("abrir"));

    screen.getByText("cerrar").focus();
    await user.tab();

    expect(screen.getByText("uno")).toHaveFocus();
  });

  it("Shift+Tab desde el primer elemento va al último", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(screen.getByText("abrir"));

    expect(screen.getByText("uno")).toHaveFocus();
    await user.tab({ shift: true });

    expect(screen.getByText("cerrar")).toHaveFocus();
  });

  it("al desactivarse, devuelve el foco a lo que estaba activo antes", async () => {
    const user = userEvent.setup();
    render(<Harness />);

    const abrirBtn = screen.getByText("abrir");
    await user.click(abrirBtn);
    expect(screen.getByText("uno")).toHaveFocus();

    await user.click(screen.getByText("cerrar"));

    expect(abrirBtn).toHaveFocus();
  });
});
