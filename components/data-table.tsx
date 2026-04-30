"use client"

import type React from "react"

interface DataTableProps {
  columns: {
    header: string
    key: string
    align?: "left" | "right" | "center"
    render?: (value: any, row: any) => React.ReactNode
  }[]
  data: any[]
  title?: string
}

export function DataTable({ columns, data, title }: DataTableProps) {
  const getAlignClass = (align?: string) => {
    switch (align) {
      case "right":
        return "text-right"
      case "center":
        return "text-center"
      default:
        return "text-left"
    }
  }

  return (
    <div className="bg-white border border-[#fec601] rounded-lg p-6">
      {title && <h2 className="text-gray-800 font-semibold mb-4">{title}</h2>}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#fec601]">
              {columns.map((col) => (
                <th key={col.key} className={`py-3 px-4 text-gray-700 font-medium ${getAlignClass(col.align)}`}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIdx) => (
              <tr
                key={rowIdx}
                className="border-b border-[#fec601]/40 hover:bg-[#fec601]/10 transition"
              >
                {columns.map((col) => (
                  <td key={`${rowIdx}-${col.key}`} className={`py-3 px-4 text-gray-800 ${getAlignClass(col.align)}`}>
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
