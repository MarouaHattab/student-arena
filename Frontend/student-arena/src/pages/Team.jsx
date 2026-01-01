import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { teamAPI } from "../api/teamApi";
import { userAPI } from "../api/userApi";
import Navbar from "../components/Navbar";

const Team = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [profile, setProfile] = useState(null);
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);

  // Form states
  const [createForm, setCreateForm] = useState({ name: "", description: "", slogan: "" });
  const [joinCode, setJoinCode] = useState("");
  const [editForm, setEditForm] = useState({ name: "", description: "", slogan: "" });
  const [addMemberInput, setAddMemberInput] = useState("");

  // Loading states
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const profileData = await userAPI.getProfile();
      setProfile(profileData);

      if (profileData.team) {
        const teamData = await teamAPI.getTeamById(profileData.team._id);
        setTeam(teamData);
        setEditForm({
          name: teamData.name || "",
          description: teamData.description || "",
          slogan: teamData.slogan || ""
        });
      } else {
        // User has no team - clear the team state
        setTeam(null);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await teamAPI.createTeam(createForm);
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
      await teamAPI.joinByCode(joinCode);
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
      await teamAPI.updateTeam(team._id, editForm);
      setShowEditModal(false);
      await fetchData();
    } catch (err) {
      alert(err.response?.data?.message || "Erreur lors de la mise à jour");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLeaveTeam = async () => {
    if (!confirm("Êtes-vous sûr de vouloir quitter cette équipe ?")) return;
    try {
      setIsSubmitting(true);
      await teamAPI.leaveTeam(team._id);
      await fetchData();
    } catch (err) {
      alert(err.response?.data?.message || "Erreur lors de la sortie");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTeam = async () => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette équipe ? Cette action est irréversible.")) return;
    try {
      setIsSubmitting(true);
      await teamAPI.deleteTeam(team._id);
      await fetchData();
    } catch (err) {
      alert(err.response?.data?.message || "Erreur lors de la suppression");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await teamAPI.addMember(team._id, addMemberInput);
      setShowAddMemberModal(false);
      setAddMemberInput("");
      await fetchData();
    } catch (err) {
      alert(err.response?.data?.message || "Erreur lors de l'ajout");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveMember = async (memberId, memberName) => {
    if (!confirm(`Êtes-vous sûr de vouloir retirer ${memberName} de l'équipe ?`)) return;
    try {
      await teamAPI.removeMember(team._id, memberId);
      await fetchData();
    } catch (err) {
      alert(err.response?.data?.message || "Erreur lors du retrait");
    }
  };

  const handleGiveLeadership = async (userId, userName) => {
    if (!confirm(`Donner le rôle de leader à ${userName} ?`)) return;
    try {
      await teamAPI.giveLeadership(team._id, userId);
      await fetchData();
    } catch (err) {
      alert(err.response?.data?.message || "Erreur");
    }
  };

  const handleRemoveLeadership = async (userId, userName) => {
    if (!confirm(`Retirer le rôle de leader de ${userName} ?`)) return;
    try {
      await teamAPI.removeLeadership(team._id, userId);
      await fetchData();
    } catch (err) {
      alert(err.response?.data?.message || "Erreur");
    }
  };

  const isLeader = team?.leaders?.some(l => l._id === profile?._id);
  const copyInvitationCode = () => {
    navigator.clipboard.writeText(team?.invitationCode);
    alert("Code d'invitation copié !");
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <Navbar />
        <div style={styles.loadingContainer}>
          <div style={styles.spinner}></div>
          <p style={styles.loadingText}>Chargement...</p>
        </div>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // No team view
  if (!team) {
    return (
      <div style={styles.container}>
        <Navbar />
        <main style={styles.main}>
          <div style={styles.noTeamContainer}>
            <div style={styles.noTeamIcon}>T</div>
            <h2 style={styles.noTeamTitle}>Vous n'avez pas encore d'équipe</h2>
            <p style={styles.noTeamText}>
              Créez votre propre équipe ou rejoignez une équipe existante avec un code d'invitation.
            </p>
            <div style={styles.noTeamActions}>
              <button onClick={() => setShowCreateModal(true)} style={styles.primaryBtn}>
                Créer une équipe
              </button>
              <button onClick={() => setShowJoinModal(true)} style={styles.secondaryBtn}>
                Rejoindre avec un code
              </button>
            </div>
          </div>
        </main>

        {/* Create Team Modal */}
        {showCreateModal && (
          <div style={styles.modalOverlay} onClick={() => setShowCreateModal(false)}>
            <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
              <div style={styles.modalHeader}>
                <h2 style={styles.modalTitle}>Créer une équipe</h2>
                <button onClick={() => setShowCreateModal(false)} style={styles.modalClose}>×</button>
              </div>
              <form onSubmit={handleCreateTeam}>
                <div style={styles.modalBody}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Nom de l'équipe *</label>
                    <input
                      type="text"
                      value={createForm.name}
                      onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                      style={styles.input}
                      placeholder="Ex: Les Innovateurs"
                      required
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Description</label>
                    <textarea
                      value={createForm.description}
                      onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                      style={styles.textarea}
                      placeholder="Décrivez votre équipe..."
                      rows={3}
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Slogan</label>
                    <input
                      type="text"
                      value={createForm.slogan}
                      onChange={(e) => setCreateForm({ ...createForm, slogan: e.target.value })}
                      style={styles.input}
                      placeholder="Ex: Ensemble, on va plus loin !"
                    />
                  </div>
                </div>
                <div style={styles.modalFooter}>
                  <button type="button" onClick={() => setShowCreateModal(false)} style={styles.cancelBtn}>
                    Annuler
                  </button>
                  <button type="submit" style={styles.submitBtn} disabled={isSubmitting}>
                    {isSubmitting ? "Création..." : "Créer l'équipe"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Join Team Modal */}
        {showJoinModal && (
          <div style={styles.modalOverlay} onClick={() => setShowJoinModal(false)}>
            <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
              <div style={styles.modalHeader}>
                <h2 style={styles.modalTitle}>Rejoindre une équipe</h2>
                <button onClick={() => setShowJoinModal(false)} style={styles.modalClose}>×</button>
              </div>
              <form onSubmit={handleJoinTeam}>
                <div style={styles.modalBody}>
                  <p style={styles.modalDescription}>
                    Entrez le code d'invitation fourni par le leader de l'équipe.
                  </p>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Code d'invitation</label>
                    <input
                      type="text"
                      value={joinCode}
                      onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                      style={{ ...styles.input, textAlign: "center", letterSpacing: "4px", fontSize: "18px" }}
                      placeholder="XXXXXXXX"
                      maxLength={8}
                      required
                    />
                  </div>
                </div>
                <div style={styles.modalFooter}>
                  <button type="button" onClick={() => setShowJoinModal(false)} style={styles.cancelBtn}>
                    Annuler
                  </button>
                  <button type="submit" style={styles.submitBtn} disabled={isSubmitting}>
                    {isSubmitting ? "..." : "Rejoindre"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Team exists view
  return (
    <div style={styles.container}>
      <Navbar />
      <main style={styles.main}>
        {/* Team Header */}
        <div style={styles.teamHeader}>
          <div style={styles.teamHeaderLeft}>
            <div style={styles.teamAvatar}>
              {team.name?.charAt(0)?.toUpperCase() || "T"}
            </div>
            <div style={styles.teamHeaderInfo}>
              <h1 style={styles.teamName}>{team.name}</h1>
              {team.slogan && <p style={styles.teamSlogan}>"{team.slogan}"</p>}
              <div style={styles.teamMeta}>
                <span style={styles.teamMetaItem}>{team.members?.length || 0} / {team.maxMembers} membres</span>
                <span style={styles.teamMetaDivider}>|</span>
                <span style={styles.teamMetaItem}>{team.points || 0} points</span>
                <span style={styles.teamMetaDivider}>|</span>
                <span style={{
                  ...styles.statusBadge,
                  background: team.status === 'active' ? '#dcfce7' : '#fee2e2',
                  color: team.status === 'active' ? '#166534' : '#991b1b'
                }}>
                  {team.status === 'active' ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>
          {isLeader && (
            <div style={styles.teamActions}>
              <button onClick={() => setShowEditModal(true)} style={styles.editBtn}>
                Modifier
              </button>
              <button onClick={handleDeleteTeam} style={styles.deleteBtn}>
                Supprimer
              </button>
            </div>
          )}
        </div>

        {/* Grid Layout */}
        <div style={styles.grid}>
          {/* Invitation Code Card */}
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Code d'invitation</h3>
            <div style={styles.invitationCodeContainer}>
              <div style={styles.invitationCode}>{team.invitationCode}</div>
              <button onClick={copyInvitationCode} style={styles.copyBtn}>Copier</button>
            </div>
            <p style={styles.invitationHint}>
              Partagez ce code avec vos coéquipiers pour qu'ils puissent rejoindre l'équipe.
            </p>
          </div>

          {/* Description Card */}
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Description</h3>
            <p style={styles.descriptionText}>
              {team.description || "Aucune description renseignée."}
            </p>
          </div>

          {/* Members Card */}
          <div style={{ ...styles.card, gridColumn: "1 / -1" }}>
            <div style={styles.cardHeader}>
              <h3 style={styles.cardTitle}>Membres ({team.members?.length || 0}/{team.maxMembers})</h3>
              {isLeader && team.members?.length < team.maxMembers && (
                <button onClick={() => setShowAddMemberModal(true)} style={styles.addMemberBtn}>
                  Ajouter un membre
                </button>
              )}
            </div>
            <div style={styles.membersList}>
              {team.members?.map((member) => {
                const isMemberLeader = team.leaders?.some(l => l._id === member._id);
                const isCurrentUser = member._id === profile?._id;
                return (
                  <div key={member._id} style={styles.memberCard}>
                    <div style={styles.memberAvatar}>
                      {member.firstName?.charAt(0)}{member.lastName?.charAt(0)}
                    </div>
                    <div style={styles.memberInfo}>
                      <p style={styles.memberName}>
                        {member.firstName} {member.lastName}
                        {isCurrentUser && <span style={styles.youBadge}>(vous)</span>}
                      </p>
                      <p style={styles.memberUsername}>@{member.userName}</p>
                    </div>
                    <div style={styles.memberRole}>
                      {isMemberLeader ? (
                        <span style={styles.leaderBadge}>Leader</span>
                      ) : (
                        <span style={styles.memberBadge}>Membre</span>
                      )}
                    </div>
                    {isLeader && !isCurrentUser && (
                      <div style={styles.memberActions}>
                        {isMemberLeader ? (
                          <button
                            onClick={() => handleRemoveLeadership(member._id, member.firstName)}
                            style={styles.actionBtn}
                            title="Retirer le leadership"
                          >
                            Retirer leader
                          </button>
                        ) : (
                          <>
                            {team.leaders?.length < 2 && (
                              <button
                                onClick={() => handleGiveLeadership(member._id, member.firstName)}
                                style={styles.actionBtn}
                                title="Promouvoir leader"
                              >
                                Promouvoir
                              </button>
                            )}
                            <button
                              onClick={() => handleRemoveMember(member._id, member.firstName)}
                              style={styles.removeBtn}
                              title="Retirer de l'équipe"
                            >
                              Retirer
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Leave Team Card */}
          <div style={{ ...styles.card, gridColumn: "1 / -1" }}>
            <div style={styles.leaveSection}>
              <div>
                <h3 style={styles.leaveTitle}>Quitter l'équipe</h3>
                <p style={styles.leaveText}>
                  Vous ne pourrez plus accéder aux projets de l'équipe une fois parti.
                </p>
              </div>
              <button onClick={handleLeaveTeam} style={styles.leaveBtn}>
                Quitter l'équipe
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Edit Team Modal */}
      {showEditModal && (
        <div style={styles.modalOverlay} onClick={() => setShowEditModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>Modifier l'équipe</h2>
              <button onClick={() => setShowEditModal(false)} style={styles.modalClose}>×</button>
            </div>
            <form onSubmit={handleUpdateTeam}>
              <div style={styles.modalBody}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Nom de l'équipe</label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    style={styles.input}
                    required
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Description</label>
                  <textarea
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    style={styles.textarea}
                    rows={3}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Slogan</label>
                  <input
                    type="text"
                    value={editForm.slogan}
                    onChange={(e) => setEditForm({ ...editForm, slogan: e.target.value })}
                    style={styles.input}
                  />
                </div>
              </div>
              <div style={styles.modalFooter}>
                <button type="button" onClick={() => setShowEditModal(false)} style={styles.cancelBtn}>
                  Annuler
                </button>
                <button type="submit" style={styles.submitBtn} disabled={isSubmitting}>
                  {isSubmitting ? "..." : "Enregistrer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {showAddMemberModal && (
        <div style={styles.modalOverlay} onClick={() => setShowAddMemberModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>Ajouter un membre</h2>
              <button onClick={() => setShowAddMemberModal(false)} style={styles.modalClose}>×</button>
            </div>
            <form onSubmit={handleAddMember}>
              <div style={styles.modalBody}>
                <p style={styles.modalDescription}>
                  Entrez l'email ou le nom d'utilisateur du membre à ajouter.
                </p>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Email ou nom d'utilisateur</label>
                  <input
                    type="text"
                    value={addMemberInput}
                    onChange={(e) => setAddMemberInput(e.target.value)}
                    style={styles.input}
                    placeholder="email@example.com ou username"
                    required
                  />
                </div>
              </div>
              <div style={styles.modalFooter}>
                <button type="button" onClick={() => setShowAddMemberModal(false)} style={styles.cancelBtn}>
                  Annuler
                </button>
                <button type="submit" style={styles.submitBtn} disabled={isSubmitting}>
                  {isSubmitting ? "..." : "Ajouter"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

const styles = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#f8fafc",
  },
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "calc(100vh - 70px)",
  },
  spinner: {
    width: "40px",
    height: "40px",
    border: "3px solid #e2e8f0",
    borderTop: "3px solid #6366f1",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  loadingText: {
    color: "#64748b",
    marginTop: "16px",
    fontSize: "16px",
  },
  main: {
    maxWidth: "1000px",
    margin: "0 auto",
    padding: "32px 24px",
  },
  // No Team View
  noTeamContainer: {
    textAlign: "center",
    padding: "60px 20px",
    background: "#fff",
    borderRadius: "16px",
    border: "1px solid #e2e8f0",
  },
  noTeamIcon: {
    width: "80px",
    height: "80px",
    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
    color: "#fff",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "32px",
    fontWeight: "bold",
    margin: "0 auto 24px",
  },
  noTeamTitle: {
    fontSize: "24px",
    fontWeight: "bold",
    color: "#1e293b",
    margin: "0 0 12px 0",
  },
  noTeamText: {
    fontSize: "15px",
    color: "#64748b",
    margin: "0 0 32px 0",
    maxWidth: "400px",
    marginLeft: "auto",
    marginRight: "auto",
  },
  noTeamActions: {
    display: "flex",
    gap: "16px",
    justifyContent: "center",
  },
  primaryBtn: {
    padding: "14px 28px",
    background: "#6366f1",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "15px",
    fontWeight: "500",
  },
  secondaryBtn: {
    padding: "14px 28px",
    background: "#fff",
    color: "#475569",
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "15px",
    fontWeight: "500",
  },
  // Team Header
  teamHeader: {
    background: "#fff",
    borderRadius: "12px",
    padding: "28px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px",
    border: "1px solid #e2e8f0",
  },
  teamHeaderLeft: {
    display: "flex",
    alignItems: "center",
    gap: "20px",
  },
  teamAvatar: {
    width: "72px",
    height: "72px",
    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
    color: "#fff",
    borderRadius: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "28px",
    fontWeight: "bold",
  },
  teamHeaderInfo: {},
  teamName: {
    fontSize: "24px",
    fontWeight: "bold",
    color: "#1e293b",
    margin: "0 0 4px 0",
  },
  teamSlogan: {
    fontSize: "14px",
    color: "#64748b",
    fontStyle: "italic",
    margin: "0 0 12px 0",
  },
  teamMeta: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  teamMetaItem: {
    fontSize: "13px",
    color: "#64748b",
  },
  teamMetaDivider: {
    color: "#e2e8f0",
  },
  statusBadge: {
    padding: "4px 10px",
    borderRadius: "12px",
    fontSize: "12px",
    fontWeight: "500",
  },
  teamActions: {
    display: "flex",
    gap: "10px",
  },
  editBtn: {
    padding: "10px 20px",
    background: "#6366f1",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
  },
  deleteBtn: {
    padding: "10px 20px",
    background: "#fff",
    color: "#dc2626",
    border: "1px solid #fecaca",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
  },
  // Grid
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "20px",
  },
  card: {
    background: "#fff",
    borderRadius: "12px",
    padding: "24px",
    border: "1px solid #e2e8f0",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },
  cardTitle: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#1e293b",
    margin: "0 0 16px 0",
  },
  // Invitation Code
  invitationCodeContainer: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "12px",
  },
  invitationCode: {
    flex: 1,
    padding: "14px",
    background: "#f8fafc",
    borderRadius: "8px",
    textAlign: "center",
    fontSize: "20px",
    fontWeight: "bold",
    color: "#1e293b",
    letterSpacing: "4px",
    fontFamily: "monospace",
  },
  copyBtn: {
    padding: "14px 20px",
    background: "#6366f1",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
  },
  invitationHint: {
    fontSize: "13px",
    color: "#94a3b8",
    margin: 0,
  },
  // Description
  descriptionText: {
    fontSize: "14px",
    color: "#475569",
    lineHeight: "1.6",
    margin: 0,
  },
  // Members
  addMemberBtn: {
    padding: "8px 16px",
    background: "#6366f1",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "13px",
  },
  membersList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  memberCard: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    padding: "14px",
    background: "#f8fafc",
    borderRadius: "10px",
  },
  memberAvatar: {
    width: "44px",
    height: "44px",
    background: "#e0e7ff",
    color: "#4338ca",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "14px",
    fontWeight: "600",
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#1e293b",
    margin: "0 0 2px 0",
  },
  youBadge: {
    fontSize: "12px",
    color: "#64748b",
    fontWeight: "400",
    marginLeft: "6px",
  },
  memberUsername: {
    fontSize: "13px",
    color: "#64748b",
    margin: 0,
  },
  memberRole: {},
  leaderBadge: {
    padding: "4px 10px",
    background: "#fef3c7",
    color: "#92400e",
    borderRadius: "12px",
    fontSize: "12px",
    fontWeight: "500",
  },
  memberBadge: {
    padding: "4px 10px",
    background: "#e0e7ff",
    color: "#3730a3",
    borderRadius: "12px",
    fontSize: "12px",
    fontWeight: "500",
  },
  memberActions: {
    display: "flex",
    gap: "8px",
  },
  actionBtn: {
    padding: "6px 12px",
    background: "#fff",
    color: "#475569",
    border: "1px solid #e2e8f0",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "12px",
  },
  removeBtn: {
    padding: "6px 12px",
    background: "#fff",
    color: "#dc2626",
    border: "1px solid #fecaca",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "12px",
  },
  // Leave Section
  leaveSection: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  leaveTitle: {
    fontSize: "15px",
    fontWeight: "600",
    color: "#1e293b",
    margin: "0 0 4px 0",
  },
  leaveText: {
    fontSize: "13px",
    color: "#64748b",
    margin: 0,
  },
  leaveBtn: {
    padding: "10px 20px",
    background: "#fff",
    color: "#dc2626",
    border: "1px solid #fecaca",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
  },
  // Modal
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0,0,0,0.4)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    padding: "20px",
  },
  modal: {
    background: "#fff",
    borderRadius: "16px",
    maxWidth: "440px",
    width: "100%",
    maxHeight: "90vh",
    overflow: "auto",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "20px 24px",
    borderBottom: "1px solid #e2e8f0",
  },
  modalTitle: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#1e293b",
    margin: 0,
  },
  modalClose: {
    width: "32px",
    height: "32px",
    background: "#f1f5f9",
    border: "none",
    borderRadius: "50%",
    color: "#64748b",
    fontSize: "20px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  modalBody: {
    padding: "24px",
  },
  modalDescription: {
    fontSize: "14px",
    color: "#64748b",
    marginBottom: "20px",
    lineHeight: "1.5",
  },
  modalFooter: {
    padding: "20px 24px",
    borderTop: "1px solid #e2e8f0",
    display: "flex",
    gap: "12px",
    justifyContent: "flex-end",
  },
  // Form
  formGroup: {
    marginBottom: "16px",
  },
  label: {
    display: "block",
    fontSize: "13px",
    fontWeight: "500",
    color: "#475569",
    marginBottom: "6px",
  },
  input: {
    width: "100%",
    padding: "12px 14px",
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    color: "#1e293b",
    fontSize: "14px",
    outline: "none",
    boxSizing: "border-box",
  },
  textarea: {
    width: "100%",
    padding: "12px 14px",
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    color: "#1e293b",
    fontSize: "14px",
    outline: "none",
    resize: "vertical",
    fontFamily: "inherit",
    boxSizing: "border-box",
  },
  cancelBtn: {
    padding: "12px 20px",
    background: "#f1f5f9",
    color: "#475569",
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
  },
  submitBtn: {
    padding: "12px 20px",
    background: "#6366f1",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
  },
};

export default Team;
