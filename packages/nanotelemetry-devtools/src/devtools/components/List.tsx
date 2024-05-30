import type { LogRecord } from "@nanotelemetry/otlp/v1";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { parseOTLP } from "./utils";

const logs: LogRecord[] = JSON.parse(
  '[{"timeUnixNano":"17165581380810000","body":{"kvlistValue":{"values":[{"key":"body","value":{"stringValue":"Hello from web!"}},{"key":"attributes","value":{"kvlistValue":{"values":[{"key":"count","value":{"intValue":1}}]}}}]}},"attributes":[]}]'
);

function fromUnixNano(unixNano: string): Date {
  const unixMs = parseInt(unixNano.slice(0, 13));
  const date = new Date(unixMs);
  return date;
}

const columnHelper = createColumnHelper<LogRecord>();
const columns = [
  columnHelper.accessor("body", {
    cell: (body) =>
      body.getValue() ? JSON.stringify(parseOTLP(body.getValue())) : null,
  }),
  columnHelper.accessor("attributes", {
    cell: (attributes) =>
      attributes.getValue() ? attributes.getValue()?.length : 0,
  }),
];

export function EventTable() {
  const table = useReactTable({
    data: logs,
    columns,
    columnResizeMode: "onChange",
    columnResizeDirection: "ltr",
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <table className="w-full">
      <tbody>
        {table.getRowModel().rows.map((row) => (
          <tr key={row.id}>
            {row.getVisibleCells().map((cell, index) => {
              const isLast = index === row.getVisibleCells().length - 1;

              return (
                <td
                  key={cell.id}
                  style={{ width: cell.column.getSize() }}
                  className={`relative border-b ${!isLast ? "border-r" : ""} border-neutral-600`}
                >
                  <div className="p-1 whitespace-nowrap overflow-hidden text-ellipsis">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </div>
                  {!isLast && (
                    <div
                      onDoubleClick={() => cell.column.resetSize()}
                      className="absolute top-0 bottom-0 right-[-2px] w-[1px] px-1 cursor-col-resize"
                    />
                  )}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
