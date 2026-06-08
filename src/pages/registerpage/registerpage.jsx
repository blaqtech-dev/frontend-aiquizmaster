import { useState } from "react";
import { registerUser } from "../../services/authservice/authservice";
import { useNavigate, Link } from "react-router-dom";
import "./registerpage.css";

export function RegisterPage() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  async function handleRegister(e) {
    e.preventDefault();
   
    setErrorMsg("");

       if (
      password.length < 8
    ) {

      setErrorMsg(
        "Password must be at least 8 characters."
      );

      return;
    }

     setLoading(true);

    const { data, error } = await registerUser(
      email,
      password,
      username
    );

  

    console.log("REGISTER DATA:", data);
console.log("REGISTER ERROR:", error);

    setLoading(false);
   if (!error) {

  setSuccessMsg(
    "Account created successfully. Please check your email and confirm your account before logging in."
  );

  setUsername("");
  setEmail("");
  setPassword("");
}

    if (error) {

  if (
    error.message.includes(
      "rate limit"
    )
  ) {

    setErrorMsg(
      "Too many registration attempts. Please try again later."
    );

  } else {

    setErrorMsg(
      error.message
    );

  }

  return;
}

   if (data?.user) {

  setSuccessMsg(
    "Account created successfully"
  );


  setTimeout(()=>{
 setSuccessMsg(
    ""
  );

  },2500)
  setUsername("");
  setEmail("");
  setPassword("");

}
  }

  return (
    <div className="register-page">

      <div className="register-card">

        <h1>Create Account</h1>
        <p className="subtitle">
          Join and start learning with AI-powered quizzes
        </p>

        <form onSubmit={handleRegister}>

          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {errorMsg && (
            <p className="error-text">{errorMsg}</p>
          )}


{successMsg && (
  <p className="success-text">
    {successMsg}
  </p>
)}


          <button disabled={loading}>
            {loading ? "Creating account..." : "Register"}
          </button>

        </form>

        <p className="login-text">
          Already have an account?{" "}
          <Link to="/login">Login</Link>
        </p>

      </div>

    </div>
  );
}