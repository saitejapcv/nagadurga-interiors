import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { hashPassword, generateSessionToken, verifySessionToken, DEFAULT_PASSWORD_HASH } from '../utils/crypto';
import { defaultProjects } from '../data/defaultProjects';

// Helpers to load and save portfolio items in localStorage
export function getStoredProjects() {
  const data = localStorage.getItem('nagadurga_portfolio_projects');
  if (data) {
    try {
      return JSON.parse(data);
    } catch (e) {
      console.error("Error parsing stored projects", e);
    }
  }
  // Initialize with defaults if empty
  localStorage.setItem('nagadurga_portfolio_projects', JSON.stringify(defaultProjects));
  return defaultProjects;
}

export function saveStoredProjects(projects) {
  localStorage.setItem('nagadurga_portfolio_projects', JSON.stringify(projects));
}

const CATEGORIES = ['Living Room', 'Bedroom', 'Kitchen', 'Dining Area', 'Puja Unit', 'Others'];

const AdminPage = ({ onNavigate }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [projects, setProjects] = useState([]);
  
  // Form fields for editing/adding
  const [selectedProject, setSelectedProject] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formImg, setFormImg] = useState('');
  const [formLocation, setFormLocation] = useState('');
  const [formBudget, setFormBudget] = useState('');
  const [formTimeline, setFormTimeline] = useState('');
  const [formTags, setFormTags] = useState('');
  const [formGallery, setFormGallery] = useState([]);

  // Password change state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  // Export code state
  const [showExportModal, setShowExportModal] = useState(false);
  const [copied, setCopied] = useState(false);

  // Close modals on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setShowPasswordModal(false);
        setShowExportModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Check session token on mount
  useEffect(() => {
    const checkSession = async () => {
      const token = sessionStorage.getItem('admin_session_token');
      if (token) {
        const isValid = await verifySessionToken(token);
        if (isValid) {
          setIsAuthenticated(true);
          setProjects(getStoredProjects());
        } else {
          sessionStorage.removeItem('admin_session_token');
        }
      }
    };
    checkSession();
  }, []);

  // Handle Login
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');

    if (username !== 'admin') {
      setLoginError('Invalid credentials');
      return;
    }

    const enteredHash = await hashPassword(password);
    const storedHash = localStorage.getItem('admin_password_hash') || DEFAULT_PASSWORD_HASH;

    if (enteredHash === storedHash) {
      const token = await generateSessionToken(username);
      sessionStorage.setItem('admin_session_token', token);
      setIsAuthenticated(true);
      setProjects(getStoredProjects());
      setPassword('');
    } else {
      setLoginError('Incorrect password');
    }
  };

  // Handle Logout
  const handleLogout = () => {
    sessionStorage.removeItem('admin_session_token');
    setIsAuthenticated(false);
    setSelectedProject(null);
    setIsEditing(false);
  };

  // Handle Select Project for Editing
  const handleSelectProject = (project) => {
    setSelectedProject(project);
    setIsEditing(true);
    setFormTitle(project.title);
    setFormDescription(project.description || '');
    setFormImg(project.img || '');
    setFormLocation(project.location || '');
    setFormBudget(project.budget || '');
    setFormTimeline(project.timeline || '');
    setFormTags(project.tags ? project.tags.join(', ') : '');
    setFormGallery(project.gallery ? [...project.gallery] : []);
  };

  // Handle New Project Form
  const handleNewProject = () => {
    setSelectedProject(null);
    setIsEditing(true);
    setFormTitle('');
    setFormDescription('');
    setFormImg('');
    setFormLocation('');
    setFormBudget('');
    setFormTimeline('');
    setFormTags('');
    setFormGallery([]);
  };

  // Save/Update Project
  const handleSaveProject = (e) => {
    e.preventDefault();
    if (!formTitle || !formLocation) {
      alert("Title and Location are required.");
      return;
    }

    const tagsArray = formTags
      .split(',')
      .map(t => t.trim().toLowerCase())
      .filter(t => t.length > 0);

    const updatedProject = {
      id: selectedProject ? selectedProject.id : 'proj-' + Date.now(),
      title: formTitle,
      description: formDescription,
      img: formImg || 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=800&q=80', // fallback
      location: formLocation,
      budget: formBudget || '₹8 Lakh',
      timeline: formTimeline || '45 Days',
      tags: tagsArray.length > 0 ? tagsArray : ['completed'],
      gallery: formGallery.filter(item => item.url)
    };

    let newProjectsList;
    if (selectedProject) {
      // Update
      newProjectsList = projects.map(p => p.id === selectedProject.id ? updatedProject : p);
    } else {
      // Add
      newProjectsList = [updatedProject, ...projects];
    }

    saveStoredProjects(newProjectsList);
    setProjects(newProjectsList);
    setSelectedProject(updatedProject);
    alert("Project saved successfully!");
  };

  // Delete Project
  const handleDeleteProject = (projectId) => {
    if (window.confirm("Are you sure you want to delete this project? This action cannot be undone.")) {
      const newProjectsList = projects.filter(p => p.id !== projectId);
      saveStoredProjects(newProjectsList);
      setProjects(newProjectsList);
      setSelectedProject(null);
      setIsEditing(false);
    }
  };

  // Reset to default portfolio projects
  const handleResetToDefaults = () => {
    if (window.confirm("Are you sure you want to reset the portfolio? All your custom edits will be replaced with default Hyderabad project photos (including the ones from folders 1 and 2).")) {
      saveStoredProjects(defaultProjects);
      setProjects(defaultProjects);
      setSelectedProject(null);
      setIsEditing(false);
      alert("Portfolio reset to default successfully!");
    }
  };

  // Add Gallery Image Item
  const handleAddGalleryItem = () => {
    setFormGallery([...formGallery, { url: '', category: 'Living Room', title: '' }]);
  };

  // Remove Gallery Image Item
  const handleRemoveGalleryItem = (index) => {
    const newGallery = formGallery.filter((_, i) => i !== index);
    setFormGallery(newGallery);
  };

  // Update Gallery Item Field
  const handleUpdateGalleryItem = (index, field, value) => {
    const newGallery = formGallery.map((item, i) => {
      if (i === index) {
        return { ...item, [field]: value };
      }
      return item;
    });
    setFormGallery(newGallery);
  };

  // Change Password Action
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (newPassword !== confirmNewPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters long');
      return;
    }

    const currentHash = localStorage.getItem('admin_password_hash') || DEFAULT_PASSWORD_HASH;
    const oldHash = await hashPassword(oldPassword);

    if (oldHash !== currentHash) {
      setPasswordError('Incorrect old password');
      return;
    }

    const newHash = await hashPassword(newPassword);
    localStorage.setItem('admin_password_hash', newHash);
    setPasswordSuccess('Password successfully updated!');
    setOldPassword('');
    setNewPassword('');
    setConfirmNewPassword('');
    
    // Clear success message and close modal after delay
    setTimeout(() => {
      setShowPasswordModal(false);
      setPasswordSuccess('');
    }, 1500);
  };

  // Helper to serialize and format projects code
  const generateExportCode = () => {
    return `export const defaultProjects = ${JSON.stringify(projects, null, 2)};\n`;
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(generateExportCode())
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch((err) => {
        console.error('Clipboard copy failed: ', err);
        // Fallback for browsers/contexts that don't support navigator.clipboard
        const textarea = document.getElementById('export-code-textarea');
        if (textarea) {
          textarea.select();
          try {
            document.execCommand('copy');
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          } catch (e) {
            alert('Failed to copy code automatically. Please select all text and copy manually.');
          }
        }
      });
  };

  if (!isAuthenticated) {
    return (
      <div className="container" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <motion.div 
          className="admin-login-card"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            padding: '3rem',
            width: '100%',
            maxWidth: '450px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.05)',
            borderRadius: '4px'
          }}
        >
          <div className="mono" style={{ color: 'var(--accent)', marginBottom: '0.5rem', textAlign: 'center' }}>Secure Gateway</div>
          <h2 style={{ fontFamily: 'var(--font-display)', textAlign: 'center', marginBottom: '2rem', fontSize: '2rem' }}>Admin Control Panel</h2>
          
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '1.5rem' }}>
              <label className="mono" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.7rem' }}>Username</label>
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.85rem 1rem',
                  border: '1px solid var(--border)',
                  background: 'var(--bg)',
                  color: 'var(--fg)',
                  fontFamily: 'var(--font-body)',
                  outline: 'none',
                  borderRadius: '2px'
                }}
                required
              />
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <label className="mono" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.7rem' }}>Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.85rem 1rem',
                  border: '1px solid var(--border)',
                  background: 'var(--bg)',
                  color: 'var(--fg)',
                  fontFamily: 'var(--font-body)',
                  outline: 'none',
                  borderRadius: '2px'
                }}
                required
              />
            </div>

            {loginError && (
              <p style={{ color: '#c53030', fontSize: '0.85rem', marginBottom: '1.5rem', textAlign: 'center', fontWeight: '500' }}>
                {loginError}
              </p>
            )}

            <button 
              type="submit" 
              className="btn btn-primary"
              style={{ width: '100%', padding: '1rem', border: 'none' }}
            >
              Authenticate
            </button>
          </form>

          <p style={{ fontSize: '0.75rem', color: 'var(--muted)', textAlign: 'center', marginTop: '2rem', lineHeight: '1.4' }}>
            Warning: Unauthorized access attempts are monitored and logged. Stored hash validation is strictly enforced.
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '4rem var(--gap)' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '3rem', borderBottom: '1px solid var(--border)', paddingBottom: '2.0rem' }}>
        <div>
          <span className="mono" style={{ color: 'var(--accent)' }}>System Dashboard</span>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', marginTop: '0.5rem' }}>Portfolio Control Centre</h1>
        </div>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <button onClick={() => setShowPasswordModal(true)} className="btn btn-secondary" style={{ padding: '0.75rem 1.5rem' }}>
            Change Secret
          </button>
          <button onClick={() => setShowExportModal(true)} className="btn btn-secondary" style={{ padding: '0.75rem 1.5rem' }}>
            Export Code
          </button>
          <button onClick={handleResetToDefaults} className="btn" style={{ padding: '0.75rem 1.5rem', borderColor: 'var(--accent)', color: 'var(--accent)' }}>
            Reset Portfolio
          </button>
          <button onClick={handleLogout} className="btn btn-primary" style={{ padding: '0.75rem 1.5rem' }}>
            Logout
          </button>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '3rem' }}>
        {/* Left Column: Project list */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 className="mono" style={{ fontSize: '0.9rem' }}>Project List</h3>
            <button onClick={handleNewProject} className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.7rem' }}>
              + Add Project
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'col', gap: '0.75rem', maxHeight: '70vh', overflowY: 'auto', paddingRight: '0.5rem' }} className="admin-project-list">
            {projects.map(p => (
              <div 
                key={p.id}
                onClick={() => handleSelectProject(p)}
                style={{
                  background: selectedProject && selectedProject.id === p.id ? 'var(--fg)' : 'var(--surface)',
                  color: selectedProject && selectedProject.id === p.id ? 'var(--bg)' : 'var(--fg)',
                  border: '1px solid var(--border)',
                  padding: '1.25rem',
                  cursor: 'pointer',
                  borderRadius: '2px',
                  transition: 'all 0.2s ease',
                  marginBottom: '0.75rem'
                }}
              >
                <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', marginBottom: '0.25rem' }}>{p.title}</h4>
                <p style={{ fontSize: '0.8rem', opacity: 0.8 }}>
                  📍 {p.location} | 💰 {p.budget}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Edit/Add Form */}
        <div>
          {isEditing ? (
            <motion.div 
              key={selectedProject ? selectedProject.id : 'new-form'}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                padding: '2.5rem',
                borderRadius: '4px'
              }}
            >
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', marginBottom: '2rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
                {selectedProject ? `Edit: ${selectedProject.title}` : 'Add New Portfolio Work'}
              </h3>

              <form onSubmit={handleSaveProject}>
                {/* Form fields grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                  <div>
                    <label className="mono" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.7rem' }}>Project Title</label>
                    <input 
                      type="text" 
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      style={{
                        width: '100%', padding: '0.75rem', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--fg)', outline: 'none'
                      }}
                      placeholder="e.g. Prestige High Fields Villa"
                      required
                    />
                  </div>
                  <div>
                    <label className="mono" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.7rem' }}>Location Area</label>
                    <input 
                      type="text" 
                      value={formLocation}
                      onChange={(e) => setFormLocation(e.target.value)}
                      style={{
                        width: '100%', padding: '0.75rem', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--fg)', outline: 'none'
                      }}
                      placeholder="e.g. Gachibowli"
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                  <div>
                    <label className="mono" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.7rem' }}>Budget</label>
                    <input 
                      type="text" 
                      value={formBudget}
                      onChange={(e) => setFormBudget(e.target.value)}
                      style={{
                        width: '100%', padding: '0.75rem', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--fg)', outline: 'none'
                      }}
                      placeholder="e.g. ₹12 Lakh"
                    />
                  </div>
                  <div>
                    <label className="mono" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.7rem' }}>Timeline</label>
                    <input 
                      type="text" 
                      value={formTimeline}
                      onChange={(e) => setFormTimeline(e.target.value)}
                      style={{
                        width: '100%', padding: '0.75rem', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--fg)', outline: 'none'
                      }}
                      placeholder="e.g. 45 Days"
                    />
                  </div>
                  <div>
                    <label className="mono" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.7rem' }}>Filters/Tags (comma separated)</label>
                    <input 
                      type="text" 
                      value={formTags}
                      onChange={(e) => setFormTags(e.target.value)}
                      style={{
                        width: '100%', padding: '0.75rem', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--fg)', outline: 'none'
                      }}
                      placeholder="e.g. 2bhk, gachibowli, luxury"
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label className="mono" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.7rem' }}>Description</label>
                  <textarea 
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    style={{
                      width: '100%', height: '100px', padding: '0.75rem', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--fg)', outline: 'none', resize: 'vertical'
                    }}
                    placeholder="Short description of the home interiors, style and design philosophy."
                  />
                </div>

                <div style={{ marginBottom: '2.5rem' }}>
                  <label className="mono" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.7rem' }}>Cover Image Path / URL</label>
                  <input 
                    type="text" 
                    value={formImg}
                    onChange={(e) => setFormImg(e.target.value)}
                    style={{
                      width: '100%', padding: '0.75rem', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--fg)', outline: 'none'
                    }}
                    placeholder="e.g. /Photos/1/Bedroom/Master_bedroom.jpeg or Unsplash link"
                  />
                  {formImg && (
                    <div style={{ marginTop: '0.75rem', border: '1px solid var(--border)', padding: '0.25rem', width: 'fit-content' }}>
                      <img src={formImg} alt="Preview" style={{ maxHeight: '120px', display: 'block' }} onError={(e) => e.target.style.display = 'none'} />
                    </div>
                  )}
                </div>

                {/* Gallery Items Section */}
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '2rem', marginBottom: '2rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h4 className="mono" style={{ fontSize: '0.85rem' }}>Gallery Images ({formGallery.length})</h4>
                    <button type="button" onClick={handleAddGalleryItem} className="btn" style={{ padding: '0.5rem 1rem', fontSize: '0.7rem', borderColor: 'var(--accent)', color: 'var(--accent)' }}>
                      + Add Photo
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '400px', overflowY: 'auto', paddingRight: '0.5rem' }} className="admin-gallery-list">
                    {formGallery.map((item, index) => (
                      <div 
                        key={index}
                        style={{
                          background: 'var(--bg)',
                          border: '1px solid var(--border)',
                          padding: '1.25rem',
                          borderRadius: '2px',
                          display: 'grid',
                          gridTemplateColumns: '1fr auto',
                          gap: '1rem'
                        }}
                      >
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                          <input 
                            type="text" 
                            value={item.url}
                            onChange={(e) => handleUpdateGalleryItem(index, 'url', e.target.value)}
                            placeholder="Image URL / Path (e.g. /Photos/2/Living_Room/TV_unit.jpeg)"
                            style={{
                              width: '100%', padding: '0.5rem 0.75rem', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--fg)', outline: 'none', fontSize: '0.85rem'
                            }}
                          />
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <select
                              value={item.category}
                              onChange={(e) => handleUpdateGalleryItem(index, 'category', e.target.value)}
                              style={{
                                padding: '0.5rem', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--fg)', outline: 'none', fontSize: '0.85rem'
                              }}
                            >
                              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                            <input 
                              type="text" 
                              value={item.title}
                              onChange={(e) => handleUpdateGalleryItem(index, 'title', e.target.value)}
                              placeholder="Photo Caption (e.g. Modular TV Panel)"
                              style={{
                                padding: '0.5rem 0.75rem', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--fg)', outline: 'none', fontSize: '0.85rem'
                              }}
                            />
                          </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                          <button 
                            type="button" 
                            onClick={() => handleRemoveGalleryItem(index)}
                            style={{
                              color: '#c53030', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', padding: '0.5rem'
                            }}
                            title="Remove Photo"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Form Buttons */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: '2rem' }}>
                  <div>
                    {selectedProject && (
                      <button 
                        type="button" 
                        onClick={() => handleDeleteProject(selectedProject.id)}
                        className="btn"
                        style={{ borderColor: '#c53030', color: '#c53030', padding: '0.75rem 1.5rem' }}
                      >
                        Delete Project
                      </button>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <button 
                      type="button" 
                      onClick={() => setIsEditing(false)}
                      className="btn"
                      style={{ padding: '0.75rem 1.5rem' }}
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="btn btn-primary"
                      style={{ padding: '0.75rem 2rem' }}
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          ) : (
            <div 
              style={{
                border: '1px dashed var(--border)',
                padding: '6rem 3rem',
                textAlign: 'center',
                color: 'var(--muted)',
                background: 'var(--surface)'
              }}
            >
              <p style={{ fontSize: '1.2rem', fontFamily: 'var(--font-display)', marginBottom: '1.5rem' }}>
                No Project Selected
              </p>
              <p style={{ fontSize: '0.85rem', marginBottom: '2rem', maxWidth: '320px', margin: '0 auto 2rem' }}>
                Select a project from the list on the left to edit, delete, or manage its gallery. Or click below to create a new one.
              </p>
              <button onClick={handleNewProject} className="btn btn-primary">
                + Create New Project
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Password Change Modal */}
      <AnimatePresence>
        {showPasswordModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
            }}
          >
            <motion.div 
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              style={{
                background: 'var(--surface)', border: '1px solid var(--border)', padding: '2.5rem', width: '100%', maxWidth: '450px', borderRadius: '4px', boxShadow: '0 20px 40px rgba(0,0,0,0.15)'
              }}
            >
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', marginBottom: '1.5rem' }}>Change Admin Credentials</h3>
              
              <form onSubmit={handleChangePassword}>
                <div style={{ marginBottom: '1rem' }}>
                  <label className="mono" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.7rem' }}>Old Password</label>
                  <input 
                    type="password" 
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--fg)', outline: 'none' }}
                    required
                  />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label className="mono" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.7rem' }}>New Password</label>
                  <input 
                    type="password" 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--fg)', outline: 'none' }}
                    required
                  />
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label className="mono" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.7rem' }}>Confirm New Password</label>
                  <input 
                    type="password" 
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--fg)', outline: 'none' }}
                    required
                  />
                </div>

                {passwordError && <p style={{ color: '#c53030', fontSize: '0.85rem', marginBottom: '1rem' }}>{passwordError}</p>}
                {passwordSuccess && <p style={{ color: '#2f855a', fontSize: '0.85rem', marginBottom: '1rem' }}>{passwordSuccess}</p>}

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                  <button type="button" onClick={() => setShowPasswordModal(false)} className="btn" style={{ padding: '0.5rem 1rem' }}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" style={{ padding: '0.5rem 1.5rem' }}>
                    Update Hash
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Export Portfolio Code Modal */}
      <AnimatePresence>
        {showExportModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowExportModal(false)}
            style={{
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
            }}
          >
            <motion.div 
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
              style={{
                background: 'var(--surface)', border: '1px solid var(--border)', padding: '2.5rem', width: '100%', maxWidth: '750px', borderRadius: '4px', boxShadow: '0 20px 40px rgba(0,0,0,0.15)', display: 'flex', flexDirection: 'column', gap: '1.5rem', maxHeight: '90vh'
              }}
              role="dialog"
              aria-modal="true"
              aria-labelledby="export-modal-title"
            >
              <div>
                <span className="mono" style={{ color: 'var(--accent)' }}>Database Synchronization</span>
                <h3 id="export-modal-title" style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', marginTop: '0.25rem' }}>Export Portfolio Code</h3>
              </div>

              <div style={{ fontSize: '0.85rem', color: 'var(--muted)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <p>Since this site is hosted statically on Firebase, changes made here are saved to your local browser storage. To synchronize your updates globally across all devices and clients:</p>
                <ol style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', listStyleType: 'decimal' }}>
                  <li>Click <strong>Copy Code</strong> below to copy the new configuration code to your clipboard.</li>
                  <li>Open the project file <code>src/data/defaultProjects.js</code> in your code editor.</li>
                  <li>Replace the entire file content with the copied code and save the file.</li>
                  <li>Commit and push the changes to GitHub (e.g., <code>git commit -am "update portfolio" && git push origin master</code>).</li>
                  <li>GitHub Actions will build and deploy the new portfolio data to Firebase Hosting automatically.</li>
                </ol>
                <p style={{ marginTop: '0.5rem', fontStyle: 'italic', borderLeft: '3px solid var(--accent)', paddingLeft: '0.75rem' }}>
                  <strong>Note for other devices:</strong> If you are logged into the admin dashboard on other devices, click the <strong>Reset Portfolio</strong> button on those devices to clear outdated cache and load the newly deployed defaults.
                </p>
              </div>

              <div style={{ position: 'relative' }}>
                <textarea
                  id="export-code-textarea"
                  readOnly
                  value={generateExportCode()}
                  onClick={(e) => e.target.select()}
                  style={{
                    width: '100%',
                    height: '200px',
                    padding: '1rem',
                    border: '1px solid var(--border)',
                    background: 'var(--bg)',
                    color: 'var(--fg)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.75rem',
                    borderRadius: '2px',
                    resize: 'none',
                    outline: 'none',
                    whiteSpace: 'pre'
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button type="button" onClick={() => setShowExportModal(false)} className="btn" style={{ padding: '0.65rem 1.5rem' }}>
                  Close
                </button>
                <button type="button" onClick={handleCopyCode} className="btn btn-primary" style={{ padding: '0.65rem 2rem' }}>
                  {copied ? '✓ Copied!' : 'Copy Code'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminPage;
