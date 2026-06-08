import { useState } from "react";

import { supabase }
from "../../services/supabase/supabase";

import "./forgotpassword.css";

import { useNavigate } from "react-router-dom";

export function ForgotPasswordPage() {

  const [email, setEmail] =
    useState("");

   const navigate=useNavigate()

  const [loading, setLoading] =
    useState(false);

  const [message, setMessage] =
    useState("");

  async function handleSubmit(e) {

    e.preventDefault();

    setLoading(true);

    setMessage("");

    const { error } =
      await supabase.auth
        .resetPasswordForEmail(
          email,
          {
            redirectTo:
              `${window.location.origin}/reset-password`,
          }
        );

    setLoading(false);

    if (error) {

      setMessage(error.message);

      return;
    }
    

    setMessage(
      "Password reset email sent. Check your inbox."
    );
  }

  return (

    <div className="forgot-page">

      <div className="forgot-card">

        <h1>

          Forgot Password

        </h1>

        <p>

          Enter your email address and
          we'll send a password reset link.

        </p>

        <form
          onSubmit={handleSubmit}
        >

          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e)=>

              setEmail(
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

                ? "Sending..."

                : "Send Reset Link"
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