import { useEffect, useState } from "react";
import { supabase } from "../../../services/supabase/supabase";
import "./adminpayment.css";

export function AdminPaymentsPage() {

  const [payments, setPayments] =
    useState([]);

  const [filteredPayments,
    setFilteredPayments] =
    useState([]);

  const [loading,
    setLoading] =
    useState(true);

  const [search,
    setSearch] =
    useState("");

  const [stats,
    setStats] =
    useState({
      revenue: 0,
      successful: 0,
      failed: 0,
      total: 0,
    });

  useEffect(() => {
    loadPayments();
  }, []);

  useEffect(() => {

    const filtered =
      payments.filter(
        (payment) =>

          payment.email
            ?.toLowerCase()
            .includes(
              search.toLowerCase()
            ) ||

          payment.reference
            ?.toLowerCase()
            .includes(
              search.toLowerCase()
            )
      );

    setFilteredPayments(
      filtered
    );

  }, [search, payments]);

  async function loadPayments() {

    try {

      setLoading(true);

      const {
        data,
        error,
      } = await supabase

        .from("payments")

        .select("*")

        .order(
          "created_at",
          {
            ascending: false,
          }
        );

      if (error) throw error;

      setPayments(
        data || []
      );

      setFilteredPayments(
        data || []
      );

      const revenue =
        data?.reduce(
          (sum, item) =>
            sum +
            Number(
              item.amount || 0
            ),
          0
        ) || 0;

      setStats({

        revenue,

        successful:
          data?.filter(
            (p) =>
              p.status ===
              "success"
          ).length || 0,

        failed:
          data?.filter(
            (p) =>
              p.status !==
              "success"
          ).length || 0,

        total:
          data?.length || 0,

      });

    } catch (err) {

      console.log(err);

    } finally {

      setLoading(false);

    }
  }

  if (loading) {

    return (

      <div className="admin-payments-loading">

        <div className="admin-payments-loader"></div>

        <h2>
          Loading Payments...
        </h2>

      </div>
    );
  }

  return (

    <div className="admin-payments-page">

      <div className="admin-payments-header">

        <span className="admin-badge">
          PAYMENT MANAGEMENT
        </span>

        <h1>
          Platform Revenue
        </h1>

        <p>
          Monitor all Paystack payments
          and Pro upgrades.
        </p>

      </div>

      {/* STATS */}

      <div className="payments-stats-grid">

        <div className="payment-card">

          <h2>
            ₦{stats.revenue.toLocaleString()}
          </h2>

          <p>
            Total Revenue
          </p>

        </div>

        <div className="payment-card">

          <h2>
            {stats.total}
          </h2>

          <p>
            Total Payments
          </p>

        </div>

        <div className="payment-card">

          <h2>
            {stats.successful}
          </h2>

          <p>
            Successful
          </p>

        </div>

        <div className="payment-card">

          <h2>
            {stats.failed}
          </h2>

          <p>
            Failed
          </p>

        </div>

      </div>

      {/* SEARCH */}

      <div className="payment-search">

        <input

          type="text"

          placeholder="
          Search email or reference...
          "

          value={search}

          onChange={(e) =>
            setSearch(
              e.target.value
            )
          }

        />

      </div>

      {/* TABLE */}

      <div className="table-wrapper">

        <table>

          <thead>

            <tr>

              <th>
                Email
              </th>

              <th>
                Reference
              </th>

              <th>
                Amount
              </th>

              <th>
                Status
              </th>

              <th>
                Date
              </th>

            </tr>

          </thead>

          <tbody>

            {filteredPayments.map(
              (payment) => (

                <tr
                  key={payment.id}
                >

                  <td>
                    {payment.email}
                  </td>

                  <td>
                    {payment.reference}
                  </td>

                  <td>
                    ₦
                    {Number(
                      payment.amount
                    ).toLocaleString()}
                  </td>

                  <td>

                    <span
                      className={
                        payment.status ===
                        "success"

                          ? "success"

                          : "failed"
                      }
                    >

                      {payment.status}

                    </span>

                  </td>

                  <td>

                    {new Date(
                      payment.created_at
                    ).toLocaleString()}

                  </td>

                </tr>
              )
            )}

          </tbody>

        </table>

      </div>

    </div>
  );
}