import { useState, useEffect } from "react";
import api from "../api/axiosConfig";
import Navbar from "../components/Navbar";

const AdminTeams = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPointsModal, setShowPointsModal] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    slogan: ""
  });

  const [pointData, setPointData] = useState({
    points: 0,
    reason: "",
    type: "add"
  });

  const [newMemberEmail, setNewMemberEmail] = useState("");

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      setLoading(true);
      const res = await api.get('/teams');
      const data = res.data;
      setTeams(data);
      if (selectedTeam) {
        const updated = data.find(t => t._id === selectedTeam._id);
        if (updated) setSelectedTeam(updated);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors du chargement des équipes");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/teams/${selectedTeam._id}`, formData);
      alert("Équipe mise à jour !");
      setShowEditModal(false);
      fetchTeams();
    } catch (err) {
      alert(err.response?.data?.message || "Erreur lors de la mise à jour");
    }
  };

  const handleDelete = async (teamId) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette équipe ?")) {
      try {
        await api.delete(`/teams/${teamId}`);
        fetchTeams();
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
        teamId: selectedTeam._id,
        points: adjustedPoints,
        reason: pointData.reason
      });
      alert(pointData.type === 'add' ? "Points ajoutés !" : "Points retirés !");
      setShowPointsModal(false);
      fetchTeams();
    } catch (err) {
      alert("Erreur lors de la modification des points");
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (window.confirm("Retirer ce membre de l'équipe ?")) {
      try {
        await api.delete(`/teams/${selectedTeam._id}/members/${memberId}`);
        fetchTeams();
      } catch (err) {
        alert(err.response?.data?.message || "Erreur lors du retrait");
      }
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/teams/${selectedTeam._id}/add-member`, { emailOrUsername: newMemberEmail });
      setNewMemberEmail("");
      fetchTeams();
      alert("Membre ajouté !");
    } catch (err) {
      alert(err.response?.data?.message || "Erreur lors de l'ajout");
    }
  };

  if (loading && teams.length === 0) return <div className="loading-container">Chargement...</div>;

  return (
    <div className="admin-container">
      <Navbar />
      <main className="page-container">
        <header className="section-header">
          <div>
            <h1 className="section-title">Équipes</h1>
            <p className="section-subtitle">Supervisez les collectifs et leurs accomplissements.</p>
          </div>
        </header>

        {error && <div className="error-alert">{error}</div>}

        <div className="table-wrapper premium-shadow">
          <table>
            <thead>
              <tr>
                <th>Équipe / Slogan</th>
                <th>Membres</th>
                <th>Points</th>
                <th>Code d'accès</th>
                <th>Projets Inscrits</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {teams.map(team => (
                <tr key={team._id}>
                  <td>
                    <div className="team-info-cell">

                      <div>
                        <div className="team-name-bold">{team.name}</div>
                        <div className="team-slogan-sub">{team.slogan || "Aucun slogan"}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="members-stack">
                      <div className="members-count-badge">
                        <span>{team.members?.length}</span> membres
                      </div>
                      <button onClick={() => { setSelectedTeam(team); setShowMembersModal(true); }} className="btn-manage-small">
                        Gérer l'équipe
                      </button>
                    </div>
                  </td>
                  <td>
                    <div className="points-display">
                      <span className="points-value">{team.points || 0}</span>
                      <button onClick={() => { setSelectedTeam(team); setShowPointsModal(true); }} className="points-add-btn">+</button>
                    </div>
                  </td>
                  <td>
                    <code className="invite-code">{team.invitationCode}</code>
                  </td>
                  <td>
                    {team.registeredProjects?.length > 0 ? (
                      <div className="status-cell">
                        <div className="status-num">{team.registeredProjects.length}</div>
                        <div className="status-list">
                          {team.registeredProjects.map(p => p.title).join(", ")}
                        </div>
                      </div>
                    ) : (
                      <span className="no-data">- Aucun -</span>
                    )}
                  </td>
                  <td>
                    <div className="action-btns">
                      <button onClick={() => { setSelectedTeam(team); setFormData({ name: team.name, description: team.description || "", slogan: team.slogan || "" }); setShowEditModal(true); }} className="btn-icon-edit">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                      </button>
                      <button onClick={() => handleDelete(team._id)} className="btn-icon-delete">
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

      {/* Edit Modal */}
      {showEditModal && (
        <div className="modal-overlay fade-in" onClick={() => setShowEditModal(false)}>
          <div className="modal-content glass-card" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Options de l'équipe</h2>
              <button onClick={() => setShowEditModal(false)} className="close-btn">×</button>
            </div>
            <form onSubmit={handleUpdate} className="modal-form">
              <div className="modal-body">
                <div className="form-group">
                  <label>Nom de l'équipe</label>
                  <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required placeholder="Ex: Warriors IA" />
                </div>
                <div className="form-group">
                  <label>Slogan accrocheur</label>
                  <input type="text" value={formData.slogan} onChange={e => setFormData({...formData, slogan: e.target.value})} placeholder="Ex: On code plus vite que notre ombre" />
                </div>
                <div className="form-group">
                  <label>Description (Objectifs de l'équipe)</label>
                  <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Décrivez l'équipe..." />
                </div>
              </div>
              <div className="modal-footer">
                <button type="submit" className="btn-primary full-width">Appliquer les changements</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Members Modal */}
      {showMembersModal && (
        <div className="modal-overlay fade-in" onClick={() => setShowMembersModal(false)}>
          <div className="modal-content glass-card" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Membres : {selectedTeam?.name}</h2>
              <button onClick={() => setShowMembersModal(false)} className="close-btn">×</button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleAddMember} className="add-member-form">
                <input type="text" placeholder="Email ou username" value={newMemberEmail} onChange={e => setNewMemberEmail(e.target.value)} required />
                <button type="submit" className="btn-inline-add">Recruter</button>
              </form>

              <div className="member-list-grid">
                {selectedTeam?.members?.map(member => (
                  <div key={member._id} className="member-card-small">

                    <div className="member-meta">
                      <strong>{member.firstName} {member.lastName}</strong>
                      <span>@{member.userName}</span>
                    </div>
                    <button onClick={() => handleRemoveMember(member._id)} className="btn-remove-member">Retirer</button>
                  </div>
                ))}
                {selectedTeam?.members?.length === 0 && <p className="empty-text">Aucun membre dans cette équipe.</p>}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Points Modal */}
      {showPointsModal && (
        <div className="modal-overlay fade-in" onClick={() => setShowPointsModal(false)}>
          <div className="modal-content glass-card small" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Récompenser l'Équipe</h2>
              <button onClick={() => setShowPointsModal(false)} className="close-btn">×</button>
            </div>
            <form onSubmit={handleAddPoints} className="modal-form">
              <div className="modal-body">
                <div className="type-toggle">
                  <button type="button" onClick={() => setPointData({...pointData, type: 'add'})} className={pointData.type === 'add' ? 'active add' : ''}>Bonus</button>
                  <button type="button" onClick={() => setPointData({...pointData, type: 'reduce'})} className={pointData.type === 'reduce' ? 'active reduce' : ''}>Malus</button>
                </div>
                <div className="form-group" style={{marginTop: '20px'}}>
                  <label>Montant des points</label>
                  <input type="number" value={pointData.points} onChange={e => setPointData({...pointData, points: parseInt(e.target.value)})} required min="1" />
                </div>
                <div className="form-group">
                  <label>Motif de la transaction</label>
                  <textarea value={pointData.reason} onChange={e => setPointData({...pointData, reason: e.target.value})} required placeholder="Raison de l'ajout/retrait de points..." />
                </div>
              </div>
              <div className="modal-footer">
                <button type="submit" className={`btn-primary full-width ${pointData.type === 'reduce' ? 'btn-danger' : ''}`}>
                  Confirmer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .admin-container { min-height: 100vh; background: #f8fafc; }
        .error-alert { background: #fee2e2; color: #dc2626; padding: 12px 20px; border-radius: 12px; margin-bottom: 24px; font-weight: 600; }
        
        .team-info-cell { display: flex; align-items: center; gap: 12px; }
        .team-icon-box { width: 42px; height: 42px; background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%); color: #fff; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 18px; box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2); }
        .team-name-bold { font-weight: 700; color: #1e293b; font-size: 15px; }
        .team-slogan-sub { font-size: 12px; color: #94a3b8; font-style: italic; }
        
        .members-stack { display: flex; flex-direction: column; gap: 6px; }
        .members-count-badge { font-size: 13px; color: #475569; font-weight: 500; }
        .members-count-badge span { color: #6366f1; font-weight: 800; }
        .btn-manage-small { font-size: 11px; padding: 4px 10px; border-radius: 8px; border: 1px solid #e2e8f0; background: #fff; color: #64748b; cursor: pointer; transition: all 0.2s; font-weight: 700; }
        .btn-manage-small:hover { background: #f8fafc; color: #1e293b; border-color: #cbd5e1; }
        
        .points-display { display: flex; align-items: center; gap: 10px; }
        .points-value { font-weight: 800; color: #1e293b; font-size: 16px; }
        .points-add-btn { width: 26px; height: 26px; border-radius: 8px; border: none; background: rgba(16, 185, 129, 0.12); color: #10b981; cursor: pointer; display: flex; align-items: center; justify-content: center; font-weight: 900; transition: all 0.2s; }
        .points-add-btn:hover { background: #10b981; color: #fff; }
        
        .invite-code { background: #f1f5f9; padding: 4px 10px; border-radius: 8px; font-family: 'JetBrains Mono', monospace; font-size: 12px; color: #475569; font-weight: 600; }
        
        .status-cell { max-width: 250px; }
        .status-num { font-weight: 800; color: #6366f1; font-size: 13px; }
        .status-list { font-size: 11px; color: #94a3b8; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .no-data { font-size: 12px; color: #cbd5e1; }
        
        .action-btns { display: flex; gap: 8px; }
        .btn-icon-edit, .btn-icon-delete { padding: 8px; border: none; background: transparent; cursor: pointer; border-radius: 10px; transition: all 0.2s; }
        .btn-icon-edit { color: #6366f1; }
        .btn-icon-edit:hover { background: #f5f3ff; }
        .btn-icon-delete { color: #ef4444; }
        .btn-icon-delete:hover { background: #fef2f2; }

        /* Modal Styles */
        .modal-overlay { position: fixed; inset: 0; background: rgba(15, 17, 26, 0.4); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; z-index: 2000; padding: 20px; }
        .modal-content { background: #fff; border-radius: 28px; width: 100%; max-width: 500px; max-height: 90vh; overflow-y: auto; }
        .modal-content.small { max-width: 380px; }
        .modal-header { padding: 28px 28px 20px; border-bottom: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center; }
        .modal-header h2 { font-size: 1.25rem; font-weight: 800; color: #1e293b; margin: 0; }
        .close-btn { background: #f1f5f9; border: none; width: 34px; height: 34px; border-radius: 50%; cursor: pointer; color: #64748b; font-size: 20px; display: flex; align-items: center; justify-content: center; }
        
        .modal-body { padding: 28px; }
        .form-group { margin-bottom: 24px; display: flex; flex-direction: column; gap: 8px; }
        .form-group label { font-size: 13px; font-weight: 700; color: #475569; letter-spacing: 0.2px; }
        .form-group input, .form-group textarea, .form-group select { padding: 14px; border-radius: 14px; border: 1px solid #e2e8f0; background: #f8fafc; font-size: 14px; outline: none; transition: all 0.2s; font-family: inherit; }
        .form-group input:focus { border-color: #6366f1; background: #fff; box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1); }
        .form-group textarea { min-height: 100px; resize: vertical; }
        
        .modal-footer { padding: 0 28px 28px; }
        .full-width { width: 100%; height: 52px; font-size: 15px; }

        /* Member mgmt UI */
        .add-member-form { display: flex; gap: 10px; margin-bottom: 24px; }
        .add-member-form input { flex: 1; padding: 12px; border-radius: 12px; border: 1px solid #e2e8f0; font-size: 14px; outline: none; }
        .btn-inline-add { background: #10b981; color: #fff; border: none; padding: 0 20px; border-radius: 12px; font-weight: 700; cursor: pointer; font-size: 14px; }
        
        .member-list-grid { display: flex; flex-direction: column; gap: 10px; }
        .member-card-small { display: flex; align-items: center; gap: 12px; padding: 12px; background: #f8fafc; border-radius: 16px; border: 1px solid #f1f5f9; }
        .member-avatar-mini { width: 34px; height: 34px; background: #eef2ff; color: #6366f1; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 13px; }
        .member-meta { flex: 1; }
        .member-meta strong { display: block; font-size: 13px; color: #1e293b; }
        .member-meta span { font-size: 11px; color: #94a3b8; }
        .btn-remove-member { background: transparent; border: none; color: #ef4444; font-size: 12px; font-weight: 700; cursor: pointer; padding: 4px 8px; border-radius: 6px; }
        .btn-remove-member:hover { background: #fee2e2; }
        .empty-text { text-align: center; color: #94a3b8; padding: 20px; font-size: 14px; font-style: italic; }

        .loading-container { height: 100vh; display: flex; align-items: center; justify-content: center; font-weight: 700; color: #6366f1; font-size: 1.1rem; }
        
        .type-toggle { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; background: #f1f5f9; padding: 4px; border-radius: 12px; }
        .type-toggle button { padding: 10px; border: none; border-radius: 10px; cursor: pointer; font-weight: 700; font-size: 14px; transition: all 0.2s; }
        .type-toggle button.active.add { background: #10b981; color: #fff; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2); }
        .type-toggle button.active.reduce { background: #ef4444; color: #fff; box-shadow: 0 4px 12px rgba(239, 68, 68, 0.2); }
      `}</style>
    </div>
  );
};

export default AdminTeams;
