import type { ExtendedUser } from "~/models";

// This helper assumes ExtendedUser has createdAt and updatedAt fields of type Date.
// Adjust as needed for your model.
export function rehydrateExtendedUser(
    user: Partial<ExtendedUser>
): ExtendedUser {
    return {
        ...user,
        // createdAt: user.createdAt ? new Date(user.createdAt) : new Date(),
        // updatedAt: user.updatedAt ? new Date(user.updatedAt) : new Date(),
    } as ExtendedUser;
}
