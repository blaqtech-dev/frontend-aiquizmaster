import { useEffect, useState } from "react";
import { supabase } from "../../../services/supabase/supabase";
import "./adminsettings.css";

export function AdminSettingsPage() {

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [settings, setSettings] =
    useState({

      free_pdf_limit: 3,

      free_ai_limit: 10,

      free_image_limit: 10,

      pro_price: 2000,

      maintenance_mode: false,

      allow_registration: true,

    });

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {

    try {

      const { data } =
        await supabase

          .from("settings")

          .select("*")

          .single();

      if (data) {

        setSettings(data);

      }

    } catch (err) {

      console.log(err);

    } finally {

      setLoading(false);

    }
  }

  async function saveSettings() {

    try {

      setSaving(true);

      const { error } =
        await supabase

          .from("settings")

          .update({

            free_pdf_limit:
              settings.free_pdf_limit,

            free_ai_limit:
              settings.free_ai_limit,

            free_image_limit:
              settings.free_image_limit,

            pro_price:
              settings.pro_price,

            maintenance_mode:
              settings.maintenance_mode,

            allow_registration:
              settings.allow_registration,

          })

          .eq("id", settings.id);

      if (error) throw error;

      alert(
        "Settings saved successfully"
      );

    } catch (err) {

      console.log(err);

      alert(
        "Failed to save settings"
      );

    } finally {

      setSaving(false);

    }
  }

  if (loading) {

    return (

      <div className="admin-settings-loading">

        <div className="admin-settings-loader"></div>

        <h2>
          Loading Settings...
        </h2>

      </div>

    );
  }

  return (

    <div className="admin-settings-page">

      <div className="settings-header">

        <span className="settings-badge">

          PLATFORM SETTINGS

        </span>

        <h1>
          Admin Settings
        </h1>

        <p>
          Control platform limits,
          pricing and maintenance.
        </p>

      </div>

      <div className="settings-grid">

        {/* PDF LIMIT */}

        <div className="settings-card">

          <label>
            Free PDF Upload Limit
          </label>

          <input
            type="number"
            value={
              settings.free_pdf_limit
            }
            onChange={(e) =>
              setSettings({
                ...settings,
                free_pdf_limit:
                  Number(
                    e.target.value
                  ),
              })
            }
          />

        </div>

        {/* AI LIMIT */}

        <div className="settings-card">

          <label>
            Free AI Tutor Limit
          </label>

          <input
            type="number"
            value={
              settings.free_ai_limit
            }
            onChange={(e) =>
              setSettings({
                ...settings,
                free_ai_limit:
                  Number(
                    e.target.value
                  ),
              })
            }
          />

        </div>

        {/* IMAGE LIMIT */}

        <div className="settings-card">

          <label>
            Free Image Tutor Limit
          </label>

          <input
            type="number"
            value={
              settings.free_image_limit
            }
            onChange={(e) =>
              setSettings({
                ...settings,
                free_image_limit:
                  Number(
                    e.target.value
                  ),
              })
            }
          />

        </div>

        {/* PRICE */}

        <div className="settings-card">

          <label>
            Pro Price (₦)
          </label>

          <input
            type="number"
            value={
              settings.pro_price
            }
            onChange={(e) =>
              setSettings({
                ...settings,
                pro_price:
                  Number(
                    e.target.value
                  ),
              })
            }
          />

        </div>

        {/* MAINTENANCE */}

        <div className="settings-card switch-card">

          <label>
            Maintenance Mode
          </label>

          <input
            type="checkbox"
            checked={
              settings.maintenance_mode
            }
            onChange={(e) =>
              setSettings({
                ...settings,
                maintenance_mode:
                  e.target.checked,
              })
            }
          />

        </div>

        {/* REGISTRATION */}

        <div className="settings-card switch-card">

          <label>
            Allow Registration
          </label>

          <input
            type="checkbox"
            checked={
              settings.allow_registration
            }
            onChange={(e) =>
              setSettings({
                ...settings,
                allow_registration:
                  e.target.checked,
              })
            }
          />

        </div>

      </div>

      <button
        className="save-settings-btn"
        onClick={saveSettings}
        disabled={saving}
      >

        {
          saving
            ? "Saving..."
            : "Save Settings"
        }

      </button>

    </div>
  );
}