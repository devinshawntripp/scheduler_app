import React, { useState } from "react";
import { motion } from "framer-motion";
import type { LoaderFunction, ActionFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData, Form, useNavigation } from "@remix-run/react";
import { requireUserId } from "~/utils/auth.server";
import {
    getUserById,
    getTeamMembers,
    removeUserFromTeam,
    addUserToTeam,
} from "~/services/user.server";
import type { ExtendedUser } from "~/models";
import { FaCopy } from "react-icons/fa";

type LoaderData = {
    user: ExtendedUser;
    teamMembers: ExtendedUser[];
};

export const loader: LoaderFunction = async ({ request }) => {
    const userId = await requireUserId(request);
    const user = await getUserById(userId);
    if (!user) throw new Response("Not Found", { status: 404 });
    // Only allow users with the "admin" or "team_owner" role.
    if (!user.roles.some((role) => role.name === "admin" || role.name === "team_owner")) {
        throw new Response("Forbidden", { status: 403 });
    }
    // For team_owner, use their own id. For admin, optionally allow a "teamOwnerId" query parameter.
    const url = new URL(request.url);
    let teamOwnerId: string;
    if (user.roles.some((r) => r.name === "admin")) {
        teamOwnerId = url.searchParams.get("teamOwnerId") || user.id;
    } else {
        teamOwnerId = user.id;
    }
    const teamMembers = await getTeamMembers(teamOwnerId);
    return json({ user, teamMembers });
};

export const action: ActionFunction = async ({ request }) => {
    const userId = await requireUserId(request);
    const user = await getUserById(userId);
    if (
        !user ||
        !user.roles.some((role) => role.name === "admin" || role.name === "team_owner")
    ) {
        throw new Response("Forbidden", { status: 403 });
    }

    const formData = await request.formData();
    const intent = formData.get("intent");

    // For adding a team member.
    if (intent === "add") {
        const email = formData.get("email");
        if (!email || typeof email !== "string") {
            return json({ error: "Email is required" }, { status: 400 });
        }
        // For admin users, allow specifying a teamOwnerId (defaults to the admin's id if not provided)
        let teamOwnerId: string;
        if (user.roles.some((r) => r.name === "admin")) {
            teamOwnerId = (formData.get("teamOwnerId") as string) || user.id;
        } else {
            teamOwnerId = user.id;
        }
        await addUserToTeam(email, teamOwnerId);
        return redirect("/team-management");
    }

    // For removing a team member.
    if (intent === "remove") {
        const memberId = formData.get("memberId");
        if (!memberId || typeof memberId !== "string") {
            return json({ error: "Member ID is required" }, { status: 400 });
        }
        let teamOwnerId: string;
        if (user.roles.some((r) => r.name === "admin")) {
            teamOwnerId = (formData.get("teamOwnerId") as string) || user.id;
        } else {
            teamOwnerId = user.id;
        }
        await removeUserFromTeam(memberId);
        return redirect("/team-management");
    }

    return json({ error: "Invalid intent" }, { status: 400 });
};

export default function TeamManagement() {
    const { user, teamMembers } = useLoaderData<LoaderData>();
    const navigation = useNavigation();
    const isAdding = navigation.state === "submitting";
    const [newEmail, setNewEmail] = useState("");

    const copyToClipboard = () => {
        navigator.clipboard.writeText(user.id).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };
    const [copied, setCopied] = useState(false);

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="flex justify-center items-center card bg-base-100 text-primary shadow-lg p-4">
                <h1 className="text-3xl font-bold mb-4">Team Management</h1>
            </div>
            <p className="mb-6">
                Manage your team members. You can add new members by email or remove existing ones.
            </p>

            <section className="mb-8 border-2 border-base-300 p-4 rounded shadow card bg-base-100">
                <h2 className="text-xl font-semibold mb-2">Add Team Member</h2>
                <Form method="post" className="flex flex-col gap-4">
                    <input type="hidden" name="intent" value="add" />
                    {/* If the current user is an admin, allow selecting a team owner */}
                    {user.roles.some((role) => role.name === "admin") && (
                        <div className="bg-base-300 p-4 rounded-lg relative">
                            <label htmlFor="teamOwnerId" className="block text-sm font-medium">
                                Team Owner ID
                            </label>
                            <pre className="whitespace-pre-wrap break-all">{user.id}</pre>
                            <button
                                onClick={copyToClipboard}
                                className="btn btn-primary absolute top-2 right-2"
                            >
                                {copied ? 'Copied!' : <><FaCopy className="mr-2" /> Copy ID</>}
                            </button>
                        </div>

                    )}
                    <div className="flex items-center gap-4">
                        <input
                            type="email"
                            name="email"
                            placeholder="Enter member email"
                            value={newEmail}
                            onChange={(e) => setNewEmail(e.target.value)}
                            required
                            className="input input-bordered flex-grow"
                        />
                        <button type="submit" disabled={isAdding} className="btn btn-primary">
                            {isAdding ? "Adding..." : "Add Member"}
                        </button>
                    </div>
                </Form>
            </section>

            <section className="rounded shadow p-4">
                <h2 className="text-xl font-semibold mb-4">Team Members</h2>
                {teamMembers.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {teamMembers.map((member) => (
                            <motion.div
                                key={member.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                                className="bg-base-300 rounded-lg p-4 shadow hover:shadow-lg transition-transform transform hover:scale-105"
                            >
                                <div className="mb-3">
                                    <h3 className="font-semibold">{member.email}</h3>
                                    <p className="text-sm">
                                        {member.roles.map((r) => r.name).join(", ")}
                                    </p>
                                </div>
                                <Form method="post" onSubmit={(e) => {
                                    if (!confirm("Are you sure you want to remove this team member?")) {
                                        e.preventDefault();
                                    }
                                }}>
                                    <input type="hidden" name="intent" value="remove" />
                                    <input type="hidden" name="memberId" value={member.id} />
                                    {user.roles.some((role) => role.name === "admin") && (
                                        <input type="hidden" name="teamOwnerId" value={user.id} />
                                    )}
                                    <button type="submit" className="btn btn-error btn-sm w-full">
                                        Remove
                                    </button>
                                </Form>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <p>No team members found.</p>
                )}
            </section>
        </div>
    );
}
