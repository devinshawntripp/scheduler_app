import { ActionFunction, json, LoaderFunction, redirect } from "@remix-run/node";
import { Form, useActionData, useLoaderData, Link } from "@remix-run/react";
import { createUser, getUserId, createUserSession } from "~/utils/auth.server";
import { getAllRoles } from "~/models/user.server";
import { useCallback, useState, useEffect } from "react";
import { Particles } from "react-tsparticles";
import { loadSlim } from "tsparticles-slim";
import type { Engine } from "tsparticles-engine";
import { ClientOnly } from "~/components/ClientOnly";

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await getUserId(request);
  if (userId) return redirect("/dashboard");

  // Assume non-admin for registration page
  const roles = await getAllRoles(false);
  return json({ roles });
};

export const action: ActionFunction = async ({ request }) => {
  const form = await request.formData();
  const email = form.get("email");
  const password = form.get("password");
  const role = form.get("role");

  if (
    typeof email !== "string" ||
    typeof password !== "string" ||
    typeof role !== "string" ||
    !role
  ) {
    return json({ error: "Invalid form data" }, { status: 400 });
  }

  // Prevent creation of admin accounts through registration
  if (role === 'admin') {
    return json({ error: "Invalid role selection" }, { status: 400 });
  }


  const user = await createUser(email, password, [role]);
  if (!user) {
    return json({ error: "User creation failed" }, { status: 400 });
  }
  return createUserSession(user.id, "/dashboard");
};

function ParticlesBackground() {
  const particlesInit = useCallback(async (engine: Engine) => {
    await loadSlim(engine);
  }, []);
  const particlesLoaded = useCallback(async (container: any) => {
    await console.log(container);
  }, []);

  return (
    <Particles
      id="tsparticles"
      init={particlesInit}
      loaded={particlesLoaded}
      options={{
        background: {
          color: "transparent",
        },
        fpsLimit: 120,
        interactivity: {
          events: {
            onClick: {
              enable: true,
              mode: "push",
            },
            onHover: {
              enable: true,
              mode: "repulse",
            },
            resize: true,
          },
          modes: {
            push: {
              quantity: 4,
            },
            repulse: {
              distance: 200,
              duration: 0.4,
            },
          },
        },
        particles: {
          color: {
            value: "#ffffff",
          },
          links: {
            color: "#ffffff",
            distance: 150,
            enable: true,
            opacity: 0.5,
            width: 1,
          },
          move: {
            direction: "none",
            enable: true,
            outModes: {
              default: "bounce",
            },
            random: false,
            speed: 6,
            straight: false,
          },
          number: {
            density: {
              enable: true,
              area: 800,
            },
            value: 80,
          },
          opacity: {
            value: 0.5,
          },
          shape: {
            type: "circle",
          },
          size: {
            value: { min: 1, max: 5 },
          },
        },
        detectRetina: true,
      }}
    />
  );
}

export default function Register() {
  const { roles } = useLoaderData<{ roles: { id: string, name: string }[] }>();
  const actionData = useActionData<{ error?: string }>();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {isMounted && (
        <ClientOnly>
          <ParticlesBackground />
        </ClientOnly>
      )}
      <div className="max-w-md w-full space-y-8 bg-base-100 bg-opacity-80 p-10 rounded-xl shadow-2xl relative z-10">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-base-content">Create your account</h2>
          <p className="mt-2 text-center text-sm text-base-content opacity-60">
            Or{" "}
            <Link to="/login" className="font-medium text-primary hover:text-primary-focus">
              sign in to your existing account
            </Link>
          </p>
        </div>
        <Form method="post" className="mt-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-base-content">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="mt-1 input input-bordered w-full"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-base-content">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="mt-1 input input-bordered w-full"
                placeholder="••••••••"
              />
            </div>
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-base-content">
                Role
              </label>
              <select
                id="role"
                name="role"
                required
                className="mt-1 select select-bordered w-full"
              >
                <option value="">Select a role</option>
                {roles.map((role) => (
                  <option key={role.id} value={role.name}>{role.name}</option>
                ))}
              </select>
            </div>
          </div>

          {actionData?.error && (
            <div className="text-error text-sm text-center">{actionData.error}</div>
          )}

          <div>
            <button
              type="submit"
              className="btn btn-primary w-full"
            >
              Register
            </button>
          </div>
        </Form>
      </div>
    </div>
  );
}