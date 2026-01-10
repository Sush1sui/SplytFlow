import { createClient } from "@supabase/supabase-js";
import { db } from "@splytflow/db";
import { users } from "@splytflow/db/src/schema";
import { eq } from "drizzle-orm";

// Create Supabase admin client with service role (bypasses RLS)
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

export async function createUserProfile(accessToken: string) {
  // Verify the token and get user info
  const {
    data: { user },
    error: authError,
  } = await supabaseAdmin.auth.getUser(accessToken);

  if (authError || !user) {
    throw new Error("Invalid or expired access token");
  }

  console.log("[AuthService] Checking user profile for:", user.id);

  // Check if user already exists by supabaseId
  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.supabaseId, user.id))
    .limit(1);

  if (existingUser.length > 0) {
    console.log("[AuthService] User already exists");
    console.log("[AuthService] Existing User:", existingUser[0]);
    return existingUser[0];
  }

  // Check if user exists by email (in case supabaseId changed after deletion)
  const existingUserByEmail = await db
    .select()
    .from(users)
    .where(eq(users.email, user.email || ""))
    .limit(1);

  if (existingUserByEmail.length > 0) {
    console.log(
      "[AuthService] User exists with same email, updating supabaseId"
    );
    // Update the existing user with new supabaseId
    const [updatedUser] = await db
      .update(users)
      .set({
        supabaseId: user.id,
        displayName:
          user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          existingUserByEmail[0]?.displayName ||
          "",
        avatarUrl:
          user.user_metadata?.avatar_url ||
          user.user_metadata?.picture ||
          existingUserByEmail[0]?.avatarUrl ||
          "",
      })
      .where(eq(users.email, user.email || ""))
      .returning();
    console.log("[AuthService] User updated successfully");
    return updatedUser;
  }

  console.log("[AuthService] Creating user profile for:", user.id);

  // Create new user profile
  const [newUser] = await db
    .insert(users)
    .values({
      supabaseId: user.id,
      email: user.email || "",
      displayName:
        user.user_metadata?.full_name || user.user_metadata?.name || "",
      avatarUrl:
        user.user_metadata?.avatar_url || user.user_metadata?.picture || "",
    })
    .returning();

  console.log("[AuthService] User profile created successfully");
  return newUser;
}
