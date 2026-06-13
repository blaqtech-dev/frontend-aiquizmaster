import { useEffect, useState } from "react";
import { supabase } from "../../services/supabase/supabase";
import { useAuth } from "../../context/authcontext/authcontext";


import "./upgrade.css";

export function UpgradePage() {

    const API = import.meta.env.VITE_API_URL;

    console.log(API);


 const { user } = useAuth();

const [processing, setProcessing] =
  useState(false);

  const [processingPayment, setProcessingPayment] =
  useState(false);

 

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



  async function refreshPlan() {

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


async function onSuccess(reference) {

  if (!reference || !user?.id) {
    return;
  }

  try {

    setProcessingPayment(true);

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
            reference,
            userId: user.id,
          }),
        }
      );

    const data =
      await response.json();

   if (
  response.ok &&
  data.success
) {

  await refreshPlan();

  alert(
    "Welcome to Pro 🎉"
  );

} else {

      alert(
        data.message ||
        "Verification failed"
      );
    }

  } catch (error) {

    console.log(error);

    alert(
      "Payment successful but verification failed. Please wait a few seconds and refresh."
    );

  } finally {

    setProcessingPayment(false);

  }
}
  function handleUpgrade() {

    alert(
      "Paystack integration coming next step."
    );
  }


function handlePaystackPayment() {


  if (processingPayment) return;
  
  if (!user?.email) {
    alert("User not loaded");
    return;
  }

  const handler = window.PaystackPop.setup({
    key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
    email: user.email,
    amount: 2000 * 100,
    currency: "NGN",

    callback: function (response) {
     onSuccess(response.reference);
    },

    onClose: function () {
      console.log("Payment closed");
    },
  });

  handler.openIframe();
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

            <span>one time payment</span>

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

{
  processingPayment && (

    <div
      className="payment-loading"
    >

      Verifying payment...
      Please wait.

    </div>
  )
}
<button
  className="upgrade-pay-btn"
  onClick={handlePaystackPayment}
  disabled={
    plan === "pro" ||
    processingPayment
  }
>
{
  processingPayment
    ? "Activating Pro..."
    : plan === "pro"
    ? "Pro Activated"
    : "Upgrade Now"
}

</button>

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