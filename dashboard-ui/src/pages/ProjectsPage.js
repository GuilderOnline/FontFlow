// ProjectsPage.js
// ...same imports as before
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import API_BASE from '../utils/api';
import '../css/dashboard.css';

const ProjectsPage = () => {
  const [projects, setProjects] = useState([]);
  const [fonts, setFonts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newProject, setNewProject] = useState({ name: '', url: '', description: '' });
  const [editingId, setEditingId] = useState(null);
  const [editedProject, setEditedProject] = useState({});
  const [selectedFontIds, setSelectedFontIds] = useState({});
  const navigate = useNavigate();

  // ✅ Destructure user + token from AuthContext
  const { user, token } = useAuth();

  useEffect(() => {
    fetchProjects();
    fetchFonts();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await axios.get(`${API_BASE}/projects`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // ✅ Filter for non-admins
      const visibleProjects =
        user?.role === 'admin'
          ? res.data
          : res.data.filter((p) => p.ownerId === user?.id);

      setProjects(visibleProjects);
    } catch (err) {
      console.error('❌ Error fetching projects:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchFonts = async () => {
    try {
      const res = await axios.get(`${API_BASE}/fonts`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setFonts(res.data);
    } catch (err) {
      console.error('❌ Error fetching fonts:', err);
    }
  };

  // ... ✅ rest of your existing createProject, updateProject, deleteProject, font assign/remove code remains unchanged

  return (
    <div className="dashboard-container flex">
      <Sidebar />
      <div className="dashboard-content p-6 flex-1">
        <h1 className="text-2xl font-bold mb-6">Projects</h1>

        {/* ✅ All your existing JSX for Create Project form, project list, editing stays the same */}
        {/* ... unchanged */}
      </div>
    </div>
  );
};

export default ProjectsPage;
