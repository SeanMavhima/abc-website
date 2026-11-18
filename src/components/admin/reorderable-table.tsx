"use client";

import * as React from "react";
import { reorderRecords, type RecordTable } from "@/lib/actions/admin/records";
import { MoveButtons, moveItem, useAction } from "./primitives";

/**
 * Renders rows with up/down controls; every move is saved immediately as
 * the new display order.
 */
export function ReorderableList<T extends { id: string }>({
  table,
  items,
  renderRow,
}: {
  table: RecordTable;
  items: T[];
  renderRow: (item: T, controls: React.ReactNode) => React.ReactNode;
}) {
  const [list, setList] = React.useState(items);
  const { run, pending } = useAction();
  React.useEffect(() => setList(items), [items]);

  async function move(from: number, to: number) {
    const next = moveItem(list, from, to);
    setList(next);
    await run(reorderRecords(table, next.map((i) => i.id)), { silent: true });
  }

  return (
    <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-white">
      {list.map((item, i) => (
        <li key={item.id}>{renderRow(item, <MoveButtons index={i} count={list.length} onMove={move} disabled={pending} />)}</li>
      ))}
    </ul>
  );
}
