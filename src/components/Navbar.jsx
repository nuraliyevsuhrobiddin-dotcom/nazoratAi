import { Link, useLocation } from 'react-router-dom';
import { ShieldAlert, Map, FileText, LayoutDashboard } from 'lucide-react';
import { cn } from '../utils/cn';
import { isAdminUser } from '../utils/auth';

export default function Navbar() {
  const location = useLocation();

  const links = [
    { name: 'Asosiy', path: '/', icon: <ShieldAlert size={18} /> },
    { name: 'Xarita', path: '/map', icon: <Map size={18} /> },
    { name: 'Murojaat', path: '/report', icon: <FileText size={18} /> },
    ...(isAdminUser() ? [{ name: 'Admin', path: '/admin', icon: <LayoutDashboard size={18} /> }] : []),
  ];

  return (
    <nav className="fixed top-0 w-full z-[1000] p-4 pointer-events-none">
      <div className="max-w-5xl mx-auto glass-panel rounded-2xl px-6 py-4 flex justify-between items-center pointer-events-auto">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-lg overflow-hidden bg-slate-950 ring-1 ring-white/10 shadow-lg shadow-blue-500/30 group-hover:shadow-blue-500/50 transition-shadow">
            <img
              src="/nazorat-logo.jpg"
              alt="Nazorat AI"
              className="h-full w-full object-cover"
            />
          </div>
          <span className="font-bold text-xl tracking-tight text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-purple-400 transition-all">
            Nazorat AI
          </span>
        </Link>
        
        <div className="flex gap-1 md:gap-2">
          {links.map((link) => {
            const isActive = location.pathname === link.path || (link.path !== '/' && location.pathname.startsWith(link.path));
            return (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 md:px-4 rounded-xl text-sm font-medium transition-all duration-300",
                  isActive 
                    ? "bg-white/10 text-white shadow-inner" 
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                )}
              >
                {link.icon}
                <span className="hidden md:inline">{link.name}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  );
}
