import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Brain, PlusCircle, Library, Users, Settings, LogIn } from 'lucide-react';

export function Header() {
  const location = useLocation();
  
  const navItems = [
    { icon: PlusCircle, label: 'New Dream', href: '/new' },
    { icon: Library, label: 'Dream Theater', href: '/theater' },
    { icon: Users, label: 'Community', href: '/community' },
    { icon: Settings, label: 'Settings', href: '/settings' },
  ];

  return (
    <header className="fixed top-0 w-full bg-black/20 backdrop-blur-lg z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <Brain className="w-8 h-8 text-purple-400" />
            <span className="text-2xl font-bold text-white">Dream Cinema</span>
          </Link>
          
          <nav className="flex items-center space-x-6">
            {navItems.map(({ icon: Icon, label, href }) => (
              <Link
                key={href}
                to={href}
                className={`flex items-center space-x-2 transition-colors ${
                  location.pathname === href
                    ? 'text-purple-400'
                    : 'text-gray-300 hover:text-purple-400'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{label}</span>
              </Link>
            ))}
            <Link
              to="/signin"
              className="px-4 py-2 bg-purple-500 hover:bg-purple-600 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <LogIn className="w-5 h-5" />
              <span>Sign In</span>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}