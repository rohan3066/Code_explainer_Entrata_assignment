import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Code2, History, Heart, GitBranch, Settings } from 'lucide-react';

export default function Sidebar() {
  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Code Explainer', path: '/analyzer', icon: Code2 },
    { name: 'History', path: '/history', icon: History },
    { name: 'Favorites', path: '/favorites', icon: Heart },
    { name: 'Imported Repos', path: '/repositories', icon: GitBranch },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 border-r bg-card/45 backdrop-blur-md hidden md:flex flex-col h-[calc(100vh-4rem)]">
      <div className="flex-1 py-6 px-4 space-y-1.5 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition duration-200 ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-md shadow-primary/10'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`
              }
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </div>
    </aside>
  );
}
