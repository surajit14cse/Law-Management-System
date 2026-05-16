import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Briefcase, 
  Calendar, 
  CheckSquare, 
  Scale,
  Menu,
  X
} from 'lucide-react';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const location = useLocation();
  
  const menuItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Clients', path: '/clients', icon: Users },
    { name: 'Cases', path: '/cases', icon: Briefcase },
    { name: 'Cause List', path: '/cause-list', icon: Calendar },
    { name: 'Tasks', path: '/tasks', icon: CheckSquare },
  ];

  const sidebarClasses = `
    fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0
    ${isOpen ? 'translate-x-0' : '-translate-x-full'}
  `;

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
      
      <div className={sidebarClasses}>
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Scale className="text-blue-400" size={32} />
            <h1 className="text-xl font-bold tracking-tight">LawConnect</h1>
          </div>
          <button className="lg:hidden text-slate-400 hover:text-white" onClick={() => setIsOpen(false)}>
            <X size={24} />
          </button>
        </div>
        
        <nav className="flex-1 mt-6 px-4 space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                location.pathname === item.path 
                  ? 'bg-blue-600 text-white' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <item.icon size={20} />
              <span className="font-medium">{item.name}</span>
            </Link>
          ))}
        </nav>
        
        <div className="p-6 border-t border-slate-800">
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">System v1.0.0</p>
        </div>
      </div>
    </>
  );
};

const Header = ({ setIsOpen }) => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <button 
          className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
          onClick={() => setIsOpen(true)}
        >
          <Menu size={24} />
        </button>
        <h2 className="text-sm lg:text-lg font-semibold text-slate-800 truncate max-w-[150px] lg:max-w-none">
          Legal Management Suite
        </h2>
      </div>
      
      <div className="flex items-center gap-3 lg:gap-6">
        <div className="flex items-center gap-2 lg:gap-3">
          <div className="hidden sm:block text-right">
            <p className="text-xs lg:text-sm font-bold text-slate-800">{user.name || 'Advocate'}</p>
            <p className="text-[10px] lg:text-xs text-slate-500 capitalize">{user.role || 'Member'}</p>
          </div>
          <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold border border-blue-200 text-xs lg:text-base">
            {(user.name || 'A').charAt(0)}
          </div>
        </div>
        <button 
          onClick={handleLogout}
          className="text-xs lg:text-sm font-semibold text-red-500 hover:text-red-700 transition-colors"
        >
          Logout
        </button>
      </div>
    </header>
  );
};

const Layout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex bg-slate-50 min-h-screen">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header setIsOpen={setIsSidebarOpen} />
        <main className="p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
