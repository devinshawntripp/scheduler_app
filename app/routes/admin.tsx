import { json, LoaderFunction, ActionFunction } from '@remix-run/node';
import { useLoaderData, useActionData, Form, Link } from '@remix-run/react';
import { requireRole } from '~/utils/auth.server';
import { getAllUsers, addRoleToUser, removeRoleFromUser, getAllRoles, addNewRole, removeUser } from '~/models/user.server';

export const loader: LoaderFunction = async ({ request }) => {
  await requireRole(request, 'admin');
  const users = await getAllUsers();
  const roles = await getAllRoles(true); // Pass true to get all roles, including admin
  return json({ users, roles });
};

export const action: ActionFunction = async ({ request }) => {
  await requireRole(request, 'admin');
  const formData = await request.formData();
  const { userId, role, action, newRoleName } = Object.fromEntries(formData);

  switch (action) {
    case 'add':
      const result = await addRoleToUser(userId as string, role as string);
      if (!result.success) {
        return json({ success: false, message: result.message });
      }
      break;
    case 'remove':
      await removeRoleFromUser(userId as string, role as string);
      break;
    case 'addNewRole':
      try {
        await addNewRole(newRoleName as string);
        return json({ success: true, message: `Role "${newRoleName}" added successfully.` });
      } catch (error: unknown) {
        return json({ success: false, message: `Failed to add role: ${(error as Error).message}` });
      }
    case 'removeUser':
      await removeUser(userId as string);
      return json({ success: true, message: 'User removed successfully.' });
  }

  return json({ success: true });
};

export default function AdminDashboard() {
  const { users, roles } = useLoaderData<{ 
    users: Array<{ id: string, email: string, roles: Array<{ id: string, name: string }> }>, 
    roles: Array<{ id: string, name: string }> 
  }>();
  const actionData = useActionData<{ success?: boolean, message?: string }>();

  return (
    <div className="drawer lg:drawer-open">
      <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content flex flex-col bg-base-200 min-h-screen">
        <div className="flex justify-between items-center p-4">
          <label htmlFor="my-drawer-2" className="btn btn-primary drawer-button lg:hidden">Open menu</label>
          <h1 className="text-4xl font-bold mb-8 text-primary">Admin Dashboard</h1>
          <Link to="/dashboard" className="btn btn-secondary">Back to App</Link>
        </div>
        <div className="p-4 lg:p-8 overflow-y-auto">
          {actionData?.message && (
            <div className={`alert ${actionData.success ? 'alert-success' : 'alert-error'} mb-6`}>
              <span>{actionData.message}</span>
            </div>
          )}
        
          {/* Manage Roles Section */}
          <div className="card bg-base-100 shadow-xl mb-8">
            <div className="card-body">
              <h2 className="card-title text-2xl mb-4">Manage Roles</h2>
              <div className="mb-4">
                <h3 className="text-xl mb-2">Current Roles:</h3>
                <div className="flex flex-wrap gap-2">
                  {roles.map((role) => (
                    <span key={role.id} className="badge badge-primary badge-lg">{role.name}</span>
                  ))}
                </div>
              </div>
              <Form method="post" className="flex items-end gap-4">
                <div className="form-control w-full">
                  <label className="label" htmlFor="newRoleName">
                    <span className="label-text">Add New Role</span>
                  </label>
                  <input
                    type="text"
                    id="newRoleName"
                    name="newRoleName"
                    className="input input-bordered w-full"
                    required
                  />
                </div>
                <button
                  type="submit"
                  name="action"
                  value="addNewRole"
                  className="btn btn-primary"
                >
                  Add Role
                </button>
              </Form>
            </div>
          </div>

          {/* Manage Users Section */}
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold mb-4">Manage Users</h2>
            {users.length === 0 ? (
              <div className="alert alert-info">No users found.</div>
            ) : (
              users.map((user) => (
                <div key={user.id} className="card bg-base-100 shadow-xl">
                  <div className="card-body">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="card-title">{user.email}</h3>
                      <Form method="post" onSubmit={(e) => {
                        if (!confirm('Are you sure you want to remove this user?')) {
                          e.preventDefault();
                        }
                      }}>
                        <input type="hidden" name="userId" value={user.id} />
                        <button
                          type="submit"
                          name="action"
                          value="removeUser"
                          className="btn btn-error btn-sm"
                        >
                          Remove User
                        </button>
                      </Form>
                    </div>
                    <div className="mb-4">
                      <h4 className="font-medium mb-2">Current Roles:</h4>
                      {user.roles && user.roles.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {user.roles.map((role) => (
                            <div key={role.id} className="badge badge-secondary gap-2">
                              <span>{role.name}</span>
                              <Form method="post" className="inline">
                                <input type="hidden" name="userId" value={user.id} />
                                <input type="hidden" name="role" value={role.name} />
                                <button
                                  type="submit"
                                  name="action"
                                  value="remove"
                                  className="btn btn-ghost btn-xs text-error hover:bg-error hover:text-white"
                                >
                                  ✕
                                </button>
                              </Form>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-base-content italic">No roles assigned</p>
                      )}
                    </div>
                    <Form method="post" className="flex items-end gap-4">
                      <input type="hidden" name="userId" value={user.id} />
                      <div className="form-control w-full">
                        <label className="label" htmlFor={`role-${user.id}`}>
                          <span className="label-text">Add Role</span>
                        </label>
                        <select
                          id={`role-${user.id}`}
                          name="role"
                          className="select select-bordered w-full"
                        >
                          {roles.map((role) => (
                            <option key={role.id} value={role.name}>{role.name}</option>
                          ))}
                        </select>
                      </div>
                      <button
                        type="submit"
                        name="action"
                        value="add"
                        className="btn btn-primary"
                      >
                        Add Role
                      </button>
                    </Form>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      <div className="drawer-side">
        <label htmlFor="my-drawer-2" className="drawer-overlay"></label> 
        <ul className="menu p-4 w-80 h-full bg-base-200 text-base-content">
          <li><a className="text-xl font-bold mb-4">Admin Menu</a></li>
          <li><a>Dashboard</a></li>
          <li><a>Manage Users</a></li>
          <li><a>Manage Roles</a></li>
          {/* Add more menu items as needed */}
        </ul>
      </div>
    </div>
  );
}