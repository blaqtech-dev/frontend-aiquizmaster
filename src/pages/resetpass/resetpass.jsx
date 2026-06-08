import { useState }
from "react";

import {
  useNavigate,
}
from "react-router-dom";

import { supabase } from "../../services/supabase/supabase";

import "./resetpassword.css";

export function ResetPasswordPage() {

  const navigate =
    useNavigate();

  const [password,
    setPassword] =
    useState("");

  const [confirmPassword,
    setConfirmPassword] =
    useState("");

  const [loading,
    setLoading] =
    useState(false);

  const [message,
    setMessage] =
    useState("");

  async function handleReset(e) {

    e.preventDefault();

    if (
      password !==
      confirmPassword
    ) {

      setMessage(
        "Passwords do not match."
      );

      return;
    }

    if (
      password.length < 8
    ) {

      setMessage(
        "Password must be at least 8 characters."
      );

      return;
    }

    setLoading(true);

    const { error } =
      await supabase.auth
        .updateUser({
          password,
        });

    setLoading(false);

    if (error) {

      setMessage(
        error.message
      );

      return;
    }

    alert(
      "Password updated successfully."
    );

    navigate("/login");
  }

  return (

    <div className="reset-page">

      <div className="reset-card">

        <h1>

          Create New Password

        </h1>

        <p>

          Enter your new password.

        </p>

        <form
          onSubmit={handleReset}
        >

          <input
            type="password"
            placeholder="New Password"
            value={password}
            onChange={(e)=>

              setPassword(
                e.target.value
              )
            }
            required
          />

          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e)=>

              setConfirmPassword(
                e.target.value
              )
            }
            required
          />

          <button
            disabled={loading}
          >

            {
              loading

                ? "Updating..."

                : "Update Password"
            }

          </button>

        </form>

        {
          message && (

            <p className="message">

              {message}

            </p>
          )
        }

      </div>

    </div>
  );
}