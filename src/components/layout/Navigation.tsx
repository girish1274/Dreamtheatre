import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { PlusCircle, Library, Users, Settings } from 'lucide-react';

export function Navigation() {
  const location = useLocation();
  
  const navItems = [
    { icon: PlusCircle, label: 'New Dream', href: '/new' },
    { icon: Library, label: 'Dream Theater', href: '/theater' },
    { icon: Users, label: 'Community', href: '/community' },
    { icon: Settings, label: 'Settings', href: '/settings' },
  ];

  return (
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
    </nav>
  );
}