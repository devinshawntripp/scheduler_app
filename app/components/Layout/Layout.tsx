import React, { useState } from 'react';
import { Link, Form, useNavigate } from '@remix-run/react';
import { motion } from 'framer-motion';
import { FaUser, FaBell, FaCalendar, FaBookmark, FaCog, FaSignOutAlt, FaBars, FaEnvelope, FaCode, FaVial, FaCreditCard } from 'react-icons/fa';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const drawerItems = [
    { icon: FaUser, text: 'Profile', link: '/profile' },
    { icon: FaBell, text: 'Notifications', link: '/notifications' },
    { icon: FaCalendar, text: 'Calendar', link: '/calendar' },
    { icon: FaBookmark, text: 'Upcoming Bookings', link: '/bookings' },
    { icon: FaCog, text: 'Settings', link: '/settings' },
    { icon: FaBars, text: 'Dashboard', link: '/dashboard' },
    { icon: FaEnvelope, text: 'Invites', link: '/invites' },
    { icon: FaUser, text: 'Admin', link: '/admin', visible: 'admin' },
    { icon: FaVial, text: 'Embed Test', link: '/embed-test', visible: 'admin' },
    { icon: FaCreditCard, text: 'Upgrade Plan', link: '/payment' },
    { icon: FaCode, text: 'Embed Code', link: '/embed-code' },
  ];

  return (
    <div className={`drawer ${drawerOpen ? 'drawer-open' : ''}`}>
      <input id="my-drawer-2" type="checkbox" className="drawer-toggle" checked={drawerOpen} onChange={toggleDrawer} />
      <div className="drawer-content flex flex-col bg-base-200 min-h-screen">
        {/* Navbar */}
        <div className="navbar bg-base-100 shadow-lg">
          <div className="flex-none">
            <button onClick={toggleDrawer} className="btn btn-square btn-ghost">
              <FaBars />
            </button>
          </div>
          <div className="flex-1">
            <span className="text-xl font-bold">Scheduler</span>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-grow p-4 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Sidebar */}
      <div className="drawer-side">
        <label htmlFor="my-drawer-2" className="drawer-overlay" onClick={toggleDrawer}></label>
        <ul className="menu p-4 w-80 h-full bg-base-100 text-base-content">
          <li className="mb-4">
            <h1 className="text-2xl font-bold text-primary">Scheduler</h1>
          </li>
          {drawerItems.map((item, index) => (
            <li key={index}>
              <Link to={item.link} className="flex items-center p-2 hover:bg-base-200 rounded-lg transition-all duration-200" onClick={toggleDrawer}>
                <item.icon className="mr-2" />
                <span>{item.text}</span>
              </Link>
            </li>
          ))}
          <li>
            <Form action="/logout" method="post">
              <button type="submit" className="flex items-center p-2 w-full text-left hover:bg-base-200 rounded-lg transition-all duration-200 text-error">
                <FaSignOutAlt className="mr-2" />
                <span>Logout</span>
              </button>
            </Form>
          </li>
        </ul>
      </div>
    </div>
  );
}