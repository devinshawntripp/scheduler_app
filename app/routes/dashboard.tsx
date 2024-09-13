import { json, LoaderFunction, ActionFunction } from '@remix-run/node';
import { useLoaderData, Form, Link, useNavigate, Outlet, useActionData } from '@remix-run/react';
import { requireUserId } from '../utils/auth.server';
import { getUserById } from '../models/user.server';
import TeamOwnerDashboard from '../components/Dashboard/TeamOwnerDashboard';
import ProfileForm from '../components/Profile/ProfileForm';
import type { ExtendedUser, ExtendedBooking } from '../types';
import { useState, useEffect } from 'react';
import { prisma } from "~/db.server";
import { motion, AnimatePresence } from 'framer-motion';
import { FaUser, FaBell, FaCalendar, FaBookmark, FaCog, FaSignOutAlt, FaBars } from 'react-icons/fa';

export const loader: LoaderFunction = async ({ request }) => {
  try {
    const userId = await requireUserId(request);
    const user = await getUserById(userId);
    if (!user) {
      throw new Response('Not Found', { status: 404 });
    }

    let bookings: ExtendedBooking[] = [];
    let pendingInvitation = null;

    if (user.role === 'team_owner') {
      try {
        const url = new URL(request.url);
        const apiUrl = new URL('/api/team-owner-bookings', url.origin);
        const bookingsResponse = await fetch(apiUrl, {
          headers: request.headers,
        });
        if (!bookingsResponse.ok) {
          throw new Error(`HTTP error! status: ${bookingsResponse.status}`);
        }
        const bookingsData = await bookingsResponse.json();
        bookings = bookingsData.bookings;
      } catch (error) {
        console.error('Failed to fetch bookings:', error);
      }
    } else if (user.role === 'contractor' && user.invitedByTeamOwner) {
      pendingInvitation = await prisma.user.findUnique({
        where: { id: user.invitedByTeamOwner },
        select: { email: true }
      });
    }

    return json({ user, bookings, pendingInvitation });
  } catch (error) {
    if (error instanceof Response && error.status === 401) {
      return redirect('/login');
    }
    throw error;
  }
};

export const action: ActionFunction = async ({ request }) => {
  // Handle any form submissions in the dashboard
  // For now, we'll just return an empty object
  return json({});
};

function DashboardContent() {
  const { user, bookings, pendingInvitation } = useLoaderData<typeof loader>();
  const actionData = useActionData<{ error?: string }>();
  const [isClient, setIsClient] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleInviteContractor = () => {
    navigate('/invite-contractor');
  };

  const handleAcceptInvitation = () => {
    navigate('/accept-invitation');
  };

  if (!isClient) {
    return <div>Loading...</div>;
  }

  const typedUser: ExtendedUser = {
    ...user,
    createdAt: new Date(user.createdAt),
    updatedAt: new Date(user.updatedAt),
    googleCalendarId: user.googleCalendarId || null,
    hasUnreadInvitation: user.hasUnreadInvitation || false
  };

  const typedBookings: ExtendedBooking[] = bookings.map((booking: any) => ({
    ...booking,
    dateTime: new Date(booking.dateTime),
    createdAt: new Date(booking.createdAt),
    updatedAt: new Date(booking.updatedAt)
  }));

  const drawerItems = [
    { icon: FaUser, text: 'Profile', link: '/dashboard/profile' },
    { icon: FaBell, text: 'Notifications', link: '/dashboard/notifications' },
    { icon: FaCalendar, text: 'Calendar', link: '/dashboard/calendar' },
    { icon: FaBookmark, text: 'Upcoming Bookings', link: '/dashboard/bookings' },
    { icon: FaCog, text: 'Settings', link: '/dashboard/settings' },
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
            <div className="flex items-center space-x-4">
              {typedUser.role === 'team_owner' && (
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: "0px 0px 8px rgb(59, 130, 246)" }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleInviteContractor}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-md hover:from-blue-600 hover:to-blue-700 transition duration-300"
                >
                  Invite Contractor
                </motion.button>
              )}
              {typedUser.hasUnreadInvitation && (
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 20 }}
                  whileTap={{ scale: 0.9, rotate: -20 }}
                  onClick={handleAcceptInvitation}
                  className="relative bg-gradient-to-r from-pink-500 to-purple-500 text-white p-2 rounded-full hover:from-pink-600 hover:to-purple-600 transition duration-300"
                >
                  <FaBell />
                  <motion.span
                    className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  >
                    1
                  </motion.span>
                </motion.button>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-900 p-6">
          <div className="container mx-auto">
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-3xl font-bold text-blue-400 mb-6"
            >
              Welcome, {typedUser.email}
            </motion.h1>

            {pendingInvitation && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="bg-gray-800 p-4 rounded-lg shadow-md mb-6 border border-gray-700"
              >
                <p className="text-lg text-gray-300">You have a pending invitation from {pendingInvitation.email}</p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleAcceptInvitation}
                  className="mt-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-md hover:from-blue-600 hover:to-blue-700 transition duration-300"
                >
                  Accept Invitation
                </motion.button>
              </motion.div>
            )}

            <Outlet />

            {typedUser.role === 'team_owner' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-gray-800 shadow-lg rounded-lg p-6 mb-6 border border-blue-500"
              >
                <h2 className="text-2xl font-bold text-blue-400 mb-4">Team Owner Dashboard</h2>
                <TeamOwnerDashboard userId={typedUser.id} bookings={typedBookings} />
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-gray-800 shadow-lg rounded-lg p-6 border border-gray-700"
            >
              <h2 className="text-2xl font-bold text-gray-300 mb-4">Update Profile</h2>
              <ProfileForm user={typedUser} actionData={actionData} />
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function Dashboard() {
  return (
    <DashboardContent />
  );
}