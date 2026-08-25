import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  NavLink
} from "react-router-dom";

import "./App.css";

import Plant from "./components/Plant";
import Division from "./components/Division";
import Machine from "./components/Machine";
import Project from "./components/Project";
import Component from "./components/Components";
import Activity from "./components/Activities";
import SubActivities from "./components/SubActivities";
import Shifts from "./components/Shifts";
import Designation from "./components/Designation";
import Employee from "./components/Employee";

function App() {
  return (
    <Router>
      <div className="dashboard-layout">
        {/* Sidebar Navigation */}
        <aside className="sidebar">
          <div>
            <div className="sidebar-logo">
                <span style={{ fontSize: "1.5rem" }}>📊</span> MasterPortal
            </div>

            <div className="nav-section-title">MASTERS</div>
            
            <NavLink 
              to="/plants" 
              className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
            >
              Plants
            </NavLink>

            <NavLink 
              to="/divisions" 
              className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
            >
              Divisions
            </NavLink>

            <NavLink
              to="/machines"
              className={({ isActive }) =>
                `nav-item ${isActive ? "active" : ""}`
              }
            >
              Machines
            </NavLink>
            
            <NavLink
              to="/projects" 
              className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
            >
              Projects
            </NavLink>

            <NavLink
              to="/Components" 
              className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
            >
              Components
            </NavLink>

            <NavLink
              to="/activities"
              className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
            >
              Activities
            </NavLink>
            
            <NavLink
              to="/sub-activities"
              className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
            >
              Sub Activities
            </NavLink>

            <NavLink
              to="/shifts"
              className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
            >
              Shifts
            </NavLink>

            <NavLink
              to="/designations"
              className={({ isActive }) =>
                `nav-item ${isActive ? "active" : ""}`
              }
            >
              Designations
            </NavLink>

            <NavLink
              to="/employees"
              className={({ isActive }) =>
                `nav-item ${isActive ? "active" : ""}`
              }
            >
              Employees
            </NavLink>
            
            <div className="nav-item"></div>

            {/* <div className="nav-section-title mt-3">TRANSACTIONS</div>
            <div className="nav-item">Job Card</div>
            <div className="nav-item">Planner</div>

            <div className="nav-section-title mt-3">ANALYTICS</div>
            <div className="nav-item">Reports</div> */}
          </div>

          {/* Sidebar Footer User Info */}
          <div className="sidebar-user">
            <div className="user-avatar">RK</div>
            <div className="user-info">
              <div className="user-name">Rajesh Kumar</div>
              <div className="user-role">Plant Manager</div>
            </div>
          </div>
        </aside>

        {/* Main Content Dashboard */}
        <div className="main-content">
          {/* Top Header */}
          <header className="top-navbar">
            <input
              type="text"
              className="search-input"
              placeholder="🔍 Search..."
            />
            <div className="top-navbar-right">
              <span>Tue, 18 Aug, 2026</span>
              <span style={{ cursor: "pointer", fontSize: "1.1rem" }}>🔔</span>
            </div>
          </header>

          {/* Dynamic Route Area */}
          <main className="content-body">
            <Routes>
              <Route path="/plants" element={<Plant />} />
              <Route path="/divisions" element={<Division />} />
              <Route path="/machines" element={<Machine />} />
              <Route path="/projects" element={<Project />} />
              <Route path="/Components" element={<Component />} />
              <Route path="/Activities" element={<Activity />} />
              <Route path="/sub-activities" element={<SubActivities />} />
              <Route path="/shifts" element={<Shifts />} />
              <Route path="/designations" element={<Designation />} />
              <Route path="/employees" element={<Employee />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;