"use client";

import * as React from "react";
import { ChevronDown, Plus, Trash2 } from "lucide-react";
import type { Field } from "@/lib/blocks";
import { ICON_NAMES, getIcon } from "@/lib/icons";
import type { ImageRef, LinkRef } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { FieldHelp, Input, Label, Select, Switch, Textarea } from "@/components/ui/form-controls";
import { Dialog } from "@/components/ui/dialog";
import { ImageField } from "./media/image-field";
import { RichTextEditor } from "./rich-text-editor";
import { MoveButtons, moveItem } from "./primitives";

type Data = Record<string, unknown>;

export function LinkField({ label, value, onChange, help }: { label: string; value: LinkRef | undefined; onChange: (v: LinkRef) => void; help?: string }) {
  const v = value ?? { label: "", href: "" };
  const id = React.useId();
  return (
    <fieldset>
      <legend className="mb-1.5 text-sm font-medium text-charcoal">{label}</legend>
      <div className="grid gap-2 sm:grid-cols-2">
        <div>
          <label htmlFor={`${id}-l`} className="sr-only">
            {label} text
          </label>
          <Input id={`${id}-l`} value={v.label} onChange={(e) => onChange({ ...v, label: e.target.value })} placeholder="Button text" />
        </div>
        <div>
          <label htmlFor={`${id}-h`} className="sr-only">
            {label} destination
          </label>
          <Input id={`${id}-h`} value={v.href} onChange={(e) => onChange({ ...v, href: e.target.value })} placeholder="/get-involved or https://..." />
        </div>
      </div>
      <FieldHelp>{help ?? "Leave both empty to hide. Use a path like /about, an anchor like #apply, or a full web address."}</FieldHelp>
    </fieldset>
  );
}

export function IconPicker({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = React.useState(false);
  const Icon = getIcon(value);
  return (
    <div>
      <Label>{label}</Label>
      <Button type="button" variant="outline" onClick={() => setOpen(true)} className="h-11 rounded-lg px-3">
        <Icon /> <span className="font-normal">{value || "Choose icon"}</span>
      </Button>
      <Dialog open={open} onOpenChange={setOpen} title="Choose an icon" className="max-w-lg">
        <ul className="grid grid-cols-5 gap-2 sm:grid-cols-7">
          {ICON_NAMES.map((name) => {
            const I = getIcon(name);
            return (
              <li key={name}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(name);
                    setOpen(false);
                  }}
                  title={name}
                  aria-label={name}
                  aria-pressed={name === value}
                  className={cn(
                    "flex aspect-square w-full items-center justify-center rounded-lg border border-border hover:border-evergreen hover:bg-sage/10",
                    name === value && "border-evergreen bg-sage/20",
                  )}
                >
                  <I className="size-5 text-forest" />
                </button>
              </li>
            );
          })}
        </ul>
      </Dialog>
    </div>
  );
}

