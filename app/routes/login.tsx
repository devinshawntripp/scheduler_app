import { ActionFunction, json, LoaderFunction, redirect } from "@remix-run/node";
import { Form, useActionData, Link, useSearchParams } from "@remix-run/react";
import { login, createUserSession, getUserId } from "~/utils/auth.server";
import { useCallback, useState, useEffect } from "react";
import { Particles } from "react-tsparticles";
import { loadSlim } from "tsparticles-slim";
import type { Engine } from "tsparticles-engine";
import { ClientOnly } from "~/components/ClientOnly";

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await getUserId(request);
  if (userId) return redirect("/dashboard");
  
  const url = new URL(request.url);
  const redirectTo = url.searchParams.get("redirectTo") || "/dashboard";
  return json({ redirectTo });
};

export const action: ActionFunction = async ({ request }) => {
  const form = await request.formData();
  const email = form.get("email");
  const password = form.get("password");
  const redirectTo = form.get("redirectTo") || "/dashboard";

  if (
    typeof email !== "string" ||
    typeof password !== "string" ||
    typeof redirectTo !== "string"
  ) {
    return json({ error: "Invalid form data" }, { status: 400 });
  }

  const user = await login({ email, password });
  if (!user) {
    return json({ error: "Invalid email or password" }, { status: 400 });
  }

  return createUserSession(user.id, redirectTo);
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

export default function Login() {
  const actionData = useActionData<{ error?: string }>();
  const [searchParams] = useSearchParams();
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
          <h2 className="mt-6 text-center text-3xl font-extrabold text-base-content">Sign in to your account</h2>
          <p className="mt-2 text-center text-sm text-base-content opacity-60">
            Or{" "}
            <Link to="/register" className="font-medium text-primary hover:text-primary-focus">
              create a new account
            </Link>
          </p>
        </div>
        <Form method="post" className="mt-8 space-y-6">
          <input type="hidden" name="redirectTo" value={
            searchParams.get("redirectTo") ?? undefined
          } />
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
                autoComplete="current-password"
                required
                className="mt-1 input input-bordered w-full"
                placeholder="••••••••"
              />
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
              Sign in
            </button>
          </div>
        </Form>
      </div>
    </div>
  );
}