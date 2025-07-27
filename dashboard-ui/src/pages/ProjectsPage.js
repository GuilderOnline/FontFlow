// src/pages/ProjectsPage.jsx
import React from 'react';
import Sidebar from '../components/Sidebar';
import '../css/projects.css';

const projectList = [
  'Client Websites',
  'Marketing Materials',
  'Internal Apps',
];

const ProjectsPage = () => {
  return (
    <div className="main-layout">
      <Sidebar />
      <div className="main-content">
        <h2>Projects</h2>
        <div className="project-card">
          {projectList.map((project, idx) => (
            <div className="project-item" key={idx}>
              <span className="check">✔</span> {project}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProjectsPage;
