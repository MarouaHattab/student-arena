import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axiosConfig";
import Navbar from "../components/Navbar";

const Profile = () => {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Bio generation state
  const [isGeneratingBio, setIsGeneratingBio] = useState(false);
  const [bioFormData, setBioFormData] = useState({
    skills: "",
    interests: "",
    experience: ""
  });
  const [showBioModal, setShowBioModal] = useState(false);
  const [generatedBio, setGeneratedBio] = useState("");
  
  // Edit mode state
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    firstName: "",
    lastName: "",
    userName: "",
    bio: ""
  });
  const [isSaving, setIsSaving] = useState(false);

  // Password change state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get('/users/profile');
      const data = res.data;
      setProfile(data);
      setEditData({
        firstName: data.firstName || "",
        lastName: data.lastName || "",
        userName: data.userName || "",
        bio: data.bio || ""
      });
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors du chargement du profil");
    } finally {
      setLoading(false);
    }
  };



  const handleGenerateBio = async () => {
    try {
      setIsGeneratingBio(true);
      const res = await api.post('/ai/generate-bio', {
        firstName: profile?.firstName,
        lastName: profile?.lastName,
        skills: bioFormData.skills,
        interests: bioFormData.interests,
        experience: bioFormData.experience
      });
      const response = res.data;
      setGeneratedBio(response.bio);
    } catch (err) {
      alert("Erreur lors de la génération de la bio: " + (err.response?.data?.message || err.message));
    } finally {
      setIsGeneratingBio(false);
    }
  };

  const handleApplyGeneratedBio = async () => {
    try {
      setIsSaving(true);
      await api.patch(`/users/${profile._id}`, { bio: generatedBio });
      setProfile({ ...profile, bio: generatedBio });
      setEditData({ ...editData, bio: generatedBio });
      setShowBioModal(false);
      setGeneratedBio("");
      setBioFormData({ skills: "", interests: "", experience: "" });
    } catch (err) {
      alert("Erreur lors de la sauvegarde: " + (err.response?.data?.message || err.message));
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setIsSaving(true);
      const res = await api.put(`/users/${profile._id}`, editData);
      const updatedProfile = res.data;
      setProfile({ ...profile, ...updatedProfile });
      setIsEditing(false);
    } catch (err) {
      alert("Erreur lors de la sauvegarde: " + (err.response?.data?.message || err.message));
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("Les nouveaux mots de passe ne correspondent pas");
      return;
    }

    try {
      setIsChangingPassword(true);
      await api.put(`/users/${profile._id}/password`, {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      alert("Mot de passe mis à jour avec succès !");
      setShowPasswordModal(false);
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      alert(err.response?.data?.message || "Erreur lors du changement de mot de passe");
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingContainer}>
          <div style={styles.spinner}></div>
          <p style={styles.loadingText}>Chargement du profil...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.errorContainer}>
          <p style={styles.errorText}>{error}</p>
          <button onClick={fetchProfile} style={styles.retryBtn}>Réessayer</button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <Navbar />

      {/* Main Content */}
      <main style={styles.main}>
        {/* Profile Header Card */}
        <div style={styles.profileHeader}>
          <div style={styles.avatarContainer}>
            <div style={styles.avatar}>
              {profile?.firstName?.charAt(0)?.toUpperCase() || "U"}
              {profile?.lastName?.charAt(0)?.toUpperCase() || ""}
            </div>
            <div style={styles.statusBadge}>
              {profile?.role === "admin" ? "Admin" : "Membre"}
            </div>
          </div>
          
          <div style={styles.profileInfo}>
            <h2 style={styles.profileName}>
              {profile?.firstName} {profile?.lastName}
            </h2>
            <p style={styles.username}>@{profile?.userName}</p>
            <div style={styles.statsRow}>
              <div style={styles.statItem}>
                <span style={styles.statValue}>{profile?.points || 0}</span>
                <span style={styles.statLabel}>Points</span>
              </div>
              <div style={styles.statDivider}></div>
              <div style={styles.statItem}>
                <span style={styles.statValue}>{profile?.submissionsCount || 0}</span>
                <span style={styles.statLabel}>Soumissions</span>
              </div>
              <div style={styles.statDivider}></div>
              <div style={styles.statItem}>
                <span style={styles.statValue}>{profile?.registeredProjectsCount || 0}</span>
                <span style={styles.statLabel}>Projets</span>
              </div>
            </div>
          </div>

          <div style={styles.actionButtons}>
            {!isEditing ? (
              <button onClick={() => setIsEditing(true)} style={styles.editBtn}>
                Modifier
              </button>
            ) : (
              <div style={styles.editActions}>
                <button onClick={handleSaveProfile} style={styles.saveBtn} disabled={isSaving}>
                  {isSaving ? "..." : "Sauvegarder"}
                </button>
                <button onClick={() => setIsEditing(false)} style={styles.cancelBtn}>
                  Annuler
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Details Grid */}
        <div style={styles.detailsGrid}>
          {/* Personal Info Card */}
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>
              Informations personnelles
            </h3>
            <div style={styles.cardContent}>
              {isEditing ? (
                <>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Prénom</label>
                    <input
                      type="text"
                      value={editData.firstName}
                      onChange={(e) => setEditData({ ...editData, firstName: e.target.value })}
                      style={styles.input}
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Nom</label>
                    <input
                      type="text"
                      value={editData.lastName}
                      onChange={(e) => setEditData({ ...editData, lastName: e.target.value })}
                      style={styles.input}
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Nom d'utilisateur</label>
                    <input
                      type="text"
                      value={editData.userName}
                      onChange={(e) => setEditData({ ...editData, userName: e.target.value })}
                      style={styles.input}
                    />
                  </div>
                </>
              ) : (
                <>
                  <div style={styles.infoRow}>
                    <span style={styles.infoLabel}>Email</span>
                    <span style={styles.infoValue}>{profile?.email}</span>
                  </div>
                  <div style={styles.infoRow}>
                    <span style={styles.infoLabel}>Nom d'utilisateur</span>
                    <span style={styles.infoValue}>@{profile?.userName}</span>
                  </div>
                  <div style={styles.infoRow}>
                    <span style={styles.infoLabel}>Rôle</span>
                    <span style={{
                      ...styles.roleBadge,
                      backgroundColor: profile?.role === "admin" ? "#fef3c7" : "#e0e7ff",
                      color: profile?.role === "admin" ? "#92400e" : "#3730a3"
                    }}>
                      {profile?.role === "admin" ? "Administrateur" : "Utilisateur"}
                    </span>
                  </div>
                  <button 
                    onClick={() => setShowPasswordModal(true)} 
                    style={styles.passwordBtn}
                  >
                    Changer le mot de passe
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Team Card */}
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>
              Équipe
            </h3>
            <div style={styles.cardContent}>
              {profile?.team ? (
                <>
                  <div style={styles.teamInfo}>
                    <div style={styles.teamIcon}>T</div>
                    <div>
                      <p style={styles.teamName}>{profile.team.name}</p>
                      <p style={styles.teamRole}>
                        {profile.isTeamLeader ? "Chef d'équipe" : "Membre"}
                      </p>
                    </div>
                  </div>
                  {profile.team.description && (
                    <p style={styles.teamDescription}>{profile.team.description}</p>
                  )}
                </>
              ) : (
                <div style={styles.noTeam}>
                  <div style={styles.noTeamIcon}>?</div>
                  <p style={styles.noTeamText}>Vous n'êtes membre d'aucune équipe</p>
                  <button onClick={() => navigate("/team")} style={styles.joinTeamBtn}>Rejoindre une équipe</button>
                </div>
              )}
            </div>
          </div>

          {/* Bio Card */}
          <div style={{ ...styles.card, gridColumn: "1 / -1" }}>
            <div style={styles.cardHeader}>
              <h3 style={styles.cardTitle}>
                Bio
              </h3>
              <button onClick={() => setShowBioModal(true)} style={styles.aiButton}>
                Générer avec l'IA
              </button>
            </div>
            <div style={styles.cardContent}>
              {isEditing ? (
                <textarea
                  value={editData.bio}
                  onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                  style={styles.textarea}
                  placeholder="Décrivez-vous en quelques mots..."
                  rows={4}
                />
              ) : (
                <p style={styles.bioText}>
                  {profile?.bio || "Aucune bio renseignée. Cliquez sur 'Générer avec l'IA' pour créer une bio automatiquement."}
                </p>
              )}
            </div>
          </div>

          {/* Stats Card */}
          <div style={{ ...styles.card, gridColumn: "1 / -1" }}>
            <h3 style={styles.cardTitle}>
              Statistiques détaillées
            </h3>
            <div style={styles.statsGrid}>
              <div style={styles.statCard}>
                <div style={styles.statCardValue}>{profile?.points || 0}</div>
                <div style={styles.statCardLabel}>Points totaux</div>
              </div>
              <div style={styles.statCard}>
                <div style={styles.statCardValue}>{profile?.submissionsCount || 0}</div>
                <div style={styles.statCardLabel}>Soumissions</div>
              </div>
              <div style={styles.statCard}>
                <div style={styles.statCardValue}>{profile?.registeredProjectsCount || 0}</div>
                <div style={styles.statCardLabel}>Projets inscrits</div>
              </div>
              <div style={styles.statCard}>
                <div style={styles.statCardValue}>{profile?.team ? "1" : "0"}</div>
                <div style={styles.statCardLabel}>Équipe</div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* AI Bio Generation Modal */}
      {showBioModal && (
        <div style={styles.modalOverlay} onClick={() => setShowBioModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>Générer une bio avec l'IA</h2>
              <button onClick={() => setShowBioModal(false)} style={styles.modalClose}>×</button>
            </div>
            
            <div style={styles.modalBody}>
              <p style={styles.modalDescription}>
                Remplissez les informations ci-dessous pour générer une bio personnalisée.
              </p>
              
              <div style={styles.formGroup}>
                <label style={styles.label}>Compétences</label>
                <input
                  type="text"
                  value={bioFormData.skills}
                  onChange={(e) => setBioFormData({ ...bioFormData, skills: e.target.value })}
                  style={styles.input}
                  placeholder="Ex: React, Node.js, Python, Machine Learning..."
                />
              </div>
              
              <div style={styles.formGroup}>
                <label style={styles.label}>Intérêts</label>
                <input
                  type="text"
                  value={bioFormData.interests}
                  onChange={(e) => setBioFormData({ ...bioFormData, interests: e.target.value })}
                  style={styles.input}
                  placeholder="Ex: Développement web, IA, Compétitions..."
                />
              </div>
              
              <div style={styles.formGroup}>
                <label style={styles.label}>Expérience</label>
                <input
                  type="text"
                  value={bioFormData.experience}
                  onChange={(e) => setBioFormData({ ...bioFormData, experience: e.target.value })}
                  style={styles.input}
                  placeholder="Ex: Étudiant en informatique, 2 ans d'expérience..."
                />
              </div>

              {generatedBio && (
                <div style={styles.generatedBioContainer}>
                  <h4 style={styles.generatedBioTitle}>Bio générée:</h4>
                  <p style={styles.generatedBioText}>{generatedBio}</p>
                </div>
              )}
            </div>

            <div style={styles.modalFooter}>
              {!generatedBio ? (
                <button 
                  onClick={handleGenerateBio} 
                  style={styles.generateBtn}
                  disabled={isGeneratingBio}
                >
                  {isGeneratingBio ? "Génération en cours..." : "Générer la bio"}
                </button>
              ) : (
                <>
                  <button onClick={handleGenerateBio} style={styles.regenerateBtn} disabled={isGeneratingBio}>
                    Régénérer
                  </button>
                  <button onClick={handleApplyGeneratedBio} style={styles.applyBtn} disabled={isSaving}>
                    Appliquer cette bio
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div style={styles.modalOverlay} onClick={() => setShowPasswordModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>Changer le mot de passe</h2>
              <button onClick={() => setShowPasswordModal(false)} style={styles.modalClose}>×</button>
            </div>
            <form onSubmit={handlePasswordChange}>
              <div style={styles.modalBody}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Mot de passe actuel</label>
                  <input
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    style={styles.input}
                    required
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Nouveau mot de passe</label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    style={styles.input}
                    required
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Confirmer le nouveau mot de passe</label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    style={styles.input}
                    required
                  />
                </div>
              </div>
              <div style={styles.modalFooter}>
                <button type="button" onClick={() => setShowPasswordModal(false)} style={styles.cancelBtn}>Annuler</button>
                <button type="submit" style={styles.saveBtn} disabled={isChangingPassword}>
                  {isChangingPassword ? "En cours..." : "Mettre à jour"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
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
    height: "100vh",
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
  errorContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
  },
  errorText: {
    color: "#ef4444",
    fontSize: "16px",
    marginBottom: "16px",
  },
  retryBtn: {
    padding: "10px 20px",
    background: "#6366f1",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
  },
  // Main
  main: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "32px 24px",
  },
  // Profile Header
  profileHeader: {
    background: "#fff",
    borderRadius: "12px",
    padding: "32px",
    display: "flex",
    alignItems: "center",
    gap: "32px",
    marginBottom: "24px",
    border: "1px solid #e2e8f0",
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
    animation: "fadeIn 0.4s ease-out",
  },
  avatarContainer: {
    position: "relative",
  },
  avatar: {
    width: "100px",
    height: "100px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "32px",
    fontWeight: "bold",
    color: "#fff",
  },
  statusBadge: {
    position: "absolute",
    bottom: "-6px",
    left: "50%",
    transform: "translateX(-50%)",
    background: "#1e293b",
    color: "#fff",
    padding: "4px 12px",
    borderRadius: "12px",
    fontSize: "11px",
    fontWeight: "600",
    whiteSpace: "nowrap",
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: "28px",
    fontWeight: "bold",
    color: "#1e293b",
    margin: "0 0 4px 0",
  },
  username: {
    fontSize: "16px",
    color: "#64748b",
    margin: "0 0 20px 0",
  },
  statsRow: {
    display: "flex",
    alignItems: "center",
    gap: "24px",
  },
  statItem: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  statValue: {
    fontSize: "24px",
    fontWeight: "bold",
    color: "#1e293b",
  },
  statLabel: {
    fontSize: "13px",
    color: "#64748b",
  },
  statDivider: {
    width: "1px",
    height: "36px",
    background: "#e2e8f0",
  },
  actionButtons: {
    display: "flex",
    gap: "12px",
  },
  editBtn: {
    padding: "12px 24px",
    background: "#6366f1",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
    transition: "all 0.2s ease",
  },
  passwordBtn: {
    marginTop: "20px",
    padding: "10px 16px",
    background: "#fff",
    color: "#6366f1",
    border: "1px solid #6366f1",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "600",
    transition: "all 0.2s",
  },
  editActions: {
    display: "flex",
    gap: "10px",
  },
  saveBtn: {
    padding: "12px 24px",
    background: "#10b981",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
  },
  cancelBtn: {
    padding: "12px 24px",
    background: "#f1f5f9",
    color: "#475569",
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
  },
  // Details Grid
  detailsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "20px",
  },
  card: {
    background: "#fff",
    borderRadius: "12px",
    padding: "24px",
    border: "1px solid #e2e8f0",
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
    animation: "fadeIn 0.4s ease-out",
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
    margin: 0,
  },
  cardContent: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  infoRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 16px",
    background: "#f8fafc",
    borderRadius: "8px",
  },
  infoLabel: {
    color: "#64748b",
    fontSize: "14px",
  },
  infoValue: {
    color: "#1e293b",
    fontSize: "14px",
    fontWeight: "500",
  },
  roleBadge: {
    padding: "4px 12px",
    borderRadius: "12px",
    fontSize: "12px",
    fontWeight: "600",
  },
  // Team
  teamInfo: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    padding: "14px",
    background: "#f0f9ff",
    borderRadius: "8px",
  },
  teamIcon: {
    width: "40px",
    height: "40px",
    background: "#6366f1",
    color: "#fff",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "18px",
    fontWeight: "bold",
  },
  teamName: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#1e293b",
    margin: "0 0 2px 0",
  },
  teamRole: {
    fontSize: "13px",
    color: "#64748b",
    margin: 0,
  },
  teamDescription: {
    color: "#64748b",
    fontSize: "14px",
    lineHeight: "1.6",
    margin: 0,
  },
  noTeam: {
    textAlign: "center",
    padding: "20px",
  },
  noTeamIcon: {
    width: "48px",
    height: "48px",
    background: "#f1f5f9",
    color: "#94a3b8",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "24px",
    fontWeight: "bold",
    margin: "0 auto 12px",
  },
  noTeamText: {
    color: "#64748b",
    fontSize: "14px",
    margin: "0 0 14px 0",
  },
  joinTeamBtn: {
    padding: "10px 20px",
    background: "#6366f1",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "500",
  },
  // Bio
  aiButton: {
    padding: "8px 16px",
    background: "#6366f1",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "500",
  },
  bioText: {
    color: "#475569",
    fontSize: "14px",
    lineHeight: "1.7",
    margin: 0,
  },
  // Stats Grid
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "16px",
    marginTop: "8px",
  },
  statCard: {
    background: "#f8fafc",
    borderRadius: "10px",
    padding: "20px",
    textAlign: "center",
    border: "1px solid #e2e8f0",
  },
  statCardValue: {
    fontSize: "28px",
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: "4px",
  },
  statCardLabel: {
    fontSize: "12px",
    color: "#64748b",
  },
  // Form elements
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    marginBottom: "14px",
  },
  label: {
    color: "#475569",
    fontSize: "13px",
    fontWeight: "500",
  },
  input: {
    padding: "12px 14px",
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    color: "#1e293b",
    fontSize: "14px",
    outline: "none",
    transition: "all 0.2s ease",
  },
  textarea: {
    padding: "12px 14px",
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    color: "#1e293b",
    fontSize: "14px",
    outline: "none",
    resize: "vertical",
    minHeight: "100px",
    fontFamily: "inherit",
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
    maxWidth: "480px",
    width: "100%",
    maxHeight: "90vh",
    overflow: "auto",
    boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
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
    color: "#64748b",
    fontSize: "14px",
    marginBottom: "20px",
    lineHeight: "1.5",
  },
  generatedBioContainer: {
    background: "#f0fdf4",
    borderRadius: "10px",
    padding: "16px",
    border: "1px solid #bbf7d0",
    marginTop: "8px",
  },
  generatedBioTitle: {
    color: "#166534",
    fontSize: "13px",
    margin: "0 0 10px 0",
    fontWeight: "600",
  },
  generatedBioText: {
    color: "#1e293b",
    fontSize: "14px",
    lineHeight: "1.6",
    margin: 0,
  },
  modalFooter: {
    padding: "20px 24px",
    borderTop: "1px solid #e2e8f0",
    display: "flex",
    gap: "10px",
    justifyContent: "flex-end",
  },
  generateBtn: {
    padding: "12px 24px",
    background: "#6366f1",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
    width: "100%",
  },
  regenerateBtn: {
    padding: "12px 20px",
    background: "#f1f5f9",
    color: "#475569",
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
  },
  applyBtn: {
    padding: "12px 20px",
    background: "#10b981",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
  },
};

export default Profile;
