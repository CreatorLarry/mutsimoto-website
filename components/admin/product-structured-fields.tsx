"use client";

import { useState } from "react";
import { CarFront, Cog, Plus, Trash2, Wrench } from "lucide-react";

const fieldClass =
  "mt-1.5 h-11 w-full rounded-xl border border-[#d8e0e8] bg-white px-3 text-sm text-[#07172b] outline-none transition placeholder:text-[#9aa5b4] focus:border-[#e52833] focus:ring-4 focus:ring-[#e52833]/10";
const labelClass = "block text-[11px] font-extrabold text-[#526176]";

interface SpecificationRow {
  id: string;
  label: string;
  value: string;
  unit: string;
}

interface ReferenceRow {
  id: string;
  type: "oem" | "competitor" | "alternative";
  manufacturer: string;
  number: string;
}

interface VehicleRow {
  id: string;
  brand: string;
  model: string;
  engine: string;
  from: string;
  to: string;
  notes: string;
}

interface EquipmentRow {
  id: string;
  type: string;
  industry: string;
  manufacturer: string;
  model: string;
  engine: string;
  notes: string;
}

interface ProductStructuredFieldsProps {
  specifications?: string;
  references?: string;
  vehicleApplications?: string;
  equipmentApplications?: string;
}

function rows(value = ""): string[][] {
  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line.split("|").map((part) => part.trim()));
}

function clean(value: string): string {
  return value.replaceAll("|", " ").replace(/\r?\n/g, " ").trim();
}

function joinRow(values: string[]): string {
  return values.map(clean).join(" | ");
}

