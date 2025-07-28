// ProjectsPage.js

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
      setProjects(res.data);
    } catch (err) {
      console.error('❌ Error fetching projects:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchFonts = async () => {
    try {
      console.log('📛 Token used for fonts fetch:', token);
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

  const createProject = async () => {
    const { name, url, description } = newProject;
    if (!name.trim()) return;

    try {
      const res = await axios.post(
        `${API_BASE}/projects`,
        { name, url, description },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setProjects((prev) => [...prev, res.data]);
      setNewProject({ name: '', url: '', description: '' });
    } catch (err) {
      console.error('❌ Error creating project:', err);
    }
  };

  const updateProject = async (id) => {
    try {
      const res = await axios.put(
        `${API_BASE}/projects/${id}`,
        editedProject,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setProjects((prev) => prev.map((proj) => (proj._id === id ? res.data : proj)));
      setEditingId(null);
      setEditedProject({});
    } catch (err) {
      console.error('❌ Error updating project:', err);
    }
  };

  const deleteProject = async (id) => {
    try {
      await axios.delete(`${API_BASE}/projects/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setProjects((prev) => prev.filter((proj) => proj._id !== id));
    } catch (err) {
      console.error('❌ Error deleting project:', err);
    }
  };

  const handleFontAssignment = async (projectId) => {
    const fontId = selectedFontIds[projectId];
    if (!fontId) return;

    try {
      await axios.post(
        `${API_BASE}/projects/${projectId}/fonts`,
        { fontId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      fetchProjects();
    } catch (err) {
      console.error('❌ Error assigning font:', err);
    }
  };

  const handleFontRemoval = async (projectId, fontId) => {
    try {
      await axios.delete(`${API_BASE}/projects/${projectId}/fonts/${fontId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      fetchProjects();
    } catch (err) {
      console.error('❌ Error removing font:', err);
    }
  };

  return (
    <div className="dashboard-container flex">
      <Sidebar />

      <div className="dashboard-content p-6 flex-1">
        <h1 className="text-2xl font-bold mb-6">Projects</h1>

        <div className="bg-white shadow-md rounded-md p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">Create New Project</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Project name"
              value={newProject.name}
              onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
              className="border px-3 py-2 rounded"
            />
            <input
              type="text"
              placeholder="Project URL"
              value={newProject.url}
              onChange={(e) => setNewProject({ ...newProject, url: e.target.value })}
              className="border px-3 py-2 rounded"
            />
            <input
              type="text"
              placeholder="Description"
              value={newProject.description}
              onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
              className="border px-3 py-2 rounded"
            />
          </div>
          <button
            onClick={createProject}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Create Project
          </button>
        </div>

        {loading ? (
          <p>Projects loading...</p>
        ) : projects.length === 0 ? (
          <p>No projects found.</p>
        ) : (
          <div className="space-y-4">
            {projects.map((project) => (
              <div
                key={project._id}
                className="border border-gray-300 rounded p-4 bg-white shadow"
              >
                {editingId === project._id ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input
                      type="text"
                      value={editedProject.name || ''}
                      onChange={(e) => setEditedProject({ ...editedProject, name: e.target.value })}
                      className="border px-2 py-1 rounded"
                    />
                    <input
                      type="text"
                      value={editedProject.url || ''}
                      onChange={(e) => setEditedProject({ ...editedProject, url: e.target.value })}
                      className="border px-2 py-1 rounded"
                    />
                    <input
                      type="text"
                      value={editedProject.description || ''}
                      onChange={(e) => setEditedProject({ ...editedProject, description: e.target.value })}
                      className="border px-2 py-1 rounded"
                    />
                  </div>
                ) : (
                  <div onClick={() => navigate(`/projects/${project.slug}`)} className="cursor-pointer">
                    <p className="font-semibold text-lg">{project.name}</p>
                    <p className="text-sm text-gray-500">{project.url}</p>
                    <p className="text-sm text-gray-600 italic">{project.description}</p>
                  </div>
                )}

                <div className="mt-2 flex gap-2">
                  {editingId === project._id ? (
                    <button
                      onClick={() => updateProject(project._id)}
                      className="text-green-600 hover:underline"
                    >
                      Save
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setEditingId(project._id);
                        setEditedProject({
                          name: project.name,
                          url: project.url,
                          description: project.description,
                        });
                      }}
                      className="text-blue-600 hover:underline"
                    >
                      Edit
                    </button>
                  )}
                  <button
                    onClick={() => deleteProject(project._id)}
                    className="text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Add Font to Project:
                  </label>
                  <div className="flex items-center gap-2">
                    <select
                      value={selectedFontIds[project._id] || ''}
                      onChange={(e) =>
                        setSelectedFontIds({ ...selectedFontIds, [project._id]: e.target.value })
                      }
                      className="border px-2 py-1 rounded"
                    >
                      <option value="">-- Select Font --</option>
                      {fonts.map((font) => (
                        <option key={font._id} value={font._id}>
                          {font.fullName || font.name}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => handleFontAssignment(project._id)}
                      className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                    >
                      Add Font
                    </button>
                  </div>

                  {project.fonts && project.fonts.length > 0 && (
                    <ul className="mt-2 space-y-1">
                      {project.fonts.map((font) => (
                        <li key={font._id} className="flex justify-between items-center">
                          <span>{font.fullName || font.name}</span>
                          <button
                            onClick={() => handleFontRemoval(project._id, font._id)}
                            className="text-red-500 text-sm hover:underline"
                          >
                            Remove
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectsPage;
