import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  signOut, 
  updatePassword 
} from 'firebase/auth';
import { 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  deleteDoc, 
  writeBatch 
} from 'firebase/firestore';
import { auth, db } from '../firebase';
import { defaultProjects } from '../data/defaultProjects';

// Deprecated: left for compatibility, pages now query Firestore directly
export function getStoredProjects() {
  return defaultProjects;
}

const CATEGORIES = ['Living Room', 'Bedroom', 'Kitchen', 'Dining Area', 'Puja Unit', 'Others'];

const AdminPage = ({ onNavigate }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
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

  // Sync projects from Firestore
  const fetchProjects = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "projects"));
      if (querySnapshot.empty) {
        // Automatically initialize database with default projects on first load
        await initializeFirestoreProjects();
      } else {
        const projList = querySnapshot.docs.map(doc => doc.data());
        // Sort projects to match the defaultProjects order (if possible) or display newest
        setProjects(projList);
      }
    } catch (e) {
      console.error("Error fetching projects from Firestore:", e);
      setProjects(defaultProjects);
    }
  };

  const initializeFirestoreProjects = async () => {
    try {
      const batch = writeBatch(db);
      defaultProjects.forEach((proj) => {
        const docRef = doc(db, "projects", proj.id);
        batch.set(docRef, proj);
      });
      await batch.commit();
      setProjects(defaultProjects);
      console.log("Firestore initialized with default projects.");
    } catch (e) {
      console.error("Error initializing Firestore database:", e);
    }
  };

  // Monitor Auth State
  useEffect(() => {
    setIsLoading(true);
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setIsAuthenticated(true);
        await fetchProjects();
      } else {
        setIsAuthenticated(false);
        setProjects([]);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Close modals on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setShowPasswordModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handle Login
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');

    try {
      // Map 'admin' username to email for convenience, or accept a standard email format
      const email = username.includes('@') ? username : `${username}@nagadurga-interiors.com`;
      await signInWithEmailAndPassword(auth, email, password);
      setPassword('');
    } catch (err) {
      console.error("Firebase auth login failed:", err);
      setLoginError('Incorrect credentials or login failed. Make sure you added this user in your Auth console.');
    }
  };

  // Handle Logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
      setIsAuthenticated(false);
      setSelectedProject(null);
      setIsEditing(false);
    } catch (e) {
      console.error("Logout failed:", e);
    }
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
  const handleSaveProject = async (e) => {
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

    try {
      const docRef = doc(db, "projects", updatedProject.id);
      await setDoc(docRef, updatedProject);

      let newProjectsList;
      if (selectedProject) {
        // Update local list state
        newProjectsList = projects.map(p => p.id === selectedProject.id ? updatedProject : p);
      } else {
        // Add local list state
        newProjectsList = [updatedProject, ...projects];
      }

      setProjects(newProjectsList);
      setSelectedProject(updatedProject);
      alert("Project saved to database successfully!");
    } catch (err) {
      console.error("Error saving to Firestore:", err);
      alert("Failed to save project to database: " + err.message);
    }
  };

  // Delete Project
  const handleDeleteProject = async (projectId) => {
    if (window.confirm("Are you sure you want to delete this project? This action cannot be undone.")) {
      try {
        const docRef = doc(db, "projects", projectId);
        await deleteDoc(docRef);

        const newProjectsList = projects.filter(p => p.id !== projectId);
        setProjects(newProjectsList);
        setSelectedProject(null);
        setIsEditing(false);
        alert("Project deleted from database successfully!");
      } catch (err) {
        console.error("Error deleting from Firestore:", err);
        alert("Failed to delete project: " + err.message);
      }
    }
  };

  // Reset database to default portfolio projects
  const handleResetToDefaults = async () => {
    if (window.confirm("Are you sure you want to reset the database portfolio? All custom changes will be replaced with defaults.")) {
      try {
        const querySnapshot = await getDocs(collection(db, "projects"));
        const batch = writeBatch(db);
        querySnapshot.docs.forEach((doc) => {
          batch.delete(doc.ref);
        });
        await batch.commit();

        await initializeFirestoreProjects();
        setSelectedProject(null);
        setIsEditing(false);
        alert("Database portfolio reset to defaults successfully!");
      } catch (err) {
        console.error("Error resetting database:", err);
        alert("Failed to reset database portfolio: " + err.message);
      }
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

    try {
      const user = auth.currentUser;
      if (user) {
        await updatePassword(user, newPassword);
        setPasswordSuccess('Password successfully updated!');
        setOldPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
        
        // Clear success message and close modal after delay
        setTimeout(() => {
          setShowPasswordModal(false);
          setPasswordSuccess('');
        }, 1500);
      } else {
        setPasswordError('No authenticated user found');
      }
    } catch (err) {
      console.error("Failed to update password:", err);
      setPasswordError('Failed to update password: ' + err.message + '. (If this fails, try logging out and logging back in to re-authenticate.)');
    }
  };

  if (isLoading) {
    return (
      <div className="container" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="mono" style={{ color: 'var(--accent)' }}>Connecting to Secure Gateway...</div>
      </div>
    );
  }

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
          <div className="mono" style={{ color: 'var(--accent)', marginBottom: '0.5rem', textAlign: 'center' }}>Secure Database Gateway</div>
          <h2 style={{ fontFamily: 'var(--font-display)', textAlign: 'center', marginBottom: '2rem', fontSize: '2rem' }}>Admin Control Panel</h2>
          
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '1.5rem' }}>
              <label className="mono" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.7rem' }}>Username / Email</label>
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
                placeholder="e.g. admin"
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
            Warning: Remote database writes are protected by Firestore security rules. Authentication is required.
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
            Change Password
          </button>
          <button onClick={handleResetToDefaults} className="btn" style={{ padding: '0.75rem 1.5rem', borderColor: 'var(--accent)', color: 'var(--accent)' }}>
            Reset Database
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
                    Update Password
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminPage;
