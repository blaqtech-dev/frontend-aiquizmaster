import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { supabase }
from "../../services/supabase/supabase";

const AuthContext =
  createContext();

export function AuthProvider({
  children,
}) {

  const [user, setUser] =
    useState(null);

  const [profile, setProfile] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  // ================= LOAD USER =================

  async function loadUser() {

    try {

      console.log(
        "START LOADING USER"
      );

      const {
        data: {
          session,
        },
        error,
      } =
        await supabase.auth.getSession();

      console.log(
        "SESSION:",
        session
      );

      if (error) {

        console.log(error);

        setLoading(false);

        return;
      }

      const currentUser =
        session?.user;

      // ================= NO USER =================

      if (!currentUser) {

        console.log(
          "NO USER"
        );

        setUser(null);

        setProfile(null);

        setLoading(false);

        return;
      }

      // ================= USER FOUND =================

      console.log(
        "USER FOUND"
      );

      setUser(currentUser);

      // ================= PROFILE =================

      try {

        const {
          data: profileData,
          error: profileError,
        } = await supabase

          .from("profiles")

          .select("*")

          .eq(
            "id",
            currentUser.id
          )

          .maybeSingle();

        console.log(
          "PROFILE:",
          profileData
        );

        console.log(
          "PROFILE ERROR:",
          profileError
        );

        // ================= CREATE PROFILE =================

        if (
          !profileData
        ) {

          console.log(
            "CREATING PROFILE"
          );

          const {
            data: newProfile,
            error:
              createError,
          } = await supabase

            .from("profiles")

            .upsert({
              id:
                currentUser.id,

              email:
                currentUser.email,

              username:
                currentUser
                  .user_metadata
                  ?.username ||

                currentUser.email
                  ?.split("@")[0],

             role: null,
            })

            .select()

            .single();

          console.log(
            "NEW PROFILE:",
            newProfile
          );

          console.log(
            "CREATE ERROR:",
            createError
          );

          setProfile(
            newProfile
          );

        } else {

          setProfile(
            profileData
          );
        }

      } catch (profileCatch) {

        console.log(
          "PROFILE CATCH ERROR",
          profileCatch
        );
      }

    } catch (err) {

      console.log(
        "MAIN ERROR",
        err
      );

    } finally {

      console.log(
        "LOADING FALSE"
      );

      setLoading(false);
    }
  }

  // ================= EFFECT =================

  useEffect(() => {

    loadUser();

    const {
      data: listener,
    } =
      supabase.auth.onAuthStateChange(

        async (
          event,
          session
        ) => {

          console.log(
            "AUTH EVENT:",
            event
          );

          const currentUser =
            session?.user || null;

          setUser(
            currentUser
          );

          if (!currentUser) {

            setProfile(null);

            setLoading(false);

            return;
          }

          setLoading(false);
        }
      );

    return () => {

      listener.subscription.unsubscribe();
    };

  }, []);

  // ================= LOGOUT =================

  async function logout() {

    await supabase.auth.signOut();

    setUser(null);

    setProfile(null);

    window.location.href =
      "/login";
  }

  return (

    <AuthContext.Provider
      value={{

        user,

        profile,

        loading,

        logout,

        isAuthenticated:
          !!user,
      }}
    >

      {children}

    </AuthContext.Provider>
  );
}

export function useAuth() {

  return useContext(
    AuthContext
  );
}