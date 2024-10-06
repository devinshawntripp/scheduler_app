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
  ];

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      {/* Drawer */}
      <motion.div
        initial={false}
        animate={{ width: drawerOpen ? "16rem" : "0" }}
        transition={{ duration: 0.3, type: "spring", stiffness: 300, damping: 30 }}
        className="bg-gray-800 h-screen shadow-lg overflow-hidden border-r border-gray-700"
      >
        <div className="p-4">
          <motion.h2
            className="text-2xl font-bold text-blue-400 mb-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Scheduler
          </motion.h2>
          {drawerItems.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * (index + 1) }}
            >
              <Link
                to={item.link}
                className="flex items-center py-2 px-4 text-gray-300 hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-500 hover:text-white rounded-lg transition-all duration-300 transform hover:scale-105 group"
                onClick={() => setDrawerOpen(false)}
              >
                <motion.div
                  whileHover={{ scale: 1.2, rotate: 360 }}
                  transition={{ duration: 0.3 }}
                  className="mr-2"
                >
                  <item.icon />
                </motion.div>
                <span className="relative overflow-hidden">
                  {item.text}
                  <motion.span
                    className="absolute bottom-0 left-0 w-full h-0.5 bg-white"
                    initial={{ scaleX: 0 }}
                    whileHover={{ scaleX: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                </span>
              </Link>
            </motion.div>
          ))}
          <Form action="/logout" method="post">
            <motion.button
              type="submit"
              className="flex items-center py-2 px-4 text-red-400 hover:bg-gradient-to-r hover:from-red-500 hover:to-pink-500 hover:text-white rounded-lg transition-all duration-300 transform hover:scale-105 w-full mt-4 group"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                whileHover={{ scale: 1.2, rotate: 360 }}
                transition={{ duration: 0.3 }}
                className="mr-2"
              >
                <FaSignOutAlt />
              </motion.div>
              <span className="relative overflow-hidden">
                Logout
                <motion.span
                  className="absolute bottom-0 left-0 w-full h-0.5 bg-white"
                  initial={{ scaleX: 0 }}
                  whileHover={{ scaleX: 1 }}
                  transition={{ duration: 0.3 }}
                />
              </span>
            </motion.button>
          </Form>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-gray-800 shadow-md border-b border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <motion.button
              onClick={() => setDrawerOpen(!drawerOpen)}
              className="text-gray-300 focus:outline-none hover:text-white transition-colors duration-200 p-2 rounded-full hover:bg-gray-700"
              whileHover={{ scale: 1.1, rotate: 180 }}
              whileTap={{ scale: 0.9 }}
            >
              <FaBars className="h-6 w-6" />
            </motion.button>
            {/* Add any additional header items if needed */}
            <div className="flex items-center space-x-4">
              {/* Placeholder for additional header items */}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-900 p-6">
          <div className="container mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}