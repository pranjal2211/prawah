"use client"

import { ChevronDown } from "lucide-react"

interface StateSelectorProps {
  states: string[]
  selectedState: string
  onChange: (state: string) => void
  label?: string
}

export function StateSelector({ states, selectedState, onChange, label = "Select State" }: StateSelectorProps) {
  return (
    <div className="relative">
      <select
        value={selectedState}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none bg-white border border-amber-300 text-gray-800 rounded-lg px-4 py-2 pr-10 cursor-pointer hover:bg-amber-50 transition focus:outline-none focus:ring-2 focus:ring-amber-400 w-full"
      >
        {states.map((state) => (
          <option key={state} value={state} className="bg-white text-gray-800">
            {state}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-3 top-2.5 w-5 h-5 text-amber-700 pointer-events-none" />
    </div>
  )
}
