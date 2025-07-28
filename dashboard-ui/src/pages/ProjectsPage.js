// ProjectsPage.js

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import API_BASE from '../utils/api';

const ProjectsPage = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newProjectName, setNewProjectName] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await axios.get(`${API_BASE}/projects`, {
  params: { userId: user?.id }
});
      setProjects(res.data);
    } catch (err) {
      console.error('❌ Error fetching projects:', err);
    } finally {
      setLoading(false);
    }
  };

  const createProject = async () => {
  if (!newProjectName.trim()) return;

  if (!user || !user.id) {
    console.error('❌ Cannot create project: User not logged in or missing _id');
    return;
  }

  console.log('✅ Creating project with payload:', {
    name: newProjectName,
    userId: user.id,
  });

  try {
    const res = await axios.post(`${API_BASE}/projects`, {
      name: newProjectName,
      userId: user.id,
    });
    setProjects([...projects, res.data]);
    setNewProjectName('');
  } catch (err) {
    console.error('❌ Error creating project:', err);
  }
};


  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="dashboard-content">
        <h1>Projects</h1>

        <div className="create-project">
          <input
            type="text"
            placeholder="New project name"
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
          />
          <button onClick={createProject}>Create Project</button>
        </div>

        {loading ? (
          <p>Projects Loading...</p>
        ) : projects.length === 0 ? (
          <p>No projects found.</p>
        ) : (
          <ul>
            {projects.map((project) => (
              <li key={project._id} onClick={() => navigate(`/projects/${project._id}`)}>
                {project.name}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ProjectsPage;
