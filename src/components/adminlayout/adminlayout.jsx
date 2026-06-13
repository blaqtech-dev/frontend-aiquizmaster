import { useState } from "react";
import { Outlet } from "react-router-dom";
import { AdminSidebar } from "../adminsidebar/adminsidebar";

import "./adminlayout.css";

export function AdminLayout() {

  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  return (

    <div className="admin-layout">

      <button
  className="admin-menu-btn"
  onClick={() =>
    setSidebarOpen(!sidebarOpen)
  }
>
☰
</button>

      <AdminSidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      <main className="admin-main">
        <Outlet />
      </main>

    </div>
  );
}