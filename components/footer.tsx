"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

export default function Footer() {
  const pathname = usePathname()

  // Hide footer on auth pages
  if (pathname === "/login" || pathname === "/register") {
    return null
  }

  const currentYear = new Date().getFullYear()

  return (
    <footer className="glass border-t border-white/20 mt-20 bg-gradient-to-t from-[#FADE78]/80 to-[#2364AA]/60 animate-slide-up">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        {/* Main Footer Grid */}
        <div className="flex justify-center mb-12">
          {/* Brand Section - Centered */}
          <div className="space-y-4 text-center max-w-md">
            <div className="flex flex-col items-center gap-2">
              <div className="p-2 bg-gradient-primary rounded-lg flex items-center justify-center">
                <img
                  src="/icon.png"
                  alt="App Icon"
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg object-cover shadow-sm border border-white/20"
                  style={{ background: "#fff" }}
                />
              </div>
              <div className="text-center">
                <h3 className="text-4xl font-bold text-var(--primary-dark) font-poppins mb-2">प्रवाह</h3>
                <p className="text-xl text-var(--primary) font-medium padding-3px">Weather Integrated Intelligent Power Demand Forecasting Interface</p>
              </div>
            </div>
           
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-white/20 my-8" />

        {/* Bottom Footer */}
        <div className="flex flex-col items-center justify-center gap-4 text-center">
          <p className="text-sm text-var(--primary-dark)/60">
            © {currentYear} <span className="font-semibold">प्रवाह</span> • All rights reserved.
          </p>

          <p className="text-lg text-var(--primary-dark)/50">
            Designed and Developed by Vaibhav Porwal, Priyam Patel and Pranjal Kumar 
          </p>
        </div>
      </div>
    </footer>
  )
}
