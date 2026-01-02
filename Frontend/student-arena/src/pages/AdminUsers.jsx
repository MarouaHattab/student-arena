import { useState, useEffect } from "react";
import api from "../api/axiosConfig";
import Navbar from "../components/Navbar";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPointsModal, setShowPointsModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    userName: "",
    password: "",
    role: "user"
  });

  const [pointData, setPointData] = useState({
    points: 0,
    reason: "",
    type: "add" // "add" or "reduce"
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/users');
      setUsers(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors du chargement des utilisateurs");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/users', formData);
      alert("Utilisateur créé avec succès !");
      setShowCreateModal(false);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || "Erreur lors de la création");
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await api.patch(`/users/${selectedUser._id}`, formData);
      alert("Utilisateur mis à jour !");
      setShowEditModal(false);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || "Erreur lors de la mise à jour");
    }
  };

  const handleDelete = async (userId) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ?")) {
      try {
        await api.delete(`/users/${userId}`);
        fetchUsers();
      } catch (err) {
        alert("Erreur lors de la suppression");
      }
    }
  };

  const handleAddPoints = async (e) => {
    e.preventDefault();
    try {
      const adjustedPoints = pointData.type === 'reduce' ? -Math.abs(pointData.points) : Math.abs(pointData.points);
      
      await api.post('/submissions/add-points', {
        userId: selectedUser._id,
        points: adjustedPoints,
        reason: pointData.reason
      });
      alert(pointData.type === 'add' ? "Points ajoutés !" : "Points retirés !");
      setShowPointsModal(false);
      fetchUsers();
    } catch (err) {
      alert("Erreur lors de la modification des points");
    }
  };

  const openEditModal = (user) => {
    setSelectedUser(user);
    setFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      userName: user.userName,
      role: user.role
    });
    setShowEditModal(true);
  };

  const openPointsModal = (user) => {
    setSelectedUser(user);
    setPointData({ points: 0, reason: "", type: "add" });
    setShowPointsModal(true);
  };

  if (loading) return <div className="loading-container">Chargement...</div>;

  return (
    <div className="admin-container">
      <Navbar />
      <main className="page-container">
        <header className="section-header">
          <div>
            <h1 className="section-title">Utilisateurs</h1>
            <p className="section-subtitle">Gérez les membres de la plateforme et leurs scores.</p>
          </div>
          <button 
            onClick={() => {
              setFormData({ firstName: "", lastName: "", email: "", userName: "", password: "", role: "user" });
              setShowCreateModal(true);
            }} 
            className="btn-primary"
          >
            + Nouvel Utilisateur
          </button>
        </header>

        <div className="table-wrapper premium-shadow">
          <table>
            <thead>
              <tr>
                <th>Utilisateur</th>
                <th>Rôle</th>
                <th>Points</th>
                <th>Équipe</th>
                <th>Projets</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user._id}>
                  <td>
                    <div className="user-info-cell">
                      <div className="user-avatar-small">
                        {user.userName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="user-name-bold">{user.firstName} {user.lastName}</div>
                        <div className="user-email-sub">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${user.role === 'admin' ? 'badge-admin' : 'badge-user'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td>
                    <div className="points-display">
                      <span className="points-value">{user.points || 0}</span>
                      <button onClick={() => openPointsModal(user)} className="points-add-btn" title="Gérer les points">+</button>
                    </div>
                  </td>
                  <td>
                    {user.team ? (
                      <span className="team-tag">{user.team.name}</span>
                    ) : (
                      <span className="no-data">-</span>
                    )}
                  </td>
                  <td>
                    {user.registeredProjects?.length > 0 ? (
                      <div className="project-stack">
                        <strong>{user.registeredProjects.length}</strong>
                        <div className="project-previews">
                          {user.registeredProjects.slice(0, 2).map(p => p.title).join(", ")}
                          {user.registeredProjects.length > 2 && "..."}
                        </div>
                      </div>
                    ) : (
                      <span className="no-data">-</span>
                    )}
                  </td>
                  <td>
                    <div className="action-btns">
                      <button onClick={() => openEditModal(user)} className="btn-icon-edit" title="Modifier">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                      </button>
                      <button onClick={() => handleDelete(user._id)} className="btn-icon-delete" title="Supprimer">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {/* Modals are updated with classNames for premium feel */}
      {(showCreateModal || showEditModal) && (
        <div className="modal-overlay fade-in" onClick={() => { setShowCreateModal(false); setShowEditModal(false); }}>
          <div className="modal-content glass-card" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{showCreateModal ? "Nouvel Utilisateur" : "Modifier Profil"}</h2>
              <button onClick={() => { setShowCreateModal(false); setShowEditModal(false); }} className="close-btn">×</button>
            </div>
            <form onSubmit={showCreateModal ? handleCreate : handleUpdate} className="modal-form">
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label>Prénom</label>
                    <input type="text" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} required placeholder="Ex: Jean" />
                  </div>
                  <div className="form-group">
                    <label>Nom</label>
                    <input type="text" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} required placeholder="Ex: Dupont" />
                  </div>
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required placeholder="jean@example.com" />
                </div>
                <div className="form-group">
                    <label>Nom d'utilisateur</label>
                    <input type="text" value={formData.userName} onChange={e => setFormData({...formData, userName: e.target.value})} required placeholder="jean_d" />
                </div>
                {showCreateModal && (
                  <div className="form-group">
                    <label>Mot de passe</label>
                    <input type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required />
                  </div>
                )}
                <div className="form-group">
                  <label>Rôle</label>
                  <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                    <option value="user">Utilisateur Standard</option>
                    <option value="admin">Administrateur</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="submit" className="btn-primary full-width">
                  {showCreateModal ? "Créer l'utilisateur" : "Enregistrer les modifications"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Points Modal */}
      {showPointsModal && (
        <div className="modal-overlay fade-in" onClick={() => setShowPointsModal(false)}>
          <div className="modal-content glass-card small" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Gérer les Points</h2>
              <button onClick={() => setShowPointsModal(false)} className="close-btn">×</button>
            </div>
            <form onSubmit={handleAddPoints} className="modal-form">
              <div className="modal-body">
                <div className="selected-user-brief">
                    <strong>{selectedUser?.firstName} {selectedUser?.lastName}</strong>
                    <span>@{selectedUser?.userName}</span>
                </div>
                <div className="form-group">
                  <label>Type d'opération</label>
                  <div className="type-toggle">
                      <button type="button" onClick={() => setPointData({...pointData, type: 'add'})} className={pointData.type === 'add' ? 'active add' : ''}>Bonus (+)</button>
                      <button type="button" onClick={() => setPointData({...pointData, type: 'reduce'})} className={pointData.type === 'reduce' ? 'active reduce' : ''}>Malus (-)</button>
                  </div>
                </div>
                <div className="form-group">
                  <label>Score</label>
                  <input type="number" value={pointData.points} onChange={e => setPointData({...pointData, points: parseInt(e.target.value)})} required min="1" />
                </div>
                <div className="form-group">
                  <label>Motif</label>
                  <textarea value={pointData.reason} onChange={e => setPointData({...pointData, reason: e.target.value})} placeholder="Ex: Participation exceptionnelle au hackathon..." required />
                </div>
              </div>
              <div className="modal-footer">
                <button type="submit" className={`btn-primary full-width ${pointData.type === 'reduce' ? 'btn-danger' : ''}`}>
                  {pointData.type === 'add' ? "Attribuer le Bonus" : "Appliquer la Pénalité"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .admin-container { min-height: 100vh; background: #f8fafc; }
        .section-subtitle { color: #64748b; margin-top: 4px; font-size: 15px; }
        
        /* Table enhancements */
        .user-info-cell { display: flex; align-items: center; gap: 12px; }
        .user-avatar-small { width: 36px; height: 36px; background: #eef2ff; color: #6366f1; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 14px; }
        .user-name-bold { font-weight: 600; color: #1e293b; }
        .user-email-sub { font-size: 12px; color: #94a3b8; }
        
        .badge-admin { background: #fef2f2; color: #dc2626; border: 1px solid #fee2e2; }
        .badge-user { background: #f0fdf4; color: #16a34a; border: 1px solid #dcfce7; }
        
        .points-display { display: flex; align-items: center; gap: 8px; }
        .points-value { font-weight: 700; color: #1e293b; font-size: 16px; font-variant-numeric: tabular-nums; }
        .points-add-btn { width: 24px; height: 24px; border-radius: 6px; border: none; background: #f1f5f9; color: #475569; cursor: pointer; transition: all 0.2s; font-weight: bold; }
        .points-add-btn:hover { background: #6366f1; color: #fff; }
        
        .team-tag { padding: 4px 10px; background: #f5f3ff; color: #7c3aed; border-radius: 8px; font-size: 13px; font-weight: 600; }
        .no-data { color: #cbd5e1; font-weight: 500; }
        
        .project-stack { display: flex; flex-direction: column; gap: 2px; }
        .project-previews { font-size: 11px; color: #94a3b8; max-width: 200px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        
        .action-btns { display: flex; gap: 8px; }
        .btn-icon-edit, .btn-icon-delete { padding: 8px; border: none; background: transparent; cursor: pointer; border-radius: 8px; transition: all 0.2s; }
        .btn-icon-edit { color: #6366f1; }
        .btn-icon-edit:hover { background: #f5f3ff; }
        .btn-icon-delete { color: #ef4444; }
        .btn-icon-delete:hover { background: #fef2f2; }
 
        /* Modals */
        .modal-overlay { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.4); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 2000; padding: 20px; }
        .modal-content { background: #fff; border-radius: 24px; width: 100%; max-width: 540px; }
        .modal-content.small { max-width: 400px; }
        .modal-header { padding: 24px; border-bottom: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center; }
        .modal-header h2 { font-size: 20px; font-weight: 800; color: #1e293b; margin: 0; }
        .close-btn { background: #f1f5f9; border: none; width: 32px; height: 32px; border-radius: 50%; cursor: pointer; color: #64748b; font-size: 20px; }
        
        .modal-body { padding: 24px; }
        .form-row { display: flex; gap: 16px; margin-bottom: 16px; }
        .form-group { margin-bottom: 20px; display: flex; flex-direction: column; gap: 8px; }
        .form-group label { font-size: 13px; font-weight: 700; color: #475569; }
        .form-group input, .form-group select, .form-group textarea { padding: 12px; border-radius: 12px; border: 1px solid #e2e8f0; background: #f8fafc; font-size: 14px; outline: none; transition: all 0.2s; }
        .form-group input:focus { border-color: #6366f1; box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1); }
        .form-group textarea { min-height: 80px; resize: vertical; }
        
        .modal-footer { padding: 0 24px 24px; }
        .full-width { width: 100%; justify-content: center; height: 48px; }
        .btn-danger { background: #ef4444 !important; }
        
        .selected-user-brief { background: #f1f5f9; padding: 12px; border-radius: 12px; margin-bottom: 24px; display: flex; flex-direction: column; align-items: center; }
        .selected-user-brief strong { color: #1e293b; }
        .selected-user-brief span { color: #64748b; font-size: 13px; }
        
        .type-toggle { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; background: #f1f5f9; padding: 4px; border-radius: 12px; }
        .type-toggle button { padding: 8px; border: none; border-radius: 8px; cursor: pointer; font-weight: 700; font-size: 13px; background: transparent; color: #64748b; }
        .type-toggle button.active.add { background: #10b981; color: #fff; }
        .type-toggle button.active.reduce { background: #ef4444; color: #fff; }
 
        .loading-container { height: 100vh; display: flex; align-items: center; justify-content: center; font-weight: 600; color: #6366f1; }
      `}</style>
    </div>
  );
};

export default AdminUsers;
