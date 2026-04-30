"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ArrowRight, LogIn, UserPlus, Zap, BarChart3, Map } from "lucide-react";
import React, { useEffect } from "react";

export default function Home() {
  const router = useRouter();
  const { data: session, status } = useSession();

  // Redirect authenticated users to dashboard
  // useEffect(() => {
  //   if (status === "authenticated" && session?.user) {
  //     router.push("/dashboard");
  //   }
  // }, [status, session, router]);

  // Show loading state while checking authentication
  if (status === "loading") {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center gradient-soft">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-var(--accent)/20 border-t-var(--primary)"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-soft overflow-hidden">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left side - Content */}
          <div className="animate-fade-in">
            <div className="inline-block mb-4">
              <span className="px-4 py-2 rounded-full text-sm font-semibold text-var(--primary) bg-var(--soft)/50 glass">
                Intelligent Power Demand Forecasting
              </span>
            </div>

            <h1 className="text-5xl lg:text-6xl font-bold text-var(--primary-dark) font-poppins mb-6 leading-tight">
              Engineered for India. {""}
              <img
                src="https://flagcdn.com/w40/in.png"
                alt="India Flag"
                className="inline-block w-15 h-11 object-cover rounded-lg align-middle"
              />

              <br />
              Powered by Intelligence. 
            </h1>

            <p className="text-lg text-var(--primary-dark)/80 mb-4 leading-relaxed">
              Real-time weather-based forecasting for all Indian states. Get accurate 7-day electricity demand predictions powered by advanced machine learning models.
            </p>

            <ul className="space-y-3 mb-8 text-var(--primary-dark)/80">
              <li className="flex items-start gap-3">
                <Zap className="w-5 h-5 text-var(--accent) flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Live Weather Integration:</strong> Real-time temperature, humidity, and rainfall data
                </span>
              </li>
              <li className="flex items-start gap-3">
                <BarChart3 className="w-5 h-5 text-var(--accent) flex-shrink-0 mt-0.5" />
                <span>
                  <strong>ML Powered:</strong> Trained regression models for robust demand forecasting
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Map className="w-5 h-5 text-var(--accent) flex-shrink-0 mt-0.5" />
                <span>
                  <strong>All 34 States & UTs:</strong> Comprehensive coverage of Indian states and union territories
                </span>
              </li>
            </ul>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button
                className="px-8 py-4 bg-[#2364aa] border border-white/20 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-smooth flex items-center justify-center gap-2 group"
                onClick={() => router.push("/login")}
              >
                <LogIn className="w-5 h-5" />
                Sign In
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-smooth" />
              </button>
              <button
                className="px-8 py-4 bg-white text-[#2364aa] font-semibold rounded-lg shadow-md hover:shadow-lg transition-smooth flex items-center justify-center gap-2 border-2 border-[#fec601]/20 group"
                onClick={() => router.push("/register")}
              >
                <UserPlus className="w-5 h-5" />
                Create Account
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-smooth" />
              </button>
            </div>
          </div>

          {/* Right side - Visual Card */}
          <div className="relative animate-slide-up animate-delay-200 hidden lg:block">
            <div className="glass rounded-2xl p-8 backdrop-blur-md border border-white/20 shadow-lg">
              <div className="space-y-6">
                {/* Feature Cards */}
                {[
                  { label: "Peak Demand (MW)", value: "12,500", color: "bg-var(--primary)/10" },
                  { label: "Avg Temperature", value: "32.1°C", color: "bg-var(--accent)/10" },
                  { label: "Rainfall", value: "5.2 mm", color: "bg-var(--soft)/50" },
                ].map((stat, idx) => (
                  <div
                    key={idx}
                    className={`${stat.color} rounded-lg p-4 animate-slide-up`}
                    style={{ animationDelay: `${(idx + 1) * 100}ms` }}
                  >
                    <p className="text-sm text-var(--primary-dark)/70 mb-1">{stat.label}</p>
                    <p className="text-2xl font-bold text-var(--primary-dark)">{stat.value}</p>
                  </div>
                ))}
              </div>

              {/* Decorative Elements */}
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-primary/10 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-gradient-accent/10 rounded-full blur-3xl"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white/40 glass backdrop-blur py-20 border-y border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-var(--primary-dark) mb-4">
              Powered by Advanced Technology
            </h2>
            <p className="text-lg text-var(--primary-dark)/70">
              Built with cutting-edge ML, real-time APIs, and modern infrastructure
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Zap,
                title: "Real-Time Processing",
                desc: "Instant predictions based on live weather data from multiple sources",
              },
              {
                icon: BarChart3,
                title: "Advanced Analytics",
                desc: "Deep learning models trained on historical demand and weather patterns",
              },
              {
                icon: Map,
                title: "Nationwide Coverage",
                desc: "Predictions for all Indian states and union territories",
              },
            ].map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div
                  key={idx}
                  className="glass rounded-xl p-6 hover:shadow-lg transition-smooth group border border-white/20"
                >
                  <div className="w-12 h-12 bg-gradient-primary/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-gradient-primary group-hover:text-white transition-smooth">
                    <Icon className="w-6 h-6 text-var(--primary)" />
                  </div>
                  <h3 className="text-xl font-semibold text-var(--primary-dark) mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-var(--primary-dark)/70">{feature.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h2 className="text-3xl font-bold text-var(--primary-dark) mb-4">
          Ready to forecast electricity demand?
        </h2>
        <p className="text-lg text-var(--primary-dark)/70 mb-8">
          Join thousands of users predicting demand across India
        </p>
        <button
          className="px-8 py-4 bg-gradient-primary text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-smooth inline-flex items-center gap-2 group"
          onClick={() => router.push("/register")}
        >
          Get Started
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-smooth" />
        </button>
      </div>
    </div>
  );
}
