import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axiosConfig";
import Navbar from "../components/Navbar";

const AdminProjects = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profile, setProfile] = useState(null);

  // AI States
  const [isGeneratingTags, setIsGeneratingTags] = useState(false);
  const [isImprovingDesc, setIsImprovingDesc] = useState(false);
  const [isGeneratingCriteria, setIsGeneratingCriteria] = useState(false);

  const [formData, setFormData] = useState({
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

  const [tagInput, setTagInput] = useState("");

  useEffect(() => {
    checkAdminAndFetch();
  }, []);

  const checkAdminAndFetch = async () => {
    try {
      setLoading(true);
      const profileData = (await api.get('/users/profile')).data;
      setProfile(profileData);
      
      if (profileData.role !== "admin") {
        navigate("/projects");
        return;
      }

      const projectsData = (await api.get('/projects')).data;
      setProjects(projectsData);
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
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
    setTagInput("");
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await api.post('/projects', formData);
      setShowCreateModal(false);
      resetForm();
      await checkAdminAndFetch();
    } catch (err) {
      alert(err.response?.data?.message || "Erreur lors de la création");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await api.put(`/projects/${selectedProject._id}`, formData);
      setShowEditModal(false);
      setSelectedProject(null);
      await checkAdminAndFetch();
    } catch (err) {
      alert(err.response?.data?.message || "Erreur lors de la mise à jour");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (projectId) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce projet ?")) return;
    try {
      await api.delete(`/projects/${projectId}`);
      await checkAdminAndFetch();
    } catch (err) {
      alert(err.response?.data?.message || "Erreur lors de la suppression");
    }
  };

  const handleStatusChange = async (projectId, newStatus) => {
    try {
      await api.put(`/projects/${projectId}/status`, { status: newStatus });
      await checkAdminAndFetch();
    } catch (err) {
      alert(err.response?.data?.message || "Erreur");
    }
  };

  const openEditModal = (project) => {
    setSelectedProject(project);
    setFormData({
      title: project.title || "",
      description: project.description || "",
      successCriteria: project.successCriteria || "",
      tags: project.tags || [],
      type: project.type || "individual",
      startDate: project.startDate ? project.startDate.split("T")[0] : "",
      endDate: project.endDate ? project.endDate.split("T")[0] : "",
      firstPlacePoints: project.firstPlacePoints || 100,
      secondPlacePoints: project.secondPlacePoints || 75,
      thirdPlacePoints: project.thirdPlacePoints || 50,
      otherParticipantsPoints: project.otherParticipantsPoints || 25
    });
    setShowEditModal(true);
  };

  const addTag = () => {
    if (tagInput.trim() && formData.tags.length < 10) {
      setFormData({ ...formData, tags: [...formData.tags, tagInput.trim().toLowerCase()] });
      setTagInput("");
    }
  };

  const removeTag = (index) => {
    setFormData({ ...formData, tags: formData.tags.filter((_, i) => i !== index) });
  };

  // AI Functions
  const handleGenerateTags = async () => {
    if (!formData.title || !formData.description) {
      alert("Veuillez remplir le titre et la description d'abord");
      return;
    }
    try {
      setIsGeneratingTags(true);
      const res = await api.post('/ai/generate-tags', { title: formData.title, description: formData.description });
      const response = res.data;
      if (response.success && response.tags) {
        setFormData({ ...formData, tags: response.tags });
      }
    } catch (err) {
      alert("Erreur lors de la génération des tags");
    } finally {
      setIsGeneratingTags(false);
    }
  };

  const handleImproveDescription = async () => {
    if (!formData.description) {
      alert("Veuillez remplir la description d'abord");
      return;
    }
    try {
      setIsImprovingDesc(true);
      const res = await api.post('/ai/improve-description', { title: formData.title, description: formData.description, style: 'professional' });
      const response = res.data;
      if (response.success && response.improvedDescription) {
        setFormData({ ...formData, description: response.improvedDescription });
      }
    } catch (err) {
      alert("Erreur lors de l'amélioration");
    } finally {
      setIsImprovingDesc(false);
    }
  };

  const handleGenerateCriteria = async () => {
    if (!formData.description) {
      alert("Veuillez remplir la description d'abord");
      return;
    }
    try {
      setIsGeneratingCriteria(true);
      const res = await api.post('/ai/generate-criteria', { title: formData.title, description: formData.description, type: formData.type });
      const response = res.data;
      if (response.success && response.criteria) {
        setFormData({ ...formData, successCriteria: response.criteria });
      }
    } catch (err) {
      alert("Erreur lors de la génération des critères");
    } finally {
      setIsGeneratingCriteria(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      draft: { bg: "#f1f5f9", color: "#475569" },
      active: { bg: "#dcfce7", color: "#166534" },
      completed: { bg: "#dbeafe", color: "#1e40af" },
      archived: { bg: "#fee2e2", color: "#991b1b" }
    };
    return colors[status] || colors.draft;
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <Navbar />
        <div style={styles.loadingContainer}>
          <div style={styles.spinner}></div>
        </div>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (profile?.role !== "admin") {
    return null;
  }

  const ProjectForm = ({ onSubmit, isEdit }) => (
    <form onSubmit={onSubmit}>
      <div style={styles.modalBody}>
        <div style={styles.formRow}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Titre *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              style={styles.input}
              required
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Type *</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              style={styles.input}
            >
              <option value="individual">Individuel</option>
              <option value="team">Équipe</option>
            </select>
          </div>
        </div>

        <div style={styles.formGroup}>
          <div style={styles.labelRow}>
            <label style={styles.label}>Description *</label>
            <button
              type="button"
              onClick={handleImproveDescription}
              style={styles.aiBtn}
              disabled={isImprovingDesc}
            >
              {isImprovingDesc ? "..." : "Améliorer avec IA"}
            </button>
          </div>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            style={styles.textarea}
            rows={4}
            required
          />
        </div>

        <div style={styles.formGroup}>
          <div style={styles.labelRow}>
            <label style={styles.label}>Critères de succès</label>
            <button
              type="button"
              onClick={handleGenerateCriteria}
              style={styles.aiBtn}
              disabled={isGeneratingCriteria}
            >
              {isGeneratingCriteria ? "..." : "Générer avec IA"}
            </button>
          </div>
          <textarea
            value={formData.successCriteria}
            onChange={(e) => setFormData({ ...formData, successCriteria: e.target.value })}
            style={styles.textarea}
            rows={3}
          />
        </div>

        <div style={styles.formGroup}>
          <div style={styles.labelRow}>
            <label style={styles.label}>Tags</label>
            <button
              type="button"
              onClick={handleGenerateTags}
              style={styles.aiBtn}
              disabled={isGeneratingTags}
            >
              {isGeneratingTags ? "..." : "Générer avec IA"}
            </button>
          </div>
          <div style={styles.tagInputRow}>
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
              style={{ ...styles.input, flex: 1 }}
              placeholder="Ajouter un tag"
            />
            <button type="button" onClick={addTag} style={styles.addTagBtn}>+</button>
          </div>
          <div style={styles.tagsContainer}>
            {formData.tags.map((tag, i) => (
              <span key={i} style={styles.tagItem}>
                {tag}
                <button type="button" onClick={() => removeTag(i)} style={styles.removeTagBtn}>×</button>
              </span>
            ))}
          </div>
        </div>

        <div style={styles.formRow}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Date de début</label>
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              style={styles.input}
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Date de fin</label>
            <input
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              style={styles.input}
            />
          </div>
        </div>

        <div style={styles.pointsSection}>
          <h4 style={styles.pointsTitle}>Points de récompense</h4>
          <div style={styles.pointsGrid}>
            <div style={styles.pointItem}>
              <label style={styles.pointLabel}>1er place</label>
              <input
                type="number"
                value={formData.firstPlacePoints}
                onChange={(e) => setFormData({ ...formData, firstPlacePoints: parseInt(e.target.value) })}
                style={styles.pointInput}
              />
            </div>
            <div style={styles.pointItem}>
              <label style={styles.pointLabel}>2e place</label>
              <input
                type="number"
                value={formData.secondPlacePoints}
                onChange={(e) => setFormData({ ...formData, secondPlacePoints: parseInt(e.target.value) })}
                style={styles.pointInput}
              />
            </div>
            <div style={styles.pointItem}>
              <label style={styles.pointLabel}>3e place</label>
              <input
                type="number"
                value={formData.thirdPlacePoints}
                onChange={(e) => setFormData({ ...formData, thirdPlacePoints: parseInt(e.target.value) })}
                style={styles.pointInput}
              />
            </div>
            <div style={styles.pointItem}>
              <label style={styles.pointLabel}>Autres</label>
              <input
                type="number"
                value={formData.otherParticipantsPoints}
                onChange={(e) => setFormData({ ...formData, otherParticipantsPoints: parseInt(e.target.value) })}
                style={styles.pointInput}
              />
            </div>
          </div>
        </div>
      </div>
      <div style={styles.modalFooter}>
        <button
          type="button"
          onClick={() => { isEdit ? setShowEditModal(false) : setShowCreateModal(false); resetForm(); }}
          style={styles.cancelBtn}
        >
          Annuler
        </button>
        <button type="submit" style={styles.submitBtn} disabled={isSubmitting}>
          {isSubmitting ? "..." : (isEdit ? "Enregistrer" : "Créer le projet")}
        </button>
      </div>
    </form>
  );

  return (
    <div style={styles.container}>
      <Navbar />
      <main style={styles.main}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Gestion des Projets</h1>
            <p style={styles.subtitle}>Administration des compétitions</p>
          </div>
          <div style={styles.headerActions}>
            <button onClick={() => navigate("/projects")} style={styles.backBtn}>
              Retour aux projets
            </button>
            <button onClick={() => { resetForm(); setShowCreateModal(true); }} style={styles.createBtn}>
              Nouveau projet
            </button>
          </div>
        </div>

        {/* Projects Table */}
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Titre</th>
                <th style={styles.th}>Type</th>
                <th style={styles.th}>Statut</th>
                <th style={styles.th}>Participants</th>
                <th style={styles.th}>Date fin</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project) => (
                <tr key={project._id} style={styles.tr}>
                  <td style={styles.td}>
                    <div style={styles.projectTitle}>{project.title}</div>
                  </td>
                  <td style={styles.td}>
                    <span style={{
                      ...styles.typeBadge,
                      background: project.type === "team" ? "#e0e7ff" : "#fef3c7",
                      color: project.type === "team" ? "#3730a3" : "#92400e"
                    }}>
                      {project.type === "team" ? "Équipe" : "Individuel"}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <select
                      value={project.status}
                      onChange={(e) => handleStatusChange(project._id, e.target.value)}
                      style={{
                        ...styles.statusSelect,
                        ...getStatusColor(project.status)
                      }}
                    >
                      <option value="draft">Brouillon</option>
                      <option value="active">Actif</option>
                      <option value="completed">Terminé</option>
                      <option value="archived">Archivé</option>
                    </select>
                  </td>
                  <td style={styles.td}>{project.participants?.length || 0}</td>
                  <td style={styles.td}>
                    {project.endDate ? new Date(project.endDate).toLocaleDateString("fr-FR") : "-"}
                  </td>
                  <td style={styles.td}>
                    <div style={styles.actions}>
                      <button onClick={() => navigate(`/admin/projects/${project._id}/submissions`)} style={styles.subBtn}>
                        Soumissions
                      </button>
                      <button onClick={() => openEditModal(project)} style={styles.editBtn}>
                        Modifier
                      </button>
                      <button onClick={() => handleDelete(project._id)} style={styles.deleteBtn}>
                        Supprimer
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {projects.length === 0 && (
            <div style={styles.emptyTable}>
              <p>Aucun projet créé</p>
            </div>
          )}
        </div>
      </main>

      {/* Create Modal */}
      {showCreateModal && (
        <div style={styles.modalOverlay} onClick={() => { setShowCreateModal(false); resetForm(); }}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>Créer un projet</h2>
              <button onClick={() => { setShowCreateModal(false); resetForm(); }} style={styles.modalClose}>×</button>
            </div>
            <ProjectForm onSubmit={handleCreate} isEdit={false} />
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div style={styles.modalOverlay} onClick={() => { setShowEditModal(false); resetForm(); }}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>Modifier le projet</h2>
              <button onClick={() => { setShowEditModal(false); resetForm(); }} style={styles.modalClose}>×</button>
            </div>
            <ProjectForm onSubmit={handleUpdate} isEdit={true} />
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
  main: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "32px 24px",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px",
  },
  title: {
    fontSize: "28px",
    fontWeight: "bold",
    color: "#1e293b",
    margin: "0 0 4px 0",
  },
  subtitle: {
    fontSize: "15px",
    color: "#64748b",
    margin: 0,
  },
  headerActions: {
    display: "flex",
    gap: "12px",
  },
  backBtn: {
    padding: "12px 24px",
    background: "#f1f5f9",
    color: "#475569",
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
  },
  createBtn: {
    padding: "12px 24px",
    background: "#6366f1",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
  },
  tableContainer: {
    background: "#fff",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    overflow: "hidden",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  th: {
    textAlign: "left",
    padding: "14px 16px",
    background: "#f8fafc",
    color: "#64748b",
    fontSize: "13px",
    fontWeight: "600",
    borderBottom: "1px solid #e2e8f0",
  },
  tr: {
    borderBottom: "1px solid #e2e8f0",
  },
  td: {
    padding: "14px 16px",
    fontSize: "14px",
    color: "#1e293b",
  },
  projectTitle: {
    fontWeight: "500",
  },
  typeBadge: {
    padding: "4px 10px",
    borderRadius: "12px",
    fontSize: "12px",
    fontWeight: "500",
  },
  statusSelect: {
    padding: "6px 12px",
    borderRadius: "8px",
    border: "none",
    fontSize: "12px",
    fontWeight: "500",
    cursor: "pointer",
  },
  actions: {
    display: "flex",
    gap: "8px",
  },
  subBtn: {
    padding: "6px 14px",
    background: "#1e293b",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "13px",
  },
  editBtn: {
    padding: "6px 14px",
    background: "#6366f1",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "13px",
  },
  deleteBtn: {
    padding: "6px 14px",
    background: "#fff",
    color: "#dc2626",
    border: "1px solid #fecaca",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "13px",
  },
  emptyTable: {
    padding: "40px",
    textAlign: "center",
    color: "#64748b",
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
    maxWidth: "700px",
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
  },
  modalBody: {
    padding: "24px",
  },
  modalFooter: {
    padding: "20px 24px",
    borderTop: "1px solid #e2e8f0",
    display: "flex",
    gap: "12px",
    justifyContent: "flex-end",
  },
  formRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "16px",
  },
  formGroup: {
    marginBottom: "16px",
  },
  labelRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "6px",
  },
  label: {
    fontSize: "13px",
    fontWeight: "500",
    color: "#475569",
  },
  aiBtn: {
    padding: "4px 12px",
    background: "#f0f9ff",
    color: "#0369a1",
    border: "1px solid #bae6fd",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "12px",
  },
  input: {
    width: "100%",
    padding: "12px 14px",
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    color: "#1e293b",
    fontSize: "14px",
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
    fontFamily: "inherit",
    resize: "vertical",
    boxSizing: "border-box",
  },
  tagInputRow: {
    display: "flex",
    gap: "8px",
    marginBottom: "8px",
  },
  addTagBtn: {
    padding: "12px 16px",
    background: "#6366f1",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "16px",
  },
  tagsContainer: {
    display: "flex",
    flexWrap: "wrap",
    gap: "6px",
  },
  tagItem: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    padding: "4px 10px",
    background: "#e0e7ff",
    color: "#3730a3",
    borderRadius: "6px",
    fontSize: "12px",
  },
  removeTagBtn: {
    background: "transparent",
    border: "none",
    color: "#3730a3",
    cursor: "pointer",
    fontSize: "14px",
    padding: "0 2px",
  },
  pointsSection: {
    padding: "16px",
    background: "#f8fafc",
    borderRadius: "10px",
  },
  pointsTitle: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#1e293b",
    margin: "0 0 12px 0",
  },
  pointsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "12px",
  },
  pointItem: {
    textAlign: "center",
  },
  pointLabel: {
    display: "block",
    fontSize: "12px",
    color: "#64748b",
    marginBottom: "6px",
  },
  pointInput: {
    width: "100%",
    padding: "10px",
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    textAlign: "center",
    fontSize: "14px",
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
    padding: "12px 24px",
    background: "#6366f1",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
  },
};

export default AdminProjects;