function newId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID()}`;
}

function EmptyRows({
  title,
  description,
  onAdd,
}: {
  title: string;
  description: string;
  onAdd: () => void;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-[#ccd6e0] bg-[#f8fafc] px-5 py-7 text-center">
      <p className="text-sm font-extrabold text-[#344358]">{title}</p>
      <p className="mx-auto mt-1 max-w-lg text-xs leading-5 text-[#7d899a]">{description}</p>
      <button
        type="button"
        onClick={onAdd}
        className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-full border border-[#cfd8e2] bg-white px-4 text-xs font-black text-[#07172b] transition hover:border-[#e52833] hover:text-[#c91f2a] focus:outline-none focus:ring-4 focus:ring-[#e52833]/10"
      >
        <Plus className="size-4" aria-hidden="true" />
        Add first entry
      </button>
    </div>
  );
}

function AddButton({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex min-h-10 items-center gap-2 rounded-full border border-[#cfd8e2] bg-white px-4 text-xs font-black text-[#07172b] transition hover:border-[#e52833] hover:text-[#c91f2a] focus:outline-none focus:ring-4 focus:ring-[#e52833]/10"
    >
      <Plus className="size-4" aria-hidden="true" />
      {children}
    </button>
  );
}

function RemoveButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-[#e3e8ee] text-[#7d899a] transition hover:border-[#efb8bc] hover:bg-[#fff4f5] hover:text-[#c91f2a] focus:outline-none focus:ring-4 focus:ring-[#e52833]/10"
    >
      <Trash2 className="size-4" aria-hidden="true" />
    </button>
  );
}

export function ProductStructuredFields({
  specifications,
  references,
  vehicleApplications,
  equipmentApplications,
}: ProductStructuredFieldsProps) {
  const [specificationRows, setSpecificationRows] = useState<SpecificationRow[]>(() =>
    rows(specifications).map(([label = "", value = "", unit = ""], index) => ({
      id: `spec-${index}`,
      label,
      value,
      unit,
    })),
  );
  const [referenceRows, setReferenceRows] = useState<ReferenceRow[]>(() =>
    rows(references).map(([type = "oem", manufacturer = "", number = ""], index) => ({
      id: `reference-${index}`,
      type: type === "competitor" || type === "alternative" ? type : "oem",
      manufacturer,
      number,
    })),
  );
  const [vehicleRows, setVehicleRows] = useState<VehicleRow[]>(() =>
    rows(vehicleApplications).map(
      ([brand = "", model = "", engine = "", from = "", to = "", notes = ""], index) => ({
        id: `vehicle-${index}`,
        brand,
        model,
        engine,
        from,
        to,
        notes,
      }),
    ),
  );
  const [equipmentRows, setEquipmentRows] = useState<EquipmentRow[]>(() =>
    rows(equipmentApplications).map(
      ([type = "", industry = "", manufacturer = "", model = "", engine = "", notes = ""], index) => ({
        id: `equipment-${index}`,
        type,
        industry,
        manufacturer,
        model,
        engine,
        notes,
      }),
    ),
  );

  const specificationValue = specificationRows
    .map((row) => joinRow([row.label, row.value, row.unit]))
    .join("\n");
  const referenceValue = referenceRows
    .map((row) => joinRow([row.type, row.manufacturer, row.number]))
    .join("\n");
  const vehicleValue = vehicleRows
    .map((row) => joinRow([row.brand, row.model, row.engine, row.from, row.to, row.notes]))
    .join("\n");
  const equipmentValue = equipmentRows
    .map((row) => joinRow([row.type, row.industry, row.manufacturer, row.model, row.engine, row.notes]))
    .join("\n");

  function updateSpecification(id: string, key: keyof Omit<SpecificationRow, "id">, value: string) {
    setSpecificationRows((current) =>
      current.map((row) => (row.id === id ? { ...row, [key]: value } : row)),
    );
  }

  function updateReference(id: string, key: keyof Omit<ReferenceRow, "id">, value: string) {
    setReferenceRows((current) =>
      current.map((row) => (row.id === id ? { ...row, [key]: value } : row)),
    );
  }

  function updateVehicle(id: string, key: keyof Omit<VehicleRow, "id">, value: string) {
    setVehicleRows((current) =>
      current.map((row) => (row.id === id ? { ...row, [key]: value } : row)),
    );
  }

  function updateEquipment(id: string, key: keyof Omit<EquipmentRow, "id">, value: string) {
    setEquipmentRows((current) =>
      current.map((row) => (row.id === id ? { ...row, [key]: value } : row)),
    );
  }

  const addSpecification = () =>
    setSpecificationRows((current) => [...current, { id: newId("spec"), label: "", value: "", unit: "" }]);
  const addReference = () =>
    setReferenceRows((current) => [
      ...current,
      { id: newId("reference"), type: "oem", manufacturer: "", number: "" },
    ]);
  const addVehicle = () =>
    setVehicleRows((current) => [
      ...current,
      { id: newId("vehicle"), brand: "", model: "", engine: "", from: "", to: "", notes: "" },
    ]);
  const addEquipment = () =>
    setEquipmentRows((current) => [
      ...current,
      {
        id: newId("equipment"),
        type: "",
        industry: "",
        manufacturer: "",
        model: "",
        engine: "",
        notes: "",
      },
    ]);

  return (
    <>
      <textarea name="specifications" value={specificationValue} readOnly hidden />
      <textarea name="references" value={referenceValue} readOnly hidden />
      <textarea name="vehicleApplications" value={vehicleValue} readOnly hidden />
      <textarea name="equipmentApplications" value={equipmentValue} readOnly hidden />

      <section className="rounded-[22px] border border-[#e0e6ed] bg-white p-6 shadow-[0_8px_28px_rgba(7,23,43,0.04)] sm:p-8">
        <div className="flex flex-col gap-4 border-b border-[#e9edf2] pb-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Wrench className="size-5 text-[#e52833]" aria-hidden="true" />
              <h2 className="text-lg font-black text-[#07172b]">Technical details</h2>
              <span className="rounded-full bg-[#f0f3f6] px-2 py-1 text-[10px] font-black uppercase tracking-wider text-[#788596]">
                Optional
              </span>
            </div>
            <p className="mt-1 text-xs leading-5 text-[#748196]">
              Add measurements and reference numbers only when you have them.
            </p>
          </div>
          {specificationRows.length > 0 && <AddButton onClick={addSpecification}>Add specification</AddButton>}
        </div>

        <div className="mt-6">
          <h3 className="mb-3 text-sm font-black text-[#26364b]">Specifications</h3>
          {specificationRows.length === 0 ? (
            <EmptyRows
              title="No specifications added"
              description="Add dimensions, thread sizes, filtration ratings, or any other known product measurement."
              onAdd={addSpecification}
            />
          ) : (
            <div className="space-y-3">
              {specificationRows.map((row, index) => (
                <div
                  key={row.id}
                  className="grid gap-3 rounded-2xl border border-[#e3e8ee] bg-[#fbfcfd] p-4 md:grid-cols-[1.1fr_1.1fr_0.55fr_auto]"
                >
                  <label className={labelClass}>
                    Specification <span className="text-[#e52833]">*</span>
                    <input
                      required
                      value={row.label}
                      onChange={(event) => updateSpecification(row.id, "label", event.target.value)}
                      className={fieldClass}
                      placeholder="e.g. Height"
                    />
                  </label>
                  <label className={labelClass}>
                    Value <span className="text-[#e52833]">*</span>
                    <input
                      required
                      value={row.value}
                      onChange={(event) => updateSpecification(row.id, "value", event.target.value)}
                      className={fieldClass}
                      placeholder="e.g. 105"
                    />
                  </label>
                  <label className={labelClass}>
                    Unit
                    <input
                      value={row.unit}
                      onChange={(event) => updateSpecification(row.id, "unit", event.target.value)}
                      className={fieldClass}
                      placeholder="mm"
                    />
                  </label>
                  <div className="flex items-end justify-end">
                    <RemoveButton
                      label={`Remove specification ${index + 1}`}
                      onClick={() =>
                        setSpecificationRows((current) => current.filter((item) => item.id !== row.id))
                      }
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-8 border-t border-[#edf0f3] pt-6">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-black text-[#26364b]">OEM and cross-reference numbers</h3>
              <p className="mt-1 text-xs text-[#7d899a]">Useful when customers search using another part number.</p>
            </div>
            {referenceRows.length > 0 && <AddButton onClick={addReference}>Add reference</AddButton>}
          </div>
          {referenceRows.length === 0 ? (
            <EmptyRows
              title="No reference numbers added"
              description="Add an OEM, competitor, or alternative part number when it is available."
              onAdd={addReference}
            />
          ) : (
            <div className="space-y-3">
              {referenceRows.map((row, index) => (
                <div
                  key={row.id}
                  className="grid gap-3 rounded-2xl border border-[#e3e8ee] bg-[#fbfcfd] p-4 md:grid-cols-[0.8fr_1fr_1fr_auto]"
                >
                  <label className={labelClass}>
                    Reference type
                    <select
                      value={row.type}
                      onChange={(event) =>
                        updateReference(row.id, "type", event.target.value as ReferenceRow["type"])
                      }
                      className={fieldClass}
                    >
                      <option value="oem">OEM number</option>
                      <option value="competitor">Competitor number</option>
                      <option value="alternative">Alternative number</option>
                    </select>
                  </label>
                  <label className={labelClass}>
                    Manufacturer
                    <input
                      value={row.manufacturer}
                      onChange={(event) => updateReference(row.id, "manufacturer", event.target.value)}
                      className={fieldClass}
                      placeholder="e.g. Toyota"
                    />
                  </label>
                  <label className={labelClass}>
                    Reference number <span className="text-[#e52833]">*</span>
                    <input
                      required
                      value={row.number}
                      onChange={(event) => updateReference(row.id, "number", event.target.value)}
                      className={fieldClass}
                      placeholder="e.g. 90915-YZZD2"
                    />
                  </label>
                  <div className="flex items-end justify-end">
                    <RemoveButton
                      label={`Remove reference ${index + 1}`}
                      onClick={() =>
                        setReferenceRows((current) => current.filter((item) => item.id !== row.id))
                      }
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="rounded-[22px] border border-[#e0e6ed] bg-white p-6 shadow-[0_8px_28px_rgba(7,23,43,0.04)] sm:p-8">
        <div className="border-b border-[#e9edf2] pb-5">
          <div className="flex items-center gap-2">
            <Cog className="size-5 text-[#e52833]" aria-hidden="true" />
            <h2 className="text-lg font-black text-[#07172b]">Compatible applications</h2>
            <span className="rounded-full bg-[#f0f3f6] px-2 py-1 text-[10px] font-black uppercase tracking-wider text-[#788596]">
              Optional
            </span>
          </div>
          <p className="mt-1 text-xs leading-5 text-[#748196]">
            Add each known vehicle or equipment fitment separately. These entries power catalogue search.
          </p>
        </div>

        <div className="mt-6">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <CarFront className="size-4 text-[#526176]" aria-hidden="true" />
              <h3 className="text-sm font-black text-[#26364b]">Vehicles</h3>
            </div>
            {vehicleRows.length > 0 && <AddButton onClick={addVehicle}>Add vehicle</AddButton>}
          </div>
          {vehicleRows.length === 0 ? (
            <EmptyRows
              title="No vehicles added"
              description="Add a vehicle brand and model; engine, year range, and notes can be added when known."
              onAdd={addVehicle}
            />
          ) : (
            <div className="space-y-3">
              {vehicleRows.map((row, index) => (
                <div key={row.id} className="rounded-2xl border border-[#e3e8ee] bg-[#fbfcfd] p-4">
                  <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[1fr_1fr_1fr_0.6fr_0.6fr_auto]">
                    <label className={labelClass}>
                      Brand <span className="text-[#e52833]">*</span>
                      <input
                        required
                        value={row.brand}
                        onChange={(event) => updateVehicle(row.id, "brand", event.target.value)}
                        className={fieldClass}
                        placeholder="Toyota"
                      />
                    </label>
                    <label className={labelClass}>
                      Model <span className="text-[#e52833]">*</span>
                      <input
                        required
                        value={row.model}
                        onChange={(event) => updateVehicle(row.id, "model", event.target.value)}
                        className={fieldClass}
                        placeholder="Hilux"
                      />
                    </label>
                    <label className={labelClass}>
                      Engine
                      <input
                        value={row.engine}
                        onChange={(event) => updateVehicle(row.id, "engine", event.target.value)}
                        className={fieldClass}
                        placeholder="1KD-FTV"
                      />
                    </label>
                    <label className={labelClass}>
                      From year
                      <input
                        type="number"
                        min={1900}
                        max={2200}
                        value={row.from}
                        onChange={(event) => updateVehicle(row.id, "from", event.target.value)}
                        className={fieldClass}
                        placeholder="2005"
                      />
                    </label>
                    <label className={labelClass}>
                      To year
                      <input
                        type="number"
                        min={1900}
                        max={2200}
                        value={row.to}
                        onChange={(event) => updateVehicle(row.id, "to", event.target.value)}
                        className={fieldClass}
                        placeholder="2015"
                      />
                    </label>
                    <div className="flex items-end justify-end">
                      <RemoveButton
                        label={`Remove vehicle ${index + 1}`}
                        onClick={() => setVehicleRows((current) => current.filter((item) => item.id !== row.id))}
                      />
                    </div>
                  </div>
                  <label className={`${labelClass} mt-3`}>
                    Notes
                    <input
                      value={row.notes}
                      onChange={(event) => updateVehicle(row.id, "notes", event.target.value)}
                      className={fieldClass}
                      placeholder="e.g. Diesel models only"
                    />
                  </label>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-8 border-t border-[#edf0f3] pt-6">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Cog className="size-4 text-[#526176]" aria-hidden="true" />
              <h3 className="text-sm font-black text-[#26364b]">Industrial and other equipment</h3>
            </div>
            {equipmentRows.length > 0 && <AddButton onClick={addEquipment}>Add equipment</AddButton>}
          </div>
          {equipmentRows.length === 0 ? (
            <EmptyRows
              title="No equipment added"
              description="Add construction equipment, agricultural machinery, generators, or other industrial equipment."
              onAdd={addEquipment}
            />
          ) : (
            <div className="space-y-3">
              {equipmentRows.map((row, index) => (
                <div key={row.id} className="rounded-2xl border border-[#e3e8ee] bg-[#fbfcfd] p-4">
                  <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[1fr_1fr_1fr_1fr_auto]">
                    <label className={labelClass}>
                      Equipment type <span className="text-[#e52833]">*</span>
                      <input
                        required
                        value={row.type}
                        onChange={(event) => updateEquipment(row.id, "type", event.target.value)}
                        className={fieldClass}
                        placeholder="Generator"
                      />
                    </label>
                    <label className={labelClass}>
                      Industry
                      <input
                        value={row.industry}
                        onChange={(event) => updateEquipment(row.id, "industry", event.target.value)}
                        className={fieldClass}
                        placeholder="Power generation"
                      />
                    </label>
                    <label className={labelClass}>
                      Manufacturer <span className="text-[#e52833]">*</span>
                      <input
                        required
                        value={row.manufacturer}
                        onChange={(event) => updateEquipment(row.id, "manufacturer", event.target.value)}
                        className={fieldClass}
                        placeholder="Cummins"
                      />
                    </label>
                    <label className={labelClass}>
                      Model <span className="text-[#e52833]">*</span>
                      <input
                        required
                        value={row.model}
                        onChange={(event) => updateEquipment(row.id, "model", event.target.value)}
                        className={fieldClass}
                        placeholder="C150D5"
                      />
                    </label>
                    <div className="flex items-end justify-end">
                      <RemoveButton
                        label={`Remove equipment ${index + 1}`}
                        onClick={() =>
                          setEquipmentRows((current) => current.filter((item) => item.id !== row.id))
                        }
                      />
                    </div>
                  </div>
                  <div className="mt-3 grid gap-3 md:grid-cols-2">
                    <label className={labelClass}>
                      Engine
                      <input
                        value={row.engine}
                        onChange={(event) => updateEquipment(row.id, "engine", event.target.value)}
                        className={fieldClass}
                        placeholder="6BT5.9"
                      />
                    </label>
                    <label className={labelClass}>
                      Notes
                      <input
                        value={row.notes}
                        onChange={(event) => updateEquipment(row.id, "notes", event.target.value)}
                        className={fieldClass}
                        placeholder="e.g. Primary filter"
                      />
                    </label>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
