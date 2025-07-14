import React from 'react';
import { Settings as SettingsIcon, Palette, Eye, Bell, Shield } from 'lucide-react';

export function Settings() {
  return (
    <section className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center space-x-4 mb-8">
        <SettingsIcon className="w-8 h-8 text-purple-400" />
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-gray-400">Customize your dream experience</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Animation Preferences */}
        <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-6">
            <Palette className="w-6 h-6 text-purple-400" />
            <h2 className="text-xl font-semibold">Animation Preferences</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Default Animation Style
              </label>
              <select className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white">
                <option value="watercolor">Watercolor</option>
                <option value="claymation">Claymation</option>
                <option value="cyberpunk">Cyberpunk</option>
                <option value="hand-drawn">Hand-drawn</option>
              </select>
            </div>
          </div>
        </div>

        {/* Privacy Settings */}
        <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-6">
            <Eye className="w-6 h-6 text-purple-400" />
            <h2 className="text-xl font-semibold">Privacy</h2>
          </div>
          
          <div className="space-y-4">
            <label className="flex items-center space-x-3">
              <input type="checkbox" className="form-checkbox text-purple-500 rounded bg-white/10" />
              <span>Make my dreams private by default</span>
            </label>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-6">
            <Bell className="w-6 h-6 text-purple-400" />
            <h2 className="text-xl font-semibold">Notifications</h2>
          </div>
          
          <div className="space-y-4">
            <label className="flex items-center space-x-3">
              <input type="checkbox" className="form-checkbox text-purple-500 rounded bg-white/10" />
              <span>Dream analysis completion</span>
            </label>
            <label className="flex items-center space-x-3">
              <input type="checkbox" className="form-checkbox text-purple-500 rounded bg-white/10" />
              <span>Community interactions</span>
            </label>
          </div>
        </div>

        {/* Account Security */}
        <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-6">
            <Shield className="w-6 h-6 text-purple-400" />
            <h2 className="text-xl font-semibold">Account Security</h2>
          </div>
          
          <div className="space-y-4">
            <button className="px-4 py-2 bg-purple-500 hover:bg-purple-600 rounded-lg transition-colors">
              Change Password
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}