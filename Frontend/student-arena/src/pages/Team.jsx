import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axiosConfig";
import Navbar from "../components/Navbar";

const TEAM_STYLES = `
  .team-page { min-height: 100vh; background: #f8fafc; }
  
  /* Empty Case */
  .no-team-hero { text-align: center; padding: 100px 40px; margin-top: 40px; }
  .no-team-icon { font-size: 64px; margin-bottom: 24px; }
  .no-team-title { font-size: 36px; font-weight: 800; color: #1e293b; margin-bottom: 16px; letter-spacing: -1px; }
  .no-team-text { color: #64748b; font-size: 18px; max-width: 500px; margin: 0 auto 40px; line-height: 1.6; }
  .no-team-actions { display: flex; gap: 20px; justify-content: center; }
  .btn-outline-large { padding: 16px 32px; border-radius: 16px; border: 2px solid #e2e8f0; background: #fff; color: #475569; font-weight: 700; cursor: pointer; transition: all 0.2s; }
  .btn-primary-large { padding: 16px 32px; border-radius: 16px; border: none; background: #6366f1; color: #fff; font-weight: 700; cursor: pointer; transition: all 0.2s; box-shadow: 0 10px 15px -3px rgba(99, 102, 241, 0.3); }

  /* Dashboard Header */
  .team-dash-header { display: flex; justify-content: space-between; align-items: center; padding: 32px; margin-bottom: 32px; background: #fff; }
  .team-info-main { display: flex; gap: 24px; align-items: center; }
  .team-large-avatar { width: 90px; height: 90px; background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%); border-radius: 24px; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 42px; font-weight: 800; box-shadow: 0 10px 20px rgba(99, 102, 241, 0.2); }
  .team-title { font-size: 32px; font-weight: 800; color: #1e293b; margin: 0; letter-spacing: -1px; }
  .team-slogan { font-size: 16px; color: #64748b; font-style: italic; margin-top: 4px; }
  .team-meta-pills { display: flex; gap: 12px; margin-top: 16px; }
  .meta-pill { padding: 4px 12px; background: #f1f5f9; border-radius: 8px; font-size: 13px; font-weight: 700; color: #475569; border: 1px solid #e2e8f0; }
  .status-pill { padding: 4px 12px; border-radius: 8px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; }
  .status-pill.active { background: #f0fdf4; color: #16a34a; border: 1px solid #dcfce7; }
  .status-pill.inactive { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }
  .status-pill.archived { background: #f1f5f9; color: #64748b; border: 1px solid #e2e8f0; }
  
  .team-admin-actions { display: flex; gap: 8px; }
  .btn-icon-edit-large, .btn-icon-delete-large { padding: 12px; border-radius: 12px; border: 1px solid #e2e8f0; background: #fff; cursor: pointer; transition: all 0.2s; font-size: 18px; }
  .btn-icon-delete-large:hover { background: #fef2f2; border-color: #fee2e2; }
  .btn-icon-edit-large:hover { background: #f8fafc; border-color: #cbd5e1; }

  /* Content Grid */
  .team-content-grid { display: grid; grid-template-columns: 400px 1fr; gap: 32px; }
  .side-card { margin-bottom: 24px; padding: 24px; }
  .side-title { font-size: 15px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 20px; }
  
  .invite-box { display: flex; gap: 10px; margin-bottom: 12px; }
  .invite-code-display { flex: 1; padding: 12px; background: #f8fafc; border-radius: 12px; border: 1px dashed #cbd5e1; text-align: center; font-family: 'JetBrains Mono', monospace; font-size: 18px; font-weight: 800; color: #1e293b; letter-spacing: 2px; }
  .btn-copy { padding: 0 16px; background: #6366f1; color: #fff; border: none; border-radius: 12px; font-weight: 700; font-size: 13px; cursor: pointer; }
  .invite-hint { font-size: 12px; color: #94a3b8; line-height: 1.5; margin: 0; }

  .member-list-stack { display: flex; flex-direction: column; gap: 12px; }
  .member-item-row { display: flex; align-items: center; gap: 14px; padding: 14px; background: #f8fafc; border-radius: 16px; border: 1px solid #f1f5f9; transition: transform 0.2s; }
  .member-avatar-mini { width: 40px; height: 40px; background: #eef2ff; color: #6366f1; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 14px; }
  .member-details { flex: 1; display: flex; flex-direction: column; }
  .member-realname { font-size: 14px; font-weight: 700; color: #1e293b; }
  .member-handle { font-size: 11px; color: #94a3b8; font-weight: 600; }
  .badge-leader { padding: 4px 8px; background: #fef3c7; color: #92400e; border-radius: 6px; font-size: 10px; font-weight: 800; }
  .badge-member { padding: 4px 8px; background: #f1f5f9; color: #64748b; border-radius: 6px; font-size: 10px; font-weight: 800; }
  
  .member-controls { display: flex; gap: 4px; }
  .btn-control-mini { padding: 6px; border: none; background: #fff; border-radius: 8px; cursor: pointer; font-size: 12px; border: 1px solid #e2e8f0; }
  .btn-control-mini.danger { color: #ef4444; border-color: #fee2e2; }
  
  .btn-add-member-full { width: 100%; margin-top: 20px; padding: 12px; background: #fff; color: #6366f1; border: 2px dashed #ddd6fe; border-radius: 16px; font-weight: 800; font-size: 14px; cursor: pointer; transition: all 0.2s; }
  .btn-add-member-full:hover { background: #f5f3ff; border-style: solid; }

  .main-info-card { padding: 32px; margin-bottom: 32px; }
  .description-text-large { font-size: 16px; line-height: 1.8; color: #475569; margin: 0; }
  
  /* Team Projects Section */
  .team-projects-list { display: flex; flex-direction: column; gap: 16px; }
  .team-project-item { padding: 20px; background: #f8fafc; border-radius: 16px; border: 1px solid #e2e8f0; transition: all 0.2s; }
  .team-project-item:hover { border-color: #cbd5e1; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
  .project-header-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
  .project-name { font-size: 18px; font-weight: 800; color: #1e293b; margin: 0; cursor: pointer; transition: color 0.2s; }
  .project-name:hover { color: #6366f1; }
  .project-status-badge { padding: 4px 10px; border-radius: 8px; font-size: 11px; font-weight: 700; }
  .project-status-badge.active { background: #dcfce7; color: #166534; }
  .project-status-badge.completed { background: #dbeafe; color: #1e40af; }
  .project-description-short { font-size: 14px; color: #64748b; line-height: 1.6; margin-bottom: 12px; }
  .participating-members { margin-top: 12px; padding-top: 12px; border-top: 1px solid #e2e8f0; }
  .members-label { font-size: 12px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 8px; }
  .members-tags { display: flex; flex-wrap: wrap; gap: 6px; }
  .member-tag { padding: 4px 10px; background: #eef2ff; color: #4338ca; border-radius: 6px; font-size: 12px; font-weight: 600; }
  .no-projects-text { text-align: center; color: #94a3b8; font-size: 14px; padding: 20px 0; }
  
  .danger-zone { background: #fff; border: 1px dashed #fecaca; }
  .danger-content { display: flex; justify-content: space-between; align-items: center; }
  .danger-title { font-size: 16px; font-weight: 800; color: #dc2626; margin: 0; }
  .danger-subtitle { font-size: 13px; color: #64748b; margin-top: 2px; }
  .btn-danger-outline { padding: 10px 20px; background: #fff; border: 1px solid #fecaca; color: #dc2626; border-radius: 12px; font-weight: 700; cursor: pointer; transition: all 0.2s; }
  .btn-danger-outline:hover { background: #fee2e2; }

  .loading-screen { height: 100vh; display: flex; align-items: center; justify-content: center; font-weight: 800; color: #6366f1; font-size: 1.25rem; }
  
  /* Modals Shared */
  .modal-overlay { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.4); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 2000; }
  .glass-card { background: rgba(255, 255, 255, 0.9); backdrop-filter: blur(12px); border-radius: 24px; border: 1px solid #fff; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.1); width: 100%; max-width: 460px; overflow: hidden; }
  .modal-header { padding: 24px; border-bottom: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center; }
  .modal-header h2 { font-size: 20px; font-weight: 800; color: #1e293b; margin: 0; }
  .close-btn { width: 32px; height: 32px; border-radius: 50%; background: #f1f5f9; border: none; color: #64748b; cursor: pointer; font-size: 20px; }
  .modal-body { padding: 24px; }
  .form-group { margin-bottom: 20px; display: flex; flex-direction: column; gap: 8px; }
  .form-group label { font-size: 13px; font-weight: 700; color: #475569; }
  .form-group input, .form-group textarea { padding: 12px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; font-size: 14px; outline: none; transition: border-color 0.2s; }
  .form-group input:focus { border-color: #6366f1; }
  .btn-primary.full-width { width: 100%; padding: 14px; background: #6366f1; color: #fff; border: none; border-radius: 12px; font-weight: 700; cursor: pointer; transition: transform 0.1s; }
  .btn-primary.full-width:active { transform: scale(0.98); }
`;

