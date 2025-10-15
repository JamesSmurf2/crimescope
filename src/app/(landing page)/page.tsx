'use client';

import React, { useEffect, useState } from 'react';
import Button from '@/components/reusable/Button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BarChart3, Shield, TrendingUp, Lock, Eye, AlertTriangle, Map } from 'lucide-react';

import useAuthStore from '@/utils/zustand/useAuthStore';

export default function Home() {
  const router = useRouter();

  const { getAuthUserFunction, authUser } = useAuthStore();

  // For auth
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      await getAuthUserFunction();
      setAuthLoading(false);
    };
    checkAuth();
  }, [getAuthUserFunction]);

  useEffect(() => {
    if (!authLoading && authUser) {
      router.push('/dashboard/page1');
    }
  }, [authUser, authLoading, router]);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-900 via-black to-gray-900 overflow-x-hidden">
      {/* Hero Section */}
      <div className="relative min-h-screen w-full flex items-center justify-center px-4 sm:px-6 lg:px-8">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -top-48 -left-48 animate-pulse"></div>
          <div className="absolute w-96 h-96 bg-purple-500/10 rounded-full blur-3xl -bottom-48 -right-48 animate-pulse delay-1000"></div>
        </div>

        <div className="relative z-10 max-w-6xl mx-auto text-center py-20">
          {/* Main Heading */}
          <div className="mb-8 sm:mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-sm rounded-full border border-white/10 mb-6 sm:mb-8">
              <Shield className="w-4 h-4 text-blue-400" />
              <span className="text-xs sm:text-sm text-gray-300">Secure Data Analytics Platform</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 mb-4 sm:mb-6 leading-tight px-4">
              Barangay Crime Data
              <br />
              <span className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl">Visualization & Pattern Analysis</span>
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-8 sm:mb-12 px-4">
              Empowering communities with intelligent crime analytics and real-time insights for safer neighborhoods
            </p>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-12 sm:mb-16 px-4">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 transform hover:scale-105">
              <BarChart3 className="w-10 h-10 sm:w-12 sm:h-12 text-blue-400 mx-auto mb-4" />
              <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">Visual Analytics</h3>
              <p className="text-sm text-gray-400">Interactive charts and graphs for crime data insights</p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 transform hover:scale-105">
              <TrendingUp className="w-10 h-10 sm:w-12 sm:h-12 text-purple-400 mx-auto mb-4" />
              <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">Pattern Detection</h3>
              <p className="text-sm text-gray-400">AI-powered analysis to identify crime trends</p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 transform hover:scale-105 sm:col-span-1 col-span-1">
              <Lock className="w-10 h-10 sm:w-12 sm:h-12 text-pink-400 mx-auto mb-4" />
              <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">Secure Access</h3>
              <p className="text-sm text-gray-400">Protected data with role-based permissions</p>
            </div>
          </div>

          {/* CTA Button */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 px-4">
            <Link href="/login" className="w-full sm:w-auto">
              <Button text="Admin Login" />
            </Link>
          </div>

          {/* Scroll indicator */}
          <div className="mt-16 animate-bounce">
            <div className="w-6 h-10 border-2 border-white/30 rounded-full mx-auto flex items-start justify-center p-2">
              <div className="w-1 h-3 bg-white/50 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="relative py-20 sm:py-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-black to-gray-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
              Comprehensive Crime Analytics
            </h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Advanced tools and insights to help barangays make data-driven decisions for community safety
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:border-blue-400/50 transition-all duration-300">
              <Eye className="w-12 h-12 text-blue-400 mb-4" />
              <h3 className="text-2xl font-bold text-white mb-3">Real-Time Monitoring</h3>
              <p className="text-gray-400 mb-4">
                Track crime incidents as they happen with live data updates and instant notifications for emerging patterns.
              </p>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                  Live incident reporting
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                  Automated alert system
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                  Dashboard notifications
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:border-purple-400/50 transition-all duration-300">
              <Map className="w-12 h-12 text-purple-400 mb-4" />
              <h3 className="text-2xl font-bold text-white mb-3">Geographic Mapping</h3>
              <p className="text-gray-400 mb-4">
                Visualize crime hotspots with interactive maps and identify high-risk areas in your barangay.
              </p>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
                  Heat map visualization
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
                  Location-based analysis
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
                  Area risk assessment
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-pink-500/10 to-orange-500/10 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:border-pink-400/50 transition-all duration-300">
              <AlertTriangle className="w-12 h-12 text-pink-400 mb-4" />
              <h3 className="text-2xl font-bold text-white mb-3">Predictive Analysis</h3>
              <p className="text-gray-400 mb-4">
                Leverage machine learning to forecast potential crime patterns and allocate resources effectively.
              </p>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-pink-400 rounded-full"></div>
                  Trend forecasting
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-pink-400 rounded-full"></div>
                  Risk probability scores
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-pink-400 rounded-full"></div>
                  Resource optimization
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-green-500/10 to-blue-500/10 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:border-green-400/50 transition-all duration-300">
              <BarChart3 className="w-12 h-12 text-green-400 mb-4" />
              <h3 className="text-2xl font-bold text-white mb-3">Custom Reports</h3>
              <p className="text-gray-400 mb-4">
                Generate detailed reports with customizable metrics, timeframes, and data visualization options.
              </p>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                  Flexible date ranges
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                  Export to multiple formats
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                  Automated scheduling
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="relative py-20 sm:py-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-900 to-black">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-2">Real-time</div>
              <div className="text-sm sm:text-base text-gray-400">Data Updates</div>
            </div>
            <div className="text-center">
              <div className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-2">Secure</div>
              <div className="text-sm sm:text-base text-gray-400">Encrypted System</div>
            </div>
            <div className="text-center">
              <div className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-orange-400 mb-2">24/7</div>
              <div className="text-sm sm:text-base text-gray-400">Available Access</div>
            </div>
            <div className="text-center">
              <div className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-blue-400 mb-2">Fast</div>
              <div className="text-sm sm:text-base text-gray-400">Response Time</div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="relative py-20 px-4 sm:px-6 lg:px-8 bg-black">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-lg text-gray-400 mb-8 max-w-2xl mx-auto">
            Access powerful crime analytics tools and insights to make your barangay safer
          </p>
          <Link href="/login">
            <Button text="Access Admin Dashboard" />
          </Link>

          <div className="mt-12 pt-8 border-t border-white/10">
            <p className="text-sm text-gray-500">
              © 2025 Barangay Crime Analytics. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}