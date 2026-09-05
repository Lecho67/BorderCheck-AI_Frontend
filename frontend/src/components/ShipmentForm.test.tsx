import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ShipmentForm } from "./ShipmentForm";

function setup(isSubmitting = false) {
  const onSubmit = vi.fn();
  render(<ShipmentForm onSubmit={onSubmit} isSubmitting={isSubmitting} />);
  return { onSubmit };
}

describe("ShipmentForm", () => {
  it("no envía y muestra errores cuando faltan campos obligatorios", async () => {
    const user = userEvent.setup();
    const { onSubmit } = setup();

    await user.click(screen.getByRole("button", { name: /evaluar envío/i }));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByText("Selecciona un país de origen.")).toBeInTheDocument();
    expect(screen.getByText("Describe el producto.")).toBeInTheDocument();
    expect(screen.getByText("El peso debe ser mayor a 0.")).toBeInTheDocument();
  });

  it("mientras evalúa, el botón queda deshabilitado y con el texto de carga", () => {
    setup(true);
    const boton = screen.getByRole("button", { name: /evaluando envío/i });
    expect(boton).toBeDisabled();
  });

  it("un chip de categoría rellena el campo Categoría", async () => {
    const user = userEvent.setup();
    setup();

    await user.click(screen.getByRole("button", { name: "Electrónica" }));

    expect(screen.getByPlaceholderText("Ej. Electrónica")).toHaveValue("Electrónica");
  });

  it("marcar 'Contiene batería de litio' despliega los sub-campos", async () => {
    const user = userEvent.setup();
    setup();

    expect(screen.queryByText("Tipo de batería")).not.toBeInTheDocument();
    await user.click(screen.getByLabelText("Contiene batería de litio"));
    expect(screen.getByText("Tipo de batería")).toBeInTheDocument();
  });
});
