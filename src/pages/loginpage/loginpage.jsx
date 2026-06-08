import { useState } from "react";

import { loginUser }
from "../../services/authservice/authservice";

import {
  useNavigate,
  Link
} from "react-router-dom";
import { supabase } from "../../services/supabase/supabase";

import "./loginpage.css";

export function LoginPage() {

  const navigate =
    useNavigate();

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [errorMsg, setErrorMsg] =
    useState("");

  async function handleLogin(e) {

    e.preventDefault();

    setLoading(true);

    setErrorMsg("");

    const {
      data,
      error,
    } = await loginUser(
      email,
      password
    );

    if (
  data?.user &&
  !data.user.email_confirmed_at
) {

  setErrorMsg(
    "Please verify your email before logging in."
  );

  setLoading(false);

  return;
}

    if (error) {

      setErrorMsg(error.message);

      setLoading(false);

      return;
    }

    if (data?.user) {

      if (!data.user.email_confirmed_at) {

  await supabase.auth.signOut();

  setErrorMsg(
    "Please verify your email before logging in."
  );

  setLoading(false);

  return;
}

      const {
        data: profile,
      } = await supabase

        .from("profiles")

        .select("role")

        .eq(
          "id",
          data.user.id
        )

        .maybeSingle();
        
const role = profile?.role;

if (!role) {
  navigate("/select-role", {
    state: { userId: data.user.id },
    replace: true,
  });
  return;
}

if (role === "teacher") {
  navigate("/teacher-dashboard", { replace: true });
  return;
}

navigate("/student-dashboard", { replace: true });
    }

    setLoading(false);
  }

  return (

    <div className="login-page">

      <div className="login-card">

        <h1>
          Welcome Back
        </h1>

        <p className="subtitle">

          Login to continue
          learning with AI quizzes

        </p>

        <form onSubmit={handleLogin}>

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) =>
              setEmail(
                e.target.value
              )
            }
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) =>
              setPassword(
                e.target.value
              )
            }
            required
          />

          {
            errorMsg && (

              <p className="error-text">

                {errorMsg}

              </p>
            )
          }

          <button disabled={loading}>

            {
              loading
                ? "Logging in..."
                : "Login"
            }

          </button>

        </form>

   <div className="forgot-container">

  <Link
    to="/forgot-password"
    className="forgot-link"
  >

    Forgot Password?

  </Link>

</div>

        <p className="register-text">

          Don’t have an account?

          {" "}

          <Link to="/register">

            Register

          </Link>

        </p>

      </div>

    </div>
  );
}