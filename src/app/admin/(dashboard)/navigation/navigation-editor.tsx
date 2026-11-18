"use client";

import * as React from "react";
import Link from "next/link";
import { CornerDownRight, Eye, EyeOff, Plus, Trash2 } from "lucide-react";
import type { NavigationItem, NavLocation } from "@/lib/types";
import { saveNavigation } from "@/lib/actions/admin/site";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Checkbox, Input } from "@/components/ui/form-controls";
import { MoveButtons, SaveBar, moveItem, useAction } from "@/components/admin/primitives";
import { useDirty } from "@/components/admin/use-dirty";

type Node = NavigationItem & { children: NavigationItem[] };

function toTree(items: NavigationItem[]): Node[] {
  const sorted = [...items].sort((a, b) => a.sort_order - b.sort_order);
  return sorted.filter((i) => !i.parent_id).map((p) => ({ ...p, children: sorted.filter((c) => c.parent_id === p.id) }));
}

function flatten(tree: Node[]): NavigationItem[] {
  return tree.flatMap((p, i) => {
    const { children, ...parent } = p;
    return [
      { ...parent, parent_id: null, sort_order: i + 1 },
      ...children.map((c, j) => ({ ...c, parent_id: p.id, sort_order: j + 1 })),
    ];
  });
}

function newItem(location: NavLocation, label: string, parent: string | null): NavigationItem {
  return { id: crypto.randomUUID(), location, label, href: "", parent_id: parent, sort_order: 0, is_visible: true, open_in_new_tab: false };
}

function ItemRow({
  item,
  index,
  count,
  onChange,
  onMove,
  onRemove,
  child,
  location,
}: {
  item: NavigationItem;
  index: number;
  count: number;
  onChange: (i: NavigationItem) => void;
  onMove: (from: number, to: number) => void;
  onRemove: () => void;
  child?: boolean;
  location: NavLocation;
}) {
  const headingOnly = location === "footer" && !child;
  return (
    <div className={cn("flex flex-wrap items-center gap-2 p-2 sm:flex-nowrap", !item.is_visible && "opacity-60")}>
      {child ? <CornerDownRight className="ml-2 size-4 shrink-0 text-muted-foreground" aria-hidden="true" /> : null}
      <MoveButtons index={index} count={count} onMove={onMove} />
      <Input
        value={item.label}
        onChange={(e) => onChange({ ...item, label: e.target.value })}
        placeholder={headingOnly ? "Column heading" : "Label"}
        aria-label="Label"
        className={cn("h-9 sm:w-48", !child && "font-semibold")}
      />
      {headingOnly ? (
        <span className="flex-1 text-xs text-muted-foreground">Column heading</span>
      ) : (
        <Input
          value={item.href}
          onChange={(e) => onChange({ ...item, href: e.target.value })}
          placeholder={child || location === "footer" ? "/page or https://..." : "/page (or leave empty for a dropdown only)"}
          aria-label="Link destination"
          className="h-9 flex-1 font-mono text-xs"
        />
      )}
      {!headingOnly ? (
        <label className="flex items-center gap-1.5 text-xs whitespace-nowrap text-muted-foreground">
          <Checkbox checked={item.open_in_new_tab} onChange={(e) => onChange({ ...item, open_in_new_tab: e.target.checked })} />
          New tab
        </label>
      ) : null}
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-label={item.is_visible ? "Hide link" : "Show link"}
        onClick={() => onChange({ ...item, is_visible: !item.is_visible })}
      >
        {item.is_visible ? <Eye /> : <EyeOff />}
      </Button>
      <Button type="button" variant="ghost" size="icon-sm" aria-label="Remove link" className="hover:text-destructive" onClick={onRemove}>
        <Trash2 />
      </Button>
    </div>
  );
}

function MenuEditor({ location, initial }: { location: NavLocation; initial: NavigationItem[] }) {
  const [tree, setTree] = React.useState<Node[]>(() => toTree(initial));
  const { dirty, markSaved } = useDirty(tree);
  const { run, pending } = useAction();

  const updateParent = (i: number, item: NavigationItem) => setTree((t) => t.map((n, j) => (j === i ? { ...n, ...item } : n)));
  const updateChild = (pi: number, ci: number, item: NavigationItem) =>
    setTree((t) => t.map((n, j) => (j === pi ? { ...n, children: n.children.map((c, k) => (k === ci ? item : c)) } : n)));

  async function save() {
    const res = await run(saveNavigation(location, flatten(tree)));
    if (res.ok) markSaved(tree);
  }

  return (
    <>
      <ul className="space-y-3">
        {tree.map((node, i) => (
          <li key={node.id} className="rounded-2xl border border-border bg-white">
            <ItemRow
              location={location}
              item={node}
              index={i}
              count={tree.length}
              onChange={(it) => updateParent(i, it)}
              onMove={(f, t) => setTree((x) => moveItem(x, f, t))}
              onRemove={() => {
                if (!node.children.length || window.confirm(`Remove "${node.label}" and its ${node.children.length} links?`)) {
                  setTree((x) => x.filter((_, j) => j !== i));
                }
              }}
            />
            {node.children.length ? (
              <ul className="border-t border-border bg-muted/20">
                {node.children.map((c, ci) => (
                  <li key={c.id}>
                    <ItemRow
                      location={location}
                      child
                      item={c}
                      index={ci}
                      count={node.children.length}
                      onChange={(it) => updateChild(i, ci, it)}
                      onMove={(f, t) => setTree((x) => x.map((n, j) => (j === i ? { ...n, children: moveItem(n.children, f, t) } : n)))}
                      onRemove={() => setTree((x) => x.map((n, j) => (j === i ? { ...n, children: n.children.filter((_, k) => k !== ci) } : n)))}
                    />
                  </li>
                ))}
              </ul>
            ) : null}
            <div className="border-t border-dashed border-border px-3 py-2">
              <button
                type="button"
                onClick={() => setTree((x) => x.map((n, j) => (j === i ? { ...n, children: [...n.children, newItem(location, "New link", n.id)] } : n)))}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-evergreen hover:underline"
              >
                <Plus className="size-3.5" /> {location === "header" ? "Add dropdown link" : "Add link to this column"}
              </button>
            </div>
          </li>
        ))}
      </ul>
      <Button
        type="button"
        variant="outline"
        className="mt-4"
        onClick={() => setTree((x) => [...x, { ...newItem(location, location === "header" ? "New menu item" : "New column", null), children: [] }])}
      >
        <Plus /> {location === "header" ? "Add menu item" : "Add footer column"}
      </Button>
      <SaveBar dirty={dirty} saving={pending} onSave={save} label={location === "header" ? "Save main menu" : "Save footer links"} />
    </>
  );
}

export function NavigationEditor({ header, footer }: { header: NavigationItem[]; footer: NavigationItem[] }) {
  const [tab, setTab] = React.useState<NavLocation>("header");
  return (
    <>
      <div role="tablist" aria-label="Menu" className="mb-6 inline-flex rounded-full border border-border bg-white p-1">
        {(["header", "footer"] as const).map((t) => (
          <button
            key={t}
            role="tab"
            type="button"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
            className={cn("rounded-full px-4 py-1.5 text-sm font-medium transition", tab === t ? "bg-forest text-white" : "text-muted-foreground hover:text-charcoal")}
          >
            {t === "header" ? "Main menu" : "Footer links"}
          </button>
        ))}
      </div>
      <p className="mb-4 text-sm text-muted-foreground">
        {tab === "header"
          ? "Top-level items appear in the header. Items with dropdown links open a menu. The header button is set in Website settings."
          : "Each top-level item is a footer column heading with its links beneath."}{" "}
        <Link href="/admin/settings" className="font-medium text-evergreen hover:underline">
          Website settings
        </Link>
      </p>
      <div role="tabpanel" hidden={tab !== "header"}>
        <MenuEditor location="header" initial={header} />
      </div>
      <div role="tabpanel" hidden={tab !== "footer"}>
        <MenuEditor location="footer" initial={footer} />
      </div>
    </>
  );
}
