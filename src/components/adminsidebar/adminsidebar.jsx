import { NavLink } from "react-router-dom";

import {
  LayoutDashboard,
  Users,
  CreditCard,
  BarChart3,
  School,
  Brain,
  Bell,
  FileText,
  Settings,
  BookOpen
} from "lucide-react";

import "./adminsidebar.css";

export function AdminSidebar({
  sidebarOpen,
  setSidebarOpen,
}) {

  return (

<aside
  className={`admin-sidebar ${
    sidebarOpen
      ? "open"
      : ""
  }`}
>

      <h2>AIQuizMaster</h2>
<NavLink
  to="/admin-dashboard"
  onClick={() =>
    setSidebarOpen(false)
  }
>
  Dashboard
</NavLink>


<NavLink
  to="/admin-users"
  onClick={() =>
    setSidebarOpen(false)
  }
  
>
    <Users size={18}/>
users
</NavLink>



<NavLink
to="/admin-payments"
  onClick={() =>
    setSidebarOpen(false)
  }
  
>
    <CreditCard size={18}/>
     Payments
</NavLink>


<NavLink
to="/admin-analytics"
  onClick={() =>
    setSidebarOpen(false)
  }
  
>
     <BarChart3 size={18}/>
       Analytics
</NavLink>

<NavLink
 to="/admin-classrooms"
  onClick={() =>
    setSidebarOpen(false)
  }
  
>
     <School size={18}/>
     Classrooms
</NavLink>




<NavLink
to="/admin-quizzes"
  onClick={() =>
    setSidebarOpen(false)
  }
  
>
   <BookOpen size={18}/>
       Quizzes
</NavLink>
    

    <NavLink
to="/admin-ai-monitor"
  onClick={() =>
    setSidebarOpen(false)
  }
  
>
  <Brain size={18}/>
      AI Monitor
</NavLink>



      <NavLink to="/admin-report"
       onClick={() =>
    setSidebarOpen(false)
  }
      >
        <FileText size={18}/>
        Reports
      </NavLink>

      <NavLink to="/admin-settings"
       onClick={() =>
    setSidebarOpen(false)
  }
      >
        <Settings size={18}/>
        Settings
      </NavLink>

    </aside>

  );
}