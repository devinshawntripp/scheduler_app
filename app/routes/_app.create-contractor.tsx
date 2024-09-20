import { json, redirect, type ActionFunction, LoaderFunction } from "@remix-run/node";
import { Form, useActionData, useNavigation, useLoaderData } from "@remix-run/react";
import { createUser } from "~/models/user.server";
import { inviteContractor } from "~/models/invite.server";
import { requireUserId, isUserAdmin } from "~/utils/auth.server";
import { useState, useCallback, useEffect } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { Particles } from "react-tsparticles";
import { loadSlim } from "tsparticles-slim";
import type { Engine } from "tsparticles-engine";
import { ClientOnly } from "~/components/ClientOnly";

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await requireUserId(request);
  const isAdmin = await isUserAdmin(userId);
  if (!isAdmin) {
    return redirect("/dashboard");
  }
  return json({});
};

export const action: ActionFunction = async ({ request }) => {
  console.log("Create contractor action started");
  
  try {
    const userId = await requireUserId(request);
    console.log("User ID:", userId);

    const formData = await request.formData();
    const email = formData.get("email");
    const password = formData.get("password");

    console.log("Form data received:", { email });

    if (typeof email !== "string" || typeof password !== "string") {
      console.error("Invalid form data");
      return json({ error: "Invalid form data" }, { status: 400 });
    }

    const user = await createUser(email, password, ["contractor"]);
    console.log("Contractor created:", user);

    // Invite the new contractor
    await inviteContractor(userId, email);
    console.log("Invitation sent to:", email);

    return redirect("/dashboard");
  } catch (error) {
    console.error("Error creating contractor:", error);
    if (error instanceof Error && error.message.includes("Unique constraint failed")) {
      return json({ error: "A user with this email already exists" }, { status: 400 });
    }
    return json({ error: "Failed to create contractor" }, { status: 500 });
  }
};

function ParticlesBackground() {
  const particlesInit = useCallback(async (engine: Engine) => {
    await loadSlim(engine);
  }, []);

  return (
    <Particles
      id="tsparticles"
      init={particlesInit}
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

export default function CreateContractor() {
  const actionData = useActionData<{ error?: string }>();
  const navigation = useNavigation();
  const [showPassword, setShowPassword] = useState(false);
  const [contractorEmail, setContractorEmail] = useState("");
  const [contractorPassword, setContractorPassword] = useState("");
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
          <h2 className="mt-6 text-center text-3xl font-extrabold text-base-content">
            Create a new contractor
          </h2>
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
                onChange={(e) => setContractorEmail(e.target.value)}
                value={contractorEmail}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-base-content">
                Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  className="input input-bordered w-full pr-10"
                  onChange={(e) => setContractorPassword(e.target.value)}
                  value={contractorPassword}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-base-content"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <FaEyeSlash className="h-5 w-5" />
                  ) : (
                    <FaEye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={navigation.state === "submitting"}
            >
              {navigation.state === "submitting" ? "Creating..." : "Create Contractor"}
            </button>
          </div>
        </Form>

        {actionData?.error && (
          <div className="mt-4 text-error text-center">{actionData.error}</div>
        )}
      </div>
    </div>
  );
}