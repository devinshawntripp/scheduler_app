import React, { useState } from 'react';
import { Link, Form, useNavigate } from '@remix-run/react';
import { motion } from 'framer-motion';
import { FaUser, FaBell, FaCalendar, FaBookmark, FaCog, FaSignOutAlt, FaBars, FaEnvelope, FaCode, FaVial, FaCreditCard, FaUsers } from 'react-icons/fa';
import { ExtendedUser } from '~/models';

interface LayoutProps {
  children: React.ReactNode;
  user: ExtendedUser | null;
}

export default function Layout({ children, user }: LayoutProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);

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
    { icon: FaUsers, text: 'Team Management', link: '/team-management', visible: 'team_management' },
    { icon: FaVial, text: 'Embed Test', link: '/embed-test', visible: 'admin' },
    {
      icon: FaCreditCard,
      text: user?.activeSubscription ? 'Upgrade Plan' : 'Subscribe Now',
      link: '/payment'
    },
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
        <footer className="p-4 text-center border-t border-gray-200">
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} Schedule Everything. All rights reserved.
            <span className="mx-2">|</span>
            <Link to="/privacy-policy" className="underline hover:text-gray-700">
              Privacy Policy
            </Link>
            <span className="mx-2">|</span>
            <Link to="/terms-and-conditions" className="underline hover:text-gray-700">
              Terms &amp; Conditions
            </Link>
          </p>
        </footer>
      </div>

      {/* Sidebar */}
      <div className="drawer-side">
        <label htmlFor="my-drawer-2" className="drawer-overlay" onClick={toggleDrawer}></label>
        <ul className="menu p-4 w-80 h-full bg-base-100 text-base-content">
          <li className="mb-4">
            <h1 className="text-2xl font-bold text-primary">Scheduler</h1>
          </li>
          {drawerItems
            .filter((item) => {
              // if the item does not have a "visible" condition, always show it.
              if (!item.visible) return true;
              // if user is not logged in (null), hide any restricted items.
              if (!user) return false;
              // For items marked "admin", show if the user has the admin role.
              if (item.visible === 'admin') {
                return user.roles.some((role) => role.name === 'admin');
              }
              // For Team Management, show if the user is an admin or team owner.
              if (item.visible === 'team_management') {
                return user.roles.some((role) => role.name === 'admin' || role.name === 'team_owner');
              }
              return false;
            })
            .map((item, index) => (
              <li key={index}>
                <Link
                  to={item.link}
                  className="flex items-center p-2 hover:bg-base-200 rounded-lg transition-all duration-200"
                  onClick={toggleDrawer}
                >
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