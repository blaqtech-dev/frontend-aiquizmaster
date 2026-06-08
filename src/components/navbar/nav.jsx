import {
  Link,
  NavLink,
  useNavigate,
  useLocation,
} from "react-router-dom";

import {
  useEffect,
  useState,
} from "react";

import {
  Menu,
  X,
  GraduationCap,
} from "lucide-react";

import { NotificationBell }
from "../notification/notification";

import { supabase }
from "../../services/supabase/supabase";

import { useAuth }
from "../../context/authcontext/authcontext";

import "./nav.css";

export function Navbar() {

  const {
    user,
    logout,
  } = useAuth();

  const [avatarUrl, setAvatarUrl] = useState("");
const [username, setUsername] = useState("");

  const navigate =
    useNavigate();

  const location =
    useLocation();

  const [menuOpen,
    setMenuOpen] =
    useState(false);

  const [role, setRole] =
  useState(null);

const [plan, setPlan] =
  useState("free");

  // ================= CLOSE MENU =================

  function closeMenu() {

    setMenuOpen(false);
  }

  // ================= GET ROLE =================

  useEffect(() => {

    if (user) {

      getRole();

    } else {

      setRole(null);
    }

  }, [user]);

  // ================= AUTO CLOSE ON ROUTE =================

  useEffect(() => {

    closeMenu();

  }, [location.pathname]);

 async function getRole() {

  try {

    const { data, error } =
      await supabase

        .from("profiles")

        .select(`
          role,
          plan,
          username,
          avatar_url
        `)

        .eq("id", user.id)

        .maybeSingle();

    if (error) {

      console.log(error);

      return;
    }

    setRole(
      data?.role || null
    );

    setPlan(
      data?.plan || "free"
    );

    setUsername(
      data?.username || "User"
    );

    setAvatarUrl(
      data?.avatar_url || ""
    );

  } catch (error) {

    console.log(error);
  }
}

  // ================= DASHBOARD =================

  function goDashboard() {

    closeMenu();

    if (role === "teacher") {

      navigate("/teacher-dashboard");

    } else {

      navigate("/student-dashboard");
    }
  }

  // ================= LOGOUT =================

  async function handleLogout() {

    await logout();

    closeMenu();

    navigate("/");
  }

  // ================= NAV LINK =================

  function navLinkClass({
    isActive,
  }) {

    return isActive
      ? "active-link"
      : "";
  }


  useEffect(() => {

  const refreshProfile = () => {
    if (user) {
      getRole();
    }
  };

  window.addEventListener(
    "profile-updated",
    refreshProfile
  );

  return () => {

    window.removeEventListener(
      "profile-updated",
      refreshProfile
    );
  };

}, [user]);


useEffect(() => {

  if (!user?.id) return;

  const channel =
    supabase
      .channel("profile-updates")

      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "profiles",
          filter: `id=eq.${user.id}`,
        },

        (payload) => {

          setUsername(
            payload.new.username
          );

          setAvatarUrl(
            payload.new.avatar_url
          );
        }
      )

      .subscribe();

  return () => {

    supabase.removeChannel(
      channel
    );
  };

}, [user?.id]);

  return (

    <header className="navbar-wrapper">

      <nav className="navbar">

        {/* ================= LEFT ================= */}

        <button

          className="logo-btn"

          onClick={() => {

            navigate("/");

            closeMenu();
          }}
        >

          <GraduationCap size={26} />

          <span>

            AI QuizMaster

          </span>

        </button>

        {/* ================= MOBILE BUTTON ================= */}

        <button

          className="mobile-menu-btn"

          onClick={() =>
            setMenuOpen(
              !menuOpen
            )
          }
        >

          {
            menuOpen
              ? <X size={26} />
              : <Menu size={26} />
          }

        </button>

        {/* ================= CENTER ================= */}

        <div className={`nav-center ${menuOpen ? "show-menu" : ""}`}>

          {/* ================= GUEST ================= */}

          {
            !user && (

              <>

                <NavLink
                  to="/"
                  className={navLinkClass}
                >

                  Home

                </NavLink>

                <NavLink
                  to="/login"
                  className={navLinkClass}
                >

                  Login

                </NavLink>

                <Link
                  to="/register"
                  className="register-btn"
                >

                  Register

                </Link>

              </>
            )
          }

          {/* ================= STUDENT ================= */}

          {
            role === "student" && (

              <>

                <button
                  className="nav-text-btn"
                  onClick={goDashboard}
                >

                  Dashboard

                </button>

 {plan !== "pro" && (

    <NavLink
      to="/upgrade"
      className={navLinkClass}
    >

      Upgrade

    </NavLink>

  )}



             

                <NavLink
                  to="/global-feed"
                  className={navLinkClass}
                >

                  Feed

                </NavLink>

              
              

                <NavLink
                  to="/multiplayer"
                  className={navLinkClass}
                >

                  Multiplayer

                </NavLink>

                
                 <NavLink
                  to="/profile"
                  className={navLinkClass}
                >

                Profile

                </NavLink>

                 <NavLink
                  to="/quizstorage"
                  className={navLinkClass}
                >

                  pdf storage

                </NavLink>

                <NavLink
                  to="/leaderboard"
                  className={navLinkClass}
                >

                  Leaderboard

                </NavLink>

              

              </>
            )
          }

          {/* ================= TEACHER ================= */}

          {
            role === "teacher" && (

              <>

                <button
                  className="nav-text-btn"
                  onClick={goDashboard}
                >

                  Dashboard

                </button>

                <NavLink
                  to="/subjects"
                  className={navLinkClass}
                >

                  Subjects

                </NavLink>

                <NavLink
                  to="/global-feed"
                  className={navLinkClass}
                >

                  Feed

                </NavLink>

                   <NavLink
                  to="/quizstorage"
                  className={navLinkClass}
                >

                  pdf storage

                </NavLink>


                 <NavLink
                  to="/profile"
                  className={navLinkClass}
                >

                Profile

                </NavLink>

          
 <NavLink
                  to="/multiplayer"
                  className={navLinkClass}
                >

                  Multiplayer

                </NavLink>

                <NavLink
                  to="/leaderboard"
                  className={navLinkClass}
                >

                  Leaderboard

                </NavLink>

                 {plan !== "pro" && (

    <NavLink
      to="/upgrade"
      className={navLinkClass}
    >

      Upgrade

    </NavLink>

  )}

              </>
            )
          }

        </div>

        {/* ================= RIGHT ================= */}

        {
          user && (

            <div className="nav-right">

              <NotificationBell
                user={user}
              />

              <div className="user-profile">

               <div className="avatar">

  {avatarUrl ? (

    <img
      src={avatarUrl}
      alt="avatar"
      className="navbar-avatar-image"
    />

  ) : (

    user?.email
      ?.charAt(0)
      .toUpperCase()

  )}

</div>
<div className="user-meta">

  <h4>

  {
  username || "User"
}

  </h4>

  <span>

    {role || "student"}

  </span>

  <small
    className={
      plan === "pro"
        ? "plan-pro"
        : "plan-free"
    }
  >

    {plan === "pro"
      ? "PRO"
      : "FREE"}

  </small>

</div>

              </div>

              <button
                className="logout-btn"
                onClick={handleLogout}
              >

                Logout

              </button>

            </div>
          )
        }

      </nav>

    </header>
  );
}