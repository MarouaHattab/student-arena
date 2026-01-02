import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axiosConfig";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";

const GenerateIdea = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [theme, setTheme] = useState("");
  const [difficulty, setDifficulty] = useState("Intermédiaire");
  const [type, setType] = useState("individual");
  const [loading, setLoading] = useState(false);
  const [idea, setIdea] = useState(null);

  // Project Creation Modal States
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [projectFormData, setProjectFormData] = useState({
    title: "",
    description: "",
    successCriteria: "",
    tags: [],
    type: "individual",
    startDate: "",
    endDate: "",
    firstPlacePoints: 100,
    secondPlacePoints: 75,
    thirdPlacePoints: 50,
    otherParticipantsPoints: 25
  });

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!theme.trim()) {
      alert("Veuillez entrer un thème ou un domaine d'intérêt.");
      return;
    }

    try {
      setLoading(true);
      setIdea(null);
      const res = await api.post('/ai/generate-project-idea', { theme, difficulty, type });
      const response = res.data;
      if (response.success && response.projectIdea) {
        setIdea(response.projectIdea);
      }
    } catch (err) {
      alert("Erreur lors de la génération de l'idée. Réessayez.");
    } finally {
      setLoading(false);
    }
  };

  const handleUseIdea = () => {
    if (!idea) return;
    
    setProjectFormData({
      ...projectFormData,
      title: idea.title,
      description: idea.description,
      successCriteria: idea.successCriteria,
      tags: idea.tags,
      type: type,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Default 1 week
    });
    setShowCreateModal(true);
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      setIsCreating(true);
      await api.post('/projects', projectFormData);
      alert("Projet créé avec succès !");
      setShowCreateModal(false);
      navigate("/admin/projects");
    } catch (err) {
      alert(err.response?.data?.message || "Erreur lors de la création du projet");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div style={styles.container}>
      <Navbar />
      <main style={styles.main}>
        <div style={styles.header}>
          <h1 style={styles.title}>Générateur d'Idées IA</h1>
          <p style={styles.subtitle}>Transformez un simple thème en un projet complet et structuré.</p>
        </div>

        <div style={styles.contentGrid}>
          {/* Form Side */}
          <div style={styles.formCard}>
            <form onSubmit={handleGenerate}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Thème ou Domaine</label>
                <input
                  type="text"
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  placeholder="Ex: Écologie, Sport, Intelligence Artificielle..."
                  style={styles.input}
                  required
                />
              </div>

              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Difficulté</label>
                  <select 
                    value={difficulty} 
                    onChange={(e) => setDifficulty(e.target.value)}
                    style={styles.select}
                  >
                    <option value="Débutant">Débutant</option>
                    <option value="Intermédiaire">Intermédiaire</option>
                    <option value="Avancé">Avancé</option>
                  </select>
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Type</label>
                  <select 
                    value={type} 
                    onChange={(e) => setType(e.target.value)}
                    style={styles.select}
                  >
                    <option value="individual">Individuel</option>
                    <option value="team">Équipe</option>
                  </select>
                </div>
              </div>

              <button type="submit" style={styles.generateBtn} disabled={loading}>
                {loading ? "Génération en cours..." : "Générer mon idée ✨"}
              </button>
            </form>
          </div>

          {/* Result Side */}
          <div style={styles.resultCol}>
            {loading ? (
              <div style={styles.loadingState}>
                <div style={styles.spinner}></div>
                <p>L'IA réfléchit à votre prochain défi...</p>
              </div>
            ) : idea ? (
              <div style={styles.ideaCard}>
                <div style={styles.ideaHeader}>
                  <h2 style={styles.ideaTitle}>{idea.title}</h2>
                  <div style={styles.ideaMeta}>
                    <span style={styles.metaBadge}>{difficulty}</span>
                    <span style={styles.metaBadge}>{idea.estimatedDuration}</span>
                  </div>
                </div>

                <div style={styles.ideaSection}>
                  <h3 style={styles.sectionTitle}>Description</h3>
                  <p style={styles.ideaDesc}>{idea.description}</p>
                </div>

                <div style={styles.ideaSection}>
                  <h3 style={styles.sectionTitle}>Technologies Suggérées</h3>
                  <div style={styles.techTags}>
                    {idea.suggestedTechnologies?.map((tech, i) => (
                      <span key={i} style={styles.techTag}>{tech}</span>
                    ))}
                  </div>
                </div>

                <div style={styles.ideaSection}>
                  <h3 style={styles.sectionTitle}>Critères de Succès</h3>
                  <div style={styles.criteriaBox}>
                    {idea.successCriteria}
                  </div>
                </div>

                <div style={styles.footerRow}>
                  <div style={styles.tagsRow}>
                    {idea.tags?.map((tag, i) => (
                      <span key={i} style={styles.tag}>#{tag}</span>
                    ))}
                  </div>
                  
                  {user?.role === 'admin' && (
                    <button onClick={handleUseIdea} style={styles.useIdeaBtn}>
                      Utiliser pour un projet 🚀
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div style={styles.emptyState}>
                <div style={styles.emptyIcon}>💡</div>
                <p>Entrez un thème pour voir apparaître une proposition complète de projet ici.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Creation Modal */}
      {showCreateModal && (
        <div style={styles.modalOverlay} onClick={() => setShowCreateModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>Finaliser le projet</h2>
              <button onClick={() => setShowCreateModal(false)} style={styles.modalClose}>×</button>
            </div>
            <form onSubmit={handleCreateProject}>
              <div style={styles.modalBody}>
                <div style={styles.modalRow}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Titre du projet</label>
                    <input 
                      type="text" 
                      value={projectFormData.title}
                      onChange={(e) => setProjectFormData({...projectFormData, title: e.target.value})}
                      style={styles.input}
                      required
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Type</label>
                    <select 
                      value={projectFormData.type}
                      onChange={(e) => setProjectFormData({...projectFormData, type: e.target.value})}
                      style={styles.select}
                    >
                      <option value="individual">Individuel</option>
                      <option value="team">Équipe</option>
                    </select>
                  </div>
                </div>

                <div style={styles.modalRow}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Date de début</label>
                    <input 
                      type="date" 
                      value={projectFormData.startDate}
                      onChange={(e) => setProjectFormData({...projectFormData, startDate: e.target.value})}
                      style={styles.input}
                      required
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Date de fin</label>
                    <input 
                      type="date" 
                      value={projectFormData.endDate}
                      onChange={(e) => setProjectFormData({...projectFormData, endDate: e.target.value})}
                      style={styles.input}
                      required
                    />
                  </div>
                </div>

                <div style={styles.pointsGrid}>
                  <div style={styles.pointInputGroup}>
                    <label style={styles.label}>1er Place (pts)</label>
                    <input 
                      type="number" 
                      value={projectFormData.firstPlacePoints}
                      onChange={(e) => setProjectFormData({...projectFormData, firstPlacePoints: parseInt(e.target.value)})}
                      style={styles.input}
                    />
                  </div>
                  <div style={styles.pointInputGroup}>
                    <label style={styles.label}>2e Place (pts)</label>
                    <input 
                      type="number" 
                      value={projectFormData.secondPlacePoints}
                      onChange={(e) => setProjectFormData({...projectFormData, secondPlacePoints: parseInt(e.target.value)})}
                      style={styles.input}
                    />
                  </div>
                </div>
              </div>
              <div style={styles.modalFooter}>
                <button type="button" onClick={() => setShowCreateModal(false)} style={styles.cancelBtn}>Annuler</button>
                <button type="submit" style={styles.confirmBtn} disabled={isCreating}>
                  {isCreating ? "Création..." : "Confirmer et Publier"}
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
  main: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "40px 24px",
  },
  header: {
    marginBottom: "40px",
  },
  title: {
    fontSize: "32px",
    fontWeight: "800",
    color: "#1e293b",
    margin: "0 0 8px 0",
  },
  subtitle: {
    fontSize: "16px",
    color: "#64748b",
    margin: 0,
  },
  contentGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 2fr",
    gap: "32px",
    alignItems: "start",
  },
  formCard: {
    background: "#fff",
    padding: "32px",
    borderRadius: "20px",
    border: "1px solid #e2e8f0",
  },
  formGroup: {
    marginBottom: "20px",
    flex: 1,
  },
  label: {
    display: "block",
    fontSize: "14px",
    fontWeight: "600",
    color: "#475569",
    marginBottom: "8px",
  },
  input: {
    width: "100%",
    padding: "12px 16px",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    background: "#f8fafc",
    fontSize: "14px",
    boxSizing: "border-box",
  },
  formRow: {
    display: "flex",
    gap: "16px",
  },
  select: {
    width: "100%",
    padding: "12px 16px",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    background: "#f8fafc",
    fontSize: "14px",
    cursor: "pointer",
  },
  generateBtn: {
    width: "100%",
    padding: "14px",
    background: "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)",
    color: "#fff",
    border: "none",
    borderRadius: "12px",
    fontWeight: "700",
    fontSize: "15px",
    cursor: "pointer",
    marginTop: "12px",
    boxShadow: "0 4px 6px -1px rgba(99, 102, 241, 0.4)",
    transition: "transform 0.2s",
  },
  resultCol: {
    minHeight: "400px",
  },
  loadingState: {
    height: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    background: "#fff",
    borderRadius: "20px",
    border: "1px solid #e2e8f0",
    padding: "40px",
    color: "#64748b",
  },
  spinner: {
    width: "40px",
    height: "40px",
    border: "3px solid #e2e8f0",
    borderTop: "3px solid #6366f1",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    marginBottom: "20px",
  },
  ideaCard: {
    background: "#fff",
    padding: "40px",
    borderRadius: "24px",
    border: "1px solid #e2e8f0",
    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05)",
  },
  ideaHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "32px",
    gap: "20px",
  },
  ideaTitle: {
    fontSize: "26px",
    fontWeight: "800",
    color: "#1e293b",
    margin: 0,
    flex: 1,
  },
  ideaMeta: {
    display: "flex",
    gap: "10px",
  },
  metaBadge: {
    padding: "6px 14px",
    background: "#f1f5f9",
    color: "#475569",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "600",
  },
  ideaSection: {
    marginBottom: "32px",
  },
  sectionTitle: {
    fontSize: "16px",
    fontWeight: "700",
    color: "#475569",
    marginBottom: "12px",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  ideaDesc: {
    fontSize: "15px",
    lineHeight: "1.7",
    color: "#475569",
    whiteSpace: "pre-wrap",
  },
  techTags: {
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
  },
  techTag: {
    padding: "8px 16px",
    background: "#eef2ff",
    color: "#4f46e5",
    borderRadius: "10px",
    fontSize: "14px",
    fontWeight: "600",
  },
  criteriaBox: {
    background: "#f8fafc",
    padding: "20px",
    borderRadius: "16px",
    border: "1px solid #e2e8f0",
    fontSize: "15px",
    lineHeight: "1.6",
    color: "#475569",
    whiteSpace: "pre-wrap",
  },
  footerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "32px",
    paddingTop: "24px",
    borderTop: "1px solid #f1f5f9",
  },
  tagsRow: {
    display: "flex",
    gap: "12px",
    color: "#94a3b8",
    fontSize: "14px",
    fontWeight: "500",
  },
  useIdeaBtn: {
    padding: "12px 20px",
    background: "#1e293b",
    color: "#fff",
    border: "none",
    borderRadius: "12px",
    fontWeight: "600",
    fontSize: "14px",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  emptyState: {
    height: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    background: "#fff",
    borderRadius: "20px",
    border: "1px dashed #cbd5e1",
    padding: "40px",
    color: "#94a3b8",
    textAlign: "center",
  },
  emptyIcon: {
    fontSize: "48px",
    marginBottom: "16px",
  },
  // Modal Styles
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  modal: {
    background: "#fff",
    borderRadius: "24px",
    width: "100%",
    maxWidth: "600px",
    maxHeight: "90vh",
    overflowY: "auto",
  },
  modalHeader: {
    padding: "24px 32px",
    borderBottom: "1px solid #e2e8f0",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: "20px",
    fontWeight: "700",
    margin: 0,
  },
  modalClose: {
    background: "none",
    border: "none",
    fontSize: "24px",
    color: "#64748b",
    cursor: "pointer",
  },
  modalBody: {
    padding: "32px",
  },
  modalRow: {
    display: "flex",
    gap: "16px",
    marginBottom: "8px",
  },
  pointsGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "16px",
    marginTop: "16px",
  },
  modalFooter: {
    padding: "24px 32px",
    borderTop: "1px solid #e2e8f0",
    display: "flex",
    justifyContent: "flex-end",
    gap: "12px",
  },
  cancelBtn: {
    padding: "12px 24px",
    background: "#f1f5f9",
    color: "#475569",
    border: "none",
    borderRadius: "12px",
    fontWeight: "600",
    cursor: "pointer",
  },
  confirmBtn: {
    padding: "12px 24px",
    background: "#6366f1",
    color: "#fff",
    border: "none",
    borderRadius: "12px",
    fontWeight: "600",
    cursor: "pointer",
  }
};

export default GenerateIdea;