const Team = () => {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [team, setTeam] = useState(null);
  const [teamProjects, setTeamProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);

  // Form states
  const [createForm, setCreateForm] = useState({
    name: "",
    description: "",
    slogan: "",
  });
  const [joinCode, setJoinCode] = useState("");
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    slogan: "",
  });
  const [addMemberInput, setAddMemberInput] = useState("");

  // Loading states
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const profileData = (await api.get("/users/profile")).data;
      setProfile(profileData);

      if (profileData.team && profileData.team._id) {
        try {
          const [teamData, projectsRes] = await Promise.all([
            api.get(`/teams/${profileData.team._id}`),
            api
              .get("/projects/team-projects")
              .catch(() => ({ data: { projects: [] } })),
          ]);
          setTeam(teamData.data);
          setTeamProjects(projectsRes.data.projects || []);
          setEditForm({
            name: teamData.data.name || "",
            description: teamData.data.description || "",
            slogan: teamData.data.slogan || "",
          });
        } catch (teamErr) {
          // Si l'équipe n'existe pas (référence orpheline), nettoyer l'état
          if (teamErr.response?.status === 404) {
            setTeam(null);
            setTeamProjects([]);
            // Recharger le profil pour obtenir les données mises à jour
            const updatedProfile = (await api.get("/users/profile")).data;
            setProfile(updatedProfile);
          } else {
            throw teamErr;
          }
        }
      } else {
        setTeam(null);
        setTeamProjects([]);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await api.post("/teams", createForm);
      setShowCreateModal(false);
      setCreateForm({ name: "", description: "", slogan: "" });
      await fetchData();
    } catch (err) {
      alert(err.response?.data?.message || "Erreur lors de la création");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleJoinTeam = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await api.post("/teams/join", { invitationCode: joinCode });
      setShowJoinModal(false);
      setJoinCode("");
      await fetchData();
    } catch (err) {
      alert(err.response?.data?.message || "Erreur lors de la jonction");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateTeam = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await api.put(`/teams/${team._id}`, editForm);
      setShowEditModal(false);
      await fetchData();
    } catch (err) {
      alert(err.response?.data?.message || "Erreur lors de la mise à jour");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLeaveTeam = async () => {
    if (window.confirm("Êtes-vous sûr de vouloir quitter l'équipe ?")) {
      try {
        await api.post(`/teams/${team._id}/leave`);
        // Rafraîchir le profil pour refléter que l'utilisateur n'a plus d'équipe
        await fetchData();
      } catch (err) {
        alert(err.response?.data?.message || "Erreur lors du départ");
      }
    }
  };

  const handleDeleteTeam = async () => {
    if (
      window.confirm(
        "Action irréversible : Supprimer définitivement l'équipe ?"
      )
    ) {
      try {
        await api.delete(`/teams/${team._id}`);
        await fetchData();
      } catch (err) {
        alert(err.response?.data?.message || "Erreur lors de la suppression");
      }
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await api.post(`/teams/${team._id}/add-member`, {
        emailOrUsername: addMemberInput,
      });
      setAddMemberInput("");
      setShowAddMemberModal(false);
      await fetchData();
    } catch (err) {
      alert(err.response?.data?.message || "Erreur lors de l'ajout");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveMember = async (memberId, memberName) => {
    if (window.confirm(`Retirer ${memberName} de l'équipe ?`)) {
      try {
        await api.delete(`/teams/${team._id}/members/${memberId}`);
        // Forcer le rafraîchissement complet des données
        await fetchData();
      } catch (err) {
        alert(err.response?.data?.message || "Erreur lors du retrait");
      }
    }
  };

  const handleGiveLeadership = async (memberId, memberName) => {
    if (window.confirm(`Promouvoir ${memberName} au rang de leader ?`)) {
      try {
        await api.post(`/teams/${team._id}/give-leadership/${memberId}`);
        await fetchData();
      } catch (err) {
        alert(err.response?.data?.message || "Erreur lors de la promotion");
      }
    }
  };

  const handleRemoveLeadership = async (memberId, memberName) => {
    if (window.confirm(`Rétrograder ${memberName} au rang de membre ?`)) {
      try {
        await api.delete(`/teams/${team._id}/remove-leadership/${memberId}`);
        await fetchData();
      } catch (err) {
        alert(err.response?.data?.message || "Erreur de rétrogradation");
      }
    }
  };

  const copyInvitationCode = () => {
    navigator.clipboard.writeText(team.invitationCode);
    alert("Code copié dans le presse-papier !");
  };

  const isLeader = team?.leaders?.some((l) => l._id === profile?._id);

  if (loading)
    return (
      <div className="loading-screen">
        <style>{TEAM_STYLES}</style>Chargement du QG...
      </div>
    );

  if (!team) {
    return (
      <div className="team-page">
        <style>{TEAM_STYLES}</style>
        <Navbar />
        <main className="page-container">
          <div className="no-team-hero card premium-shadow fade-in">
            <div className="no-team-icon">🛡️</div>
            <h1 className="no-team-title">Rejoignez l'élite</h1>
            <p className="no-team-text">
              Pour participer aux projets d'envergure, vous avez besoin d'une
              escouade. Créez la vôtre ou rejoignez des experts.
            </p>
            <div className="no-team-actions">
              <button
                onClick={() => setShowJoinModal(true)}
                className="btn-outline-large"
              >
                Rejoindre via code
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className="btn-primary-large"
              >
                Créer une Équipe
              </button>
            </div>
          </div>
        </main>

        {showCreateModal && (
          <div
            className="modal-overlay"
            onClick={() => setShowCreateModal(false)}
          >
            <div
              className="modal-content glass-card"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h2>Fonder une Équipe</h2>
                <button
                  className="close-btn"
                  onClick={() => setShowCreateModal(false)}
                >
                  ×
                </button>
              </div>
              <form onSubmit={handleCreateTeam} className="modal-body">
                <div className="form-group">
                  <label>Nom de l'escouade</label>
                  <input
                    type="text"
                    value={createForm.name}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, name: e.target.value })
                    }
                    required
                    placeholder="Ex: Neural Knights"
                  />
                </div>
                <div className="form-group">
                  <label>Slogan</label>
                  <input
                    type="text"
                    value={createForm.slogan}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, slogan: e.target.value })
                    }
                    placeholder="Ex: On code, vous gagnez"
                  />
                </div>
                <div className="form-group">
                  <label>Description des objectifs</label>
                  <textarea
                    value={createForm.description}
                    onChange={(e) =>
                      setCreateForm({
                        ...createForm,
                        description: e.target.value,
                      })
                    }
                    placeholder="Quelle est votre mission ?"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary full-width"
                >
                  Lancer l'Équipe
                </button>
              </form>
            </div>
          </div>
        )}

        {showJoinModal && (
          <div
            className="modal-overlay"
            onClick={() => setShowJoinModal(false)}
          >
            <div
              className="modal-content glass-card"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h2>Rejoindre une Équipe</h2>
                <button
                  className="close-btn"
                  onClick={() => setShowJoinModal(false)}
                >
                  ×
                </button>
              </div>
              <form onSubmit={handleJoinTeam} className="modal-body">
                <div className="form-group">
                  <label>Code d'invitation</label>
                  <input
                    type="text"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value)}
                    required
                    placeholder="TEAM-XXXX-1234"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary full-width"
                >
                  Vérifier le Code & Entrer
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="team-page">
      <style>{TEAM_STYLES}</style>
      <Navbar />
      <main className="page-container">
        <div className="team-dash-header card premium-shadow">
          <div className="team-info-main">
            <div className="team-large-avatar">
              {team.name?.charAt(0)?.toUpperCase()}
            </div>
            <div className="team-text-meta">
              <h1 className="team-title">{team.name}</h1>
              <p className="team-slogan">
                "{team.slogan || "Prêts à relever tous les défis"}"
              </p>
              <div className="team-meta-pills">
                <span className="meta-pill">
                  👥 {team.members?.length} membres
                </span>
                <span className="meta-pill">🏆 {team.points} points</span>
                <span className={`status-pill ${team.status}`}>
                  {team.status}
                </span>
              </div>
            </div>
          </div>
          {isLeader && (
            <div className="team-admin-actions">
              <button
                onClick={() => setShowEditModal(true)}
                className="btn-icon-edit-large"
              >
                ⚙️
              </button>
              <button
                onClick={handleDeleteTeam}
                className="btn-icon-delete-large"
              >
                🗑️
              </button>
            </div>
          )}
        </div>

        <div className="team-content-grid">
          <div className="team-side">
            <div className="card side-card">
              <h3 className="side-title">Accès Privé</h3>
              <div className="invite-box">
                <code className="invite-code-display">
                  {team.invitationCode}
                </code>
                <button onClick={copyInvitationCode} className="btn-copy">
                  Copier Code
                </button>
              </div>
              <p className="invite-hint">
                Seuls les membres possédant ce code secret peuvent rejoindre
                l'escouade.
              </p>
            </div>

            <div className="card side-card">
              <h3 className="side-title">
                Membres de l'escouade ({team.members?.length}/{team.maxMembers})
              </h3>
              <div className="member-list-stack">
                {team.members?.map((member) => {
                  const memberIsLeader = team.leaders?.some(
                    (l) => l._id === member._id
                  );
                  const isMe = member._id === profile?._id;
                  return (
                    <div key={member._id} className="member-item-row">
                      <div className="member-avatar-mini">
                        {member.userName?.charAt(0)?.toUpperCase() || "?"}
                      </div>
                      <div className="member-details">
                        <span className="member-realname">
                          {member.firstName} {member.lastName}{" "}
                          {isMe && "(C'est vous)"}
                        </span>
                        <span className="member-handle">
                          @{member.userName}
                        </span>
                      </div>
                      <div className="member-badge-col">
                        {memberIsLeader ? (
                          <span className="badge-leader">LEADER</span>
                        ) : (
                          <span className="badge-member">PILOTE</span>
                        )}
                      </div>
                      {isLeader && !isMe && (
                        <div className="member-controls">
                          <button
                            onClick={() =>
                              memberIsLeader
                                ? handleRemoveLeadership(
                                    member._id,
                                    member.firstName
                                  )
                                : handleGiveLeadership(
                                    member._id,
                                    member.firstName
                                  )
                            }
                            className="btn-control-mini"
                            title="Modifier rang"
                          >
                            👑
                          </button>
                          <button
                            onClick={() =>
                              handleRemoveMember(member._id, member.firstName)
                            }
                            className="btn-control-mini danger"
                            title="Exclure"
                          >
                            ✖
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              {isLeader && team.members?.length < team.maxMembers && (
                <button
                  onClick={() => setShowAddMemberModal(true)}
                  className="btn-add-member-full"
                >
                  + Ajouter Recrue
                </button>
              )}
            </div>
          </div>

          <div className="team-main-content">
            <div className="card main-info-card">
              <h3 className="side-title">Mission de l'Équipe</h3>
              <p className="description-text-large">
                {team.description ||
                  "Aucune mission définie pour le moment. Le leader peut en spécifier une dans les réglages."}
              </p>
            </div>

            <div className="card main-info-card">
              <h3 className="side-title">Projets de Groupe</h3>
              {teamProjects.filter((project) => project.type === "team")
                .length > 0 ? (
                <div className="team-projects-list">
                  {teamProjects
                    .filter((project) => project.type === "team")
                    .map((project) => {
                      // Vérifier si l'équipe participe à ce projet
                      const teamParticipates = project.participants?.some(
                        (p) => {
                          const participantId = p._id || p;
                          return participantId === team._id;
                        }
                      );

                      // Si l'équipe participe, tous les membres participent
                      const participatingMembers = teamParticipates
                        ? team.members
                        : [];

                      return (
                        <div key={project._id} className="team-project-item">
                          <div className="project-header-row">
                            <h4
                              className="project-name"
                              onClick={() =>
                                navigate(`/projects/${project._id}`)
                              }
                            >
                              {project.title}
                            </h4>
                            <span
                              className={`project-status-badge ${project.status}`}
                            >
                              {project.status === "active"
                                ? "🟢 En cours"
                                : project.status === "completed"
                                ? "🔵 Terminé"
                                : project.status}
                            </span>
                          </div>
                          <p className="project-description-short">
                            {project.description?.substring(0, 100)}...
                          </p>
                          {participatingMembers.length > 0 && (
                            <div className="participating-members">
                              <span className="members-label">
                                Membres de l'équipe :
                              </span>
                              <div className="members-tags">
                                {participatingMembers.map((member) => (
                                  <span key={member._id} className="member-tag">
                                    {member.firstName} {member.lastName}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
              ) : (
                <p className="no-projects-text">
                  Aucun projet de groupe pour le moment.
                </p>
              )}
            </div>

            <div className="card main-info-card danger-zone">
              <div className="danger-content">
                <div>
                  <h4 className="danger-title">Quitter l'escouade</h4>
                  <p className="danger-subtitle">
                    Vous perdrez l'accès aux points de groupe et aux projets
                    d'équipe.
                  </p>
                </div>
                <button
                  onClick={handleLeaveTeam}
                  className="btn-danger-outline"
                >
                  Quitter
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div
            className="modal-content glass-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>Réglages de l'Équipe</h2>
              <button
                className="close-btn"
                onClick={() => setShowEditModal(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleUpdateTeam} className="modal-body">
              <div className="form-group">
                <label>Nom</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm({ ...editForm, name: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Slogan</label>
                <input
                  type="text"
                  value={editForm.slogan}
                  onChange={(e) =>
                    setEditForm({ ...editForm, slogan: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label>Description / Mission</label>
                <textarea
                  value={editForm.description}
                  onChange={(e) =>
                    setEditForm({ ...editForm, description: e.target.value })
                  }
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary full-width"
              >
                Sauvegarder les modifications
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {showAddMemberModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowAddMemberModal(false)}
        >
          <div
            className="modal-content glass-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>Recruter un membre</h2>
              <button
                className="close-btn"
                onClick={() => setShowAddMemberModal(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleAddMember} className="modal-body">
              <div className="form-group">
                <label>Email ou Nom d'utilisateur</label>
                <input
                  type="text"
                  value={addMemberInput}
                  onChange={(e) => setAddMemberInput(e.target.value)}
                  required
                  placeholder="Ex: jean@test.com"
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary full-width"
              >
                Envoyer l'ordre d'intégration
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Team;