function ListField({ field, value, onChange }: { field: Extract<Field, { kind: "list" }>; value: Data[]; onChange: (v: Data[]) => void }) {
  const [openIndex, setOpenIndex] = React.useState<number | null>(null);
  const items = Array.isArray(value) ? value : [];

  return (
    <fieldset>
      <legend className="mb-1.5 text-sm font-medium text-charcoal">{field.label}</legend>
      {field.help ? <FieldHelp className="mt-0 mb-2">{field.help}</FieldHelp> : null}
      <ul className="space-y-2">
        {items.map((item, i) => {
          const title =
            (field.titleField && typeof item[field.titleField] === "string" && (item[field.titleField] as string)) ||
            ((item.image as ImageRef | null)?.alt ?? "") ||
            `${field.itemLabel} ${i + 1}`;
          const thumb = (item.image as ImageRef | null)?.src;
          const open = openIndex === i;
          return (
            <li key={i} className="rounded-xl border border-border bg-white">
              <div className="flex items-center gap-2 px-2 py-1.5">
                <button
                  type="button"
                  className="flex min-w-0 flex-1 items-center gap-3 rounded-lg px-1 py-1 text-left text-sm hover:bg-muted/60"
                  onClick={() => setOpenIndex(open ? null : i)}
                  aria-expanded={open}
                >
                  <ChevronDown className={cn("size-4 shrink-0 text-muted-foreground transition-transform", open && "rotate-180")} />
                  {thumb ? (
                    // eslint-disable-next-line @next/next/no-img-element -- admin thumbnail
                    <img src={thumb} alt="" className="size-8 shrink-0 rounded object-cover" />
                  ) : null}
                  <span className="truncate font-medium">{title}</span>
                  {item.visible === false ? <span className="text-xs text-muted-foreground">(hidden)</span> : null}
                </button>
                <MoveButtons
                  index={i}
                  count={items.length}
                  onMove={(from, to) => {
                    onChange(moveItem(items, from, to));
                    setOpenIndex(openIndex === from ? to : openIndex);
                  }}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Remove ${title}`}
                  className="text-muted-foreground hover:text-destructive"
                  onClick={() => {
                    onChange(items.filter((_, j) => j !== i));
                    setOpenIndex(null);
                  }}
                >
                  <Trash2 />
                </Button>
              </div>
              {open ? (
                <div className="border-t border-border p-4">
                  <FieldsEditor fields={field.fields} value={item} onChange={(next) => onChange(items.map((it, j) => (j === i ? next : it)))} />
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="mt-3"
        onClick={() => {
          onChange([...items, structuredClone(field.newItem)]);
          setOpenIndex(items.length);
        }}
      >
        <Plus /> Add {field.itemLabel.toLowerCase()}
      </Button>
    </fieldset>
  );
}

export function FieldInput({ field, value, onChange }: { field: Field; value: unknown; onChange: (v: unknown) => void }) {
  const id = React.useId();
  switch (field.kind) {
    case "text":
      return (
        <div>
          <Label htmlFor={id}>{field.label}</Label>
          <Input id={id} value={(value as string) ?? ""} placeholder={field.placeholder} onChange={(e) => onChange(e.target.value)} />
          {field.help ? <FieldHelp>{field.help}</FieldHelp> : null}
        </div>
      );
    case "textarea":
      return (
        <div>
          <Label htmlFor={id}>{field.label}</Label>
          <Textarea id={id} rows={field.rows ?? 3} value={(value as string) ?? ""} onChange={(e) => onChange(e.target.value)} />
          {field.help ? <FieldHelp>{field.help}</FieldHelp> : null}
        </div>
      );
    case "richtext":
      return (
        <div>
          <Label>{field.label}</Label>
          <RichTextEditor value={(value as string) ?? ""} onChange={onChange} />
          {field.help ? <FieldHelp>{field.help}</FieldHelp> : null}
        </div>
      );
    case "image":
      return <ImageField label={field.label} help={field.help} value={value as ImageRef | null} onChange={onChange} />;
    case "link":
      return <LinkField label={field.label} help={field.help} value={value as LinkRef} onChange={onChange} />;
    case "number":
      return (
        <div>
          <Label htmlFor={id}>{field.label}</Label>
          <Input
            id={id}
            type="number"
            min={field.min}
            max={field.max}
            step={field.step ?? 1}
            value={value === undefined || value === null ? "" : String(value)}
            onChange={(e) => onChange(e.target.value === "" ? "" : Number(e.target.value))}
            className="max-w-40"
          />
          {field.help ? <FieldHelp>{field.help}</FieldHelp> : null}
        </div>
      );
    case "boolean":
      return <Switch label={field.label} description={field.help} checked={value === true} onCheckedChange={onChange} />;
    case "date":
      return (
        <div>
          <Label htmlFor={id}>{field.label}</Label>
          <Input id={id} type="date" value={(value as string) ?? ""} onChange={(e) => onChange(e.target.value || null)} className="max-w-52" />
          {field.help ? <FieldHelp>{field.help}</FieldHelp> : null}
        </div>
      );
    case "select":
      return (
        <div>
          <Label htmlFor={id}>{field.label}</Label>
          <Select id={id} value={(value as string) ?? field.options[0]?.value} onChange={(e) => onChange(e.target.value)}>
            {field.options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </Select>
          {field.help ? <FieldHelp>{field.help}</FieldHelp> : null}
        </div>
      );
    case "icon":
      return <IconPicker label={field.label} value={(value as string) ?? ""} onChange={onChange} />;
    case "list":
      return <ListField field={field} value={value as Data[]} onChange={onChange} />;
  }
}

/** Renders a form for any list of field specs, editing a plain object. */
export function FieldsEditor({ fields, value, onChange }: { fields: Field[]; value: Data; onChange: (v: Data) => void }) {
  return (
    <div className="space-y-5">
      {fields.map((f) => (
        <FieldInput key={f.name} field={f} value={value?.[f.name]} onChange={(v) => onChange({ ...value, [f.name]: v })} />
      ))}
    </div>
  );
}
