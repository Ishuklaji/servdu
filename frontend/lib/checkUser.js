import { auth, currentUser } from "@clerk/nextjs/server";

const STRAPI_URL =
  process.env.NEXT_PUBLIC_STRAPI_URL || "http://127.0.0.1:1337";
const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN;

// Header renders checkUser on every request, including <Link> prefetches, so
// several calls for the same user can run at once. Share one in-flight sync
// per Clerk user so they don't all create the user in Strapi.
const inFlight = new Map();

export const checkUser = async () => {
  const user = await currentUser();

  if (!user) {
    console.log("No User found");
    return null;
  }

  if (!STRAPI_API_TOKEN) {
    console.error("❌ STRAPI_API_TOKEN is missing in .env.local");
    return null;
  }

  // Check if user has Pro plan
  //   const { has } = await auth();
  //   const subscriptionTier = has({ plan: "pro" }) ? "pro" : "free";
  const subscriptionTier = "free";

  if (!inFlight.has(user.id)) {
    inFlight.set(
      user.id,
      syncUser(user, subscriptionTier).finally(() => inFlight.delete(user.id)),
    );
  }
  return inFlight.get(user.id);
};

const findUser = async (clerkId) => {
  const response = await fetch(
    `${STRAPI_URL}/api/users?filters[clerkId][$eq]=${clerkId}`,
    {
      headers: {
        Authorization: `Bearer ${STRAPI_API_TOKEN}`,
      },
      cache: "no-store",
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Strapi error response: ${errorText}`);
  }

  const users = await response.json();
  return users[0] ?? null;
};

const syncUser = async (user, subscriptionTier) => {
  try {
    // Check if user exists in Strapi
    const existingUser = await findUser(user.id);

    if (existingUser) {
      // Update subscription tier if changed
      if (existingUser.subscriptionTier !== subscriptionTier) {
        await fetch(`${STRAPI_URL}/api/users/${existingUser.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${STRAPI_API_TOKEN}`,
          },
          body: JSON.stringify({ subscriptionTier }),
        });
      }

      return { ...existingUser, subscriptionTier };
    }

    // Get authenticated role
    const rolesResponse = await fetch(
      `${STRAPI_URL}/api/users-permissions/roles`,
      {
        headers: {
          Authorization: `Bearer ${STRAPI_API_TOKEN}`,
        },
      },
    );

    const rolesData = await rolesResponse.json();
    const authenticatedRole = rolesData.roles.find(
      (role) => role.type === "authenticated",
    );

    if (!authenticatedRole) {
      console.error("❌ Authenticated role not found");
      return null;
    }

    // Create new user here
    const userData = {
      username:
        user.username || user.emailAddresses[0].emailAddress.split("@")[0],
      email: user.emailAddresses[0].emailAddress,
      password: `clerk_managed_${user.id}_${Date.now()}`,
      confirmed: true,
      blocked: false,
      role: authenticatedRole.id,
      clerkId: user.id,
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      imageUrl: user.imageUrl || "",
      subscriptionTier,
    };

    const newUserResponse = await fetch(`${STRAPI_URL}/api/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${STRAPI_API_TOKEN}`,
      },
      body: JSON.stringify(userData),
    });

    if (!newUserResponse.ok) {
      // The user may have been created by another request in the meantime
      const createdElsewhere = await findUser(user.id);
      if (createdElsewhere) {
        return { ...createdElsewhere, subscriptionTier };
      }

      const errorText = await newUserResponse.text();
      console.error("❌ Error creating user:", errorText);
      return null;
    }

    const newUser = await newUserResponse.json();
    return newUser;
  } catch (error) {
    console.error("❌ Error in checkUser:", error.message);
    return null;
  }
};
