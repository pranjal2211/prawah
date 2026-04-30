"use client"

import Link from "next/link"

export default function AuthHeader() {
  return (
    <header className="sticky top-0 z-50 glass animate-slide-down">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <Link href="/" className="flex items-center gap-2 sm:gap-3 group w-fit hover:opacity-80 transition-smooth">
          <div className="p-2 bg-gradient-primary rounded-xl group-hover:shadow-lg transition-smooth shadow-md flex items-center justify-center">
            <img
              src="/icon.png"
              alt="App Icon"
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg object-cover shadow-sm border border-white/20"
              style={{ background: "#fff" }}
            />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-var(--primary-dark) font-bold text-2xl sm:text-3xl font-poppins">
              प्रवाह
            </h1>
            <p className="text-var(--primary) text-xs font-medium">Electricity Demand Prediction</p>
          </div>
        </Link>
      </div>
    </header>
  )
}
