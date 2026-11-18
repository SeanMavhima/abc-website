"use client";

import * as React from "react";
import { ChevronDown, Copy, Eye, EyeOff, Plus, Trash2 } from "lucide-react";
import { BLOCKS, BLOCK_TYPES, createBlock } from "@/lib/blocks";
import { getIcon } from "@/lib/icons";
import type { Block, BlockType } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { FieldHelp, Input, Label } from "@/components/ui/form-controls";
import { FieldsEditor } from "./fields-editor";
import { MoveButtons, moveItem } from "./primitives";

function summary(block: Block) {
  const d = block.data;
  const s = (d.heading || d.headline || d.eyebrow || d.text) as string | undefined;
  return typeof s === "string" ? s.slice(0, 90) : "";
}

export function SectionsEditor({
  value,
  onChange,
  allowedTypes = BLOCK_TYPES,
  emptyHint = "This page has no sections yet.",
}: {
  value: Block[];
  onChange: (blocks: Block[]) => void;
  allowedTypes?: BlockType[];
  emptyHint?: string;
}) {
  const [openId, setOpenId] = React.useState<string | null>(null);
  const [adding, setAdding] = React.useState<{ at: number } | null>(null);

  const update = (id: string, patch: Partial<Block>) => onChange(value.map((b) => (b.id === id ? { ...b, ...patch } : b)));

  function insert(type: BlockType, at: number) {
    const block = createBlock(type, crypto.randomUUID());
    const next = [...value];
    next.splice(at, 0, block);
    onChange(next);
    setOpenId(block.id);
    setAdding(null);
  }

  return (
    <div>
      {value.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-white p-8 text-center text-sm text-muted-foreground">{emptyHint}</div>
      ) : (
        <ol className="space-y-3">
          {value.map((block, i) => {
            const def = BLOCKS[block.type];
            const Icon = getIcon(def?.icon);
            const open = openId === block.id;
            return (
              <li key={block.id} className={cn("rounded-2xl border bg-white shadow-xs transition", open ? "border-evergreen/40" : "border-border", !block.visible && "opacity-70")}>
                <div className="flex items-center gap-2 p-2 sm:p-3">
                  <button
                    type="button"
                    onClick={() => setOpenId(open ? null : block.id)}
                    aria-expanded={open}
                    className="flex min-w-0 flex-1 items-center gap-3 rounded-xl px-2 py-1.5 text-left hover:bg-muted/50"
                  >
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-sage/25 text-forest">
                      <Icon className="size-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2 text-sm font-semibold">
                        <span className="text-muted-foreground tabular-nums">{i + 1}.</span> {def?.label ?? block.type}
                        {!block.visible ? (
                          <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground uppercase">Hidden</span>
                        ) : null}
                      </span>
                      <span className="block truncate text-xs text-muted-foreground">{summary(block) || def?.description}</span>
                    </span>
                    <ChevronDown className={cn("size-4 shrink-0 text-muted-foreground transition-transform", open && "rotate-180")} />
                  </button>
                  <div className="flex shrink-0 items-center">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      className="text-muted-foreground"
                      onClick={() => update(block.id, { visible: !block.visible })}
                      aria-label={block.visible ? "Hide section" : "Show section"}
                      title={block.visible ? "Hide section" : "Show section"}
                    >
                      {block.visible ? <Eye /> : <EyeOff />}
                    </Button>
                    <MoveButtons index={i} count={value.length} onMove={(from, to) => onChange(moveItem(value, from, to))} />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      className="hidden text-muted-foreground sm:inline-flex"
                      aria-label="Duplicate section"
                      title="Duplicate section"
                      onClick={() => {
                        const copy = { ...structuredClone(block), id: crypto.randomUUID() };
                        const next = [...value];
                        next.splice(i + 1, 0, copy);
                        onChange(next);
                      }}
                    >
                      <Copy />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      className="text-muted-foreground hover:text-destructive"
                      aria-label="Remove section"
                      title="Remove section"
                      onClick={() => {
                        if (window.confirm(`Remove the "${def?.label ?? block.type}" section? You can undo this by not saving.`)) {
                          onChange(value.filter((b) => b.id !== block.id));
                        }
                      }}
                    >
                      <Trash2 />
                    </Button>
                  </div>
                </div>
                {open && def ? (
                  <div className="space-y-5 border-t border-border px-4 py-5 sm:px-6">
                    <p className="text-xs text-muted-foreground">{def.description}</p>
                    <FieldsEditor fields={def.fields} value={block.data} onChange={(data) => update(block.id, { data: { ...block.data, ...data } })} />
                    <div className="border-t border-dashed border-border pt-4">
                      <Label htmlFor={`anchor-${block.id}`}>Section anchor (optional)</Label>
                      <Input
                        id={`anchor-${block.id}`}
                        value={(block.data.anchor as string) ?? ""}
                        onChange={(e) => update(block.id, { data: { ...block.data, anchor: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") } })}
                        placeholder="e.g. apply"
                        className="max-w-xs"
                      />
                      <FieldHelp>Lets links jump straight to this section, for example /get-involved#apply.</FieldHelp>
                    </div>
                  </div>
                ) : null}
                <div className="flex justify-center border-t border-dashed border-border/0">
                  <button
                    type="button"
                    onClick={() => setAdding({ at: i + 1 })}
                    className="-mb-3 flex translate-y-1/2 items-center gap-1 rounded-full border border-border bg-white px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground opacity-0 shadow-xs transition hover:text-forest focus:opacity-100 [li:hover_&]:opacity-100"
                  >
                    <Plus className="size-3" /> Insert here
                  </button>
                </div>
              </li>
            );
          })}
        </ol>
      )}
      <Button type="button" variant="outline" className="mt-6" onClick={() => setAdding({ at: value.length })}>
        <Plus /> Add section
      </Button>

      <Dialog open={adding !== null} onOpenChange={(o) => !o && setAdding(null)} title="Add a section" description="Choose the type of section to add." className="max-w-3xl">
        <ul className="grid gap-3 sm:grid-cols-2">
          {allowedTypes.map((type) => {
            const def = BLOCKS[type];
            const Icon = getIcon(def.icon);
            return (
              <li key={type}>
                <button
                  type="button"
                  onClick={() => adding && insert(type, adding.at)}
                  className="flex h-full w-full items-start gap-3 rounded-xl border border-border p-4 text-left transition hover:border-evergreen hover:bg-sage/10"
                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-sage/25 text-forest">
                    <Icon className="size-4" />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold">{def.label}</span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">{def.description}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </Dialog>
    </div>
  );
}
