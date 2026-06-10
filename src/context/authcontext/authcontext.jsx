import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { supabase } from "../../services/supabase/supabase";

const AuthContext = createContext();

// ================= CONTEXT PROVIDER =================

export function AuthProvider({ children }) {

  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
 const [authLoading, setAuthLoading] = useState(true);
const [profileLoading, setProfileLoading] = useState(false);


  // ================= LOAD PROFILE =================

async function loadProfile(userId) {
  console.log("PROFILE STEP 1", userId);

  setProfileLoading(true);

const { data, error } = await supabase
  .from("profiles")
  .select("*")
  .eq("id", userId)
  .maybeSingle();

setProfileLoading(false);

  if (error) {
    console.log("PROFILE ERROR:", error);
    setProfile(null);
    return null;
  }

  setProfile(data);
  return data;
}

  // ================= LOAD USER =================
async function loadUser() {
  console.log("START LOADING USER");

  setAuthLoading(true);

  try {
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      setUser(null);
      setProfile(null);
      return;
    }

    const currentUser = data?.session?.user || null;

    setUser(currentUser);

    if (!currentUser) {
      setProfile(null);
      return;
    }

    await loadProfile(currentUser.id);

  } catch (err) {
    console.log("LOAD USER ERROR:", err);

  } finally {
    setAuthLoading(false);
  }
}

  // ================= INIT EFFECT =================

useEffect(() => {

  loadUser();

  const handleProfileUpdate = async () => {

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session?.user) {

    await loadProfile(
      session.user.id
    );
  }
};

window.addEventListener(
  "profile-updated",
  handleProfileUpdate
);

  const { data: listener } =
    supabase.auth.onAuthStateChange(
      async (event, session) => {

        console.log(
          "AUTH EVENT:",
          event
        );

        const currentUser =
          session?.user || null;

        setUser(currentUser);

        if (!currentUser) {

          setProfile(null);

          return;
        }

        // wait a little after sign in
        if (
          event === "SIGNED_IN" ||
          event === "INITIAL_SESSION"
        ) {

          setTimeout(async () => {

            await loadProfile(
              currentUser.id
            );

          }, 500);
        }
      }
    );
return () => {

  listener.subscription.unsubscribe();

  window.removeEventListener(
    "profile-updated",
    handleProfileUpdate
  );
};

}, []);

  // ================= LOGOUT =================

  async function logout() {

    await supabase.auth.signOut();

    setUser(null);
    setProfile(null);

    window.location.href = "/login";
  }

  // ================= PROVIDER =================

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
    loading: authLoading,
profileLoading,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ================= HOOK =================

export function useAuth() {
  return useContext(AuthContext);
}