import { useEffect, useState } from "react";
import { supabase } from "../../services/supabase/supabase";
import { useAuth } from "../../context/authcontext/authcontext";
import {
  PaystackButton,
} from "react-paystack";


import "./upgrade.css";

export function UpgradePage() {

    const API = import.meta.env.VITE_API_URL;


 const { user } = useAuth();

const paystackConfig = {

  reference:
    new Date().getTime()
    .toString(),

  email:
    user?.email,

  amount:
    2000 * 100,

  publicKey:
    "pk_test_d360f0e0deb5d9aa2654ba3e5405b440def855c7",

};

 

  const [plan, setPlan] =
    useState("free");

  useEffect(() => {

    async function loadPlan() {

      if (!user) return;

      const { data } =
        await supabase

          .from("profiles")

          .select("plan")

          .eq("id", user.id)

          .single();

      if (data) {

        setPlan(
          data.plan || "free"
        );
      }
    }

    loadPlan();

  }, [user]);



  async function onSuccess(
  reference
) {

  try {

    const response =
      await fetch(

       `${API}/api/verify-payment`,

        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({

            reference:
              reference.reference,

            userId:
              user.id,
          }),
        }
      );

    const data =
      await response.json();

    if (data.success) {

      alert(
        "Welcome to Pro 🎉"
      );

      window.location.reload();
    }

  } catch (error) {

    console.log(error);
  }
}

  function handleUpgrade() {

    alert(
      "Paystack integration coming next step."
    );
  }

  return (

    <div className="upgrade-page">

      <div className="upgrade-container">

        <div className="upgrade-header">

          <h1>

            Upgrade To Pro

          </h1>

          <p>

            Unlock unlimited AI learning,
            PDF uploads, quizzes,
            flashcards, image tutor
            and premium features.

          </p>

        </div>

        <div className="current-plan-card">

          <span>
            Current Plan
          </span>

          <h2>

            {plan.toUpperCase()}

          </h2>

        </div>

        <div className="pricing-grid">

          {/* FREE */}

          <div className="pricing-card free">

            <h2>Free</h2>

            <h1>₦0</h1>

            <span>Forever</span>

            <ul>

              <li>
             15 pdf upload
              </li>

              <li>
                10 AI Tutor Questions 
              </li>

              <li>
                10 Image Tutor Analyses 
              </li>

              <li>
                Basic Analytics
              </li>

              <li>
                Basic Leaderboard
              </li>

            </ul>

            <button
              disabled
            >
              Current Plan
            </button>

          </div>

          {/* PRO */}

          <div className="pricing-card pro">

            <div className="pro-badge">

              MOST POPULAR

            </div>

            <h2>Pro</h2>

            <h1>₦2,000</h1>

            <span>Per Month</span>

         <ul>

  <li>
    Unlimited PDFs
  </li>

  <li>
    Unlimited AI Tutor
  </li>

  <li>
    Unlimited Quizzes
  </li>

  <li>
    Unlimited Flashcards
  </li>

  <li>
    Unlimited Image Tutor
  </li>

  <li>
    Advanced Analytics
  </li>

  <li>
    Create Multiplayer Rooms
  </li>

  <li>
    Create Classrooms
  </li>

  <li>
    Create Assignments
  </li>

  <li>
    Post Updates To Global Feed
  </li>

  <li>
    Priority AI Processing
  </li>

  <li>
    Future Premium Features
  </li>

</ul>

          <PaystackButton

  {...paystackConfig}

  text="Upgrade Now"

  onSuccess={onSuccess}

  onClose={() =>
    console.log(
      "Payment closed"
    )
  }

  className="upgrade-pay-btn"
/>

          </div>


          
        <div className="premium-benefits">

  <h2>
    What Happens After Upgrading?
  </h2>

  <div className="benefits-grid">

    <div className="benefit-card">

      <span>🏫</span>

      <h3>
        Create Classrooms
      </h3>

      <p>

        Build unlimited classrooms
        and manage your students.

      </p>

    </div>

    <div className="benefit-card">

      <span>📝</span>

      <h3>
        Create Assignments
      </h3>

      <p>

        Publish assignments
        and grade submissions.

      </p>

    </div>

    <div className="benefit-card">

      <span>🎮</span>

      <h3>
        Multiplayer Host
      </h3>

      <p>

        Create and host
        multiplayer quiz battles.

      </p>

    </div>

    <div className="benefit-card">

      <span>📢</span>

      <h3>
        Global Feed Posting
      </h3>

      <p>

        Share updates,
        announcements and achievements.

      </p>

    </div>

    <div className="benefit-card">

      <span>🤖</span>

      <h3>
        Unlimited AI
      </h3>

      <p>

        No daily limits on
        tutoring or learning.

      </p>

    </div>

    <div className="benefit-card">

      <span>📊</span>

      <h3>
        Premium Analytics
      </h3>

      <p>

        Track detailed learning
        performance and growth.

      </p>

    </div>

  </div>

</div>

        </div>



      </div>

    </div>
  );
}