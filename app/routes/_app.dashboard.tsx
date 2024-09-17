import { json, LoaderFunction, ActionFunction, redirect } from '@remix-run/node';
import { useLoaderData, Form, Link, useNavigate, Outlet, useActionData } from '@remix-run/react';
import { requireUserId } from '~/utils/auth.server';
import { getUserById } from '~/models/user.server';
import TeamOwnerDashboard from '~/components/Dashboard/TeamOwnerDashboard';
import ProfileForm from '~/components/Profile/ProfileForm';
import type { ExtendedUser, ExtendedBooking } from '~/types';
import { useState, useEffect } from 'react';
import { prisma } from "~/db.server";
import { motion } from 'framer-motion';
import { FaUser, FaBell, FaCalendar, FaBookmark, FaCog, FaSignOutAut } from 'react-icons/fa';

export const loader: LoaderFunction = async ({ request }) => {
  try {
    const userId = await requireUserId(request);
    const user = await getUserById(userId);
    if (!user) {
      throw new Response('Not Found', { status: 404 });
    }

    let bookings: ExtendedBooking[] = [];
    let pendingInvitation = null;

    const isTeamOwner = user.roles.some(role => role.name === 'team_owner');
    const isContractor = user.roles.some(role => role.name === 'contractor');

    if (isTeamOwner) {
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
    } else if (isContractor && user.invitedByTeamOwner) {
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

  const isTeamOwner = typedUser.roles.some(role => role.name === 'team_owner');
  const isContractor = typedUser.roles.some(role => role.name === 'contractor');

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <main className="flex-1 overflow-x-hidden overflow-y-auto bg-base-200 p-6">
        <div className="container mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-3xl font-bold text-primary mb-6"
          >
            Welcome, {typedUser.email}
          </motion.h1>

          {pendingInvitation && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="alert alert-info mb-6"
            >
              <p className="text-lg">You have a pending invitation from {pendingInvitation.email}</p>
              <button
                onClick={handleAcceptInvitation}
                className="btn btn-primary"
              >
                Accept Invitation
              </button>
            </motion.div>
          )}

          <Outlet />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="card bg-base-100 shadow-xl"
            >
              <div className="card-body">
                <h2 className="card-title text-primary">Quick Actions</h2>
                <div className="flex flex-wrap gap-2">
                  <Link to="/calendar" className="btn btn-primary">
                    <FaCalendar className="mr-2" /> View Calendar
                  </Link>
                  {isTeamOwner && (
                    <button onClick={handleInviteContractor} className="btn btn-secondary">
                      <FaUser className="mr-2" /> Invite Contractor
                    </button>
                  )}
                  {isContractor && (
                    <Link to="/availability" className="btn btn-accent">
                      <FaBookmark className="mr-2" /> Set Availability
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="card bg-base-100 shadow-xl"
            >
              <div className="card-body">
                <h2 className="card-title text-primary">Your Roles</h2>
                <div className="flex flex-wrap gap-2">
                  {typedUser.roles.map(role => (
                    <span key={role.id} className="badge badge-secondary">{role.name}</span>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          {isTeamOwner && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="card bg-base-100 shadow-xl mb-6"
            >
              <div className="card-body">
                <h2 className="card-title text-primary">Team Owner Dashboard</h2>
                <TeamOwnerDashboard userId={typedUser.id} bookings={typedBookings} />
              </div>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="card bg-base-100 shadow-xl"
          >
            <div className="card-body">
              <h2 className="card-title text-primary">Update Profile</h2>
              <ProfileForm user={typedUser} actionData={actionData} />
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}

export default function Dashboard() {
  return (
    <DashboardContent />
  );
}
