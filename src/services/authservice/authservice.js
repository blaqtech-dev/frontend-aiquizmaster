import { supabase } from "../supabase/supabase";

// ================= REGISTER =================

export async function registerUser(
  email,
  password,
  username
) {

  try {

    // ================= CREATE AUTH USER =================

    const {
      data,
      error,
    } = await supabase.auth.signUp({

      email,
      password,

      options: {
 emailRedirectTo:
        `${window.location.origin}/login`,
        data: {
          username,
        },
      },
    });

    // ================= HANDLE ERROR =================

    if (error) {

      return {
        data: null,
        error,
      };
    }

    // ================= CREATE PROFILE =================

    if (data?.user) {

      const {
        error: profileError,
      } = await supabase

        .from("profiles")

        .upsert([
          {
            id: data.user.id,

            email: data.user.email,

            username,

            role: null,

            avatar_url: "",

            bio: "",

            created_at:
              new Date().toISOString(),
          },
        ]);

      // ================= PROFILE ERROR =================

      if (profileError) {

        console.log(
          "PROFILE ERROR:",
          profileError
        );
      }
    }

    return {
      data,
      error: null,
    };

  } catch (err) {

    console.log(err);

    return {

      data: null,

      error: {
        message:
          "Something went wrong during registration.",
      },
    };
  }
}

// ================= LOGIN =================

export async function loginUser(
  email,
  password
) {

  try {

    const {
      data,
      error,
    } = await supabase.auth.signInWithPassword({

      email,
      password,
    });

    if (error) {

      return {
        data: null,
        error,
      };
    }

    // ================= ENSURE PROFILE EXISTS =================

    if (data?.user) {

      const {
        data: existingProfile,
        error: profileCheckError,
      } = await supabase

        .from("profiles")

        .select("*")

        .eq("id", data.user.id)

        .maybeSingle();

      console.log(
        "PROFILE CHECK:",
        existingProfile
      );

      console.log(
        "PROFILE ERROR:",
        profileCheckError
      );

      // ================= CREATE PROFILE IF MISSING =================

      if (!existingProfile) {

        const {
          error: createProfileError,
        } = await supabase

          .from("profiles")

          .upsert([
            {
              id: data.user.id,

              email: data.user.email,

              username:
                data.user.user_metadata
                  ?.username || "",

              role: null,

              avatar_url: "",

              bio: "",

              created_at:
                new Date().toISOString(),
            },
          ]);

        if (createProfileError) {

          console.log(
            "CREATE PROFILE ERROR:",
            createProfileError
          );
        }
      }
    }

    return {
      data,
      error: null,
    };

  } catch (err) {

    console.log(err);

    return {

      data: null,

      error: {
        message:
          "Something went wrong during login.",
      },
    };
  }
}

// ================= LOGOUT =================

export async function logoutUser() {

  return await supabase.auth.signOut();
}