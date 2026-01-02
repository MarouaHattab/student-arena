import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axiosConfig";
import Navbar from "../components/Navbar";

const AdminSubmissions = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  
  const [project, setProject] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Modal states
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedSub, setSelectedSub] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [reviewForm, setReviewForm] = useState({
    status: "approved",
    score: 80,
    feedback: "",
    ranking: ""
  });

  useEffect(() => {
    checkAdminAndFetch();
  }, [projectId]);

  const checkAdminAndFetch = async () => {
    try {
      setLoading(true);
      const profileRes = await api.get('/users/profile');
      if (profileRes.data.role !== "admin") {
        navigate("/projects");
        return;
      }

      const [projRes, subsRes] = await Promise.all([
        api.get(`/projects/${projectId}`),
        api.get(`/submissions?projectId=${projectId}`)
      ]);
      
      setProject(projRes.data);
      setSubmissions(subsRes.data);
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  };

  const openReviewModal = (sub) => {
    setSelectedSub(sub);
    setReviewForm({
      status: sub.status || "approved",
      score: sub.score || 0,
      feedback: sub.feedback || "",
      ranking: sub.ranking || ""
    });
    setShowReviewModal(true);
  };

  const handleReview = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      
      // Step 1: Review (Status, Score, Feedback)
      await api.put(`/submissions/${selectedSub._id}/review`, {
        status: reviewForm.status,
        score: reviewForm.score,
        feedback: reviewForm.feedback
      });

      // Step 2: Rank (if provided and status is approved)
      if (reviewForm.ranking && reviewForm.status === 'approved') {
        await api.put(`/submissions/${selectedSub._id}/rank`, { ranking: parseInt(reviewForm.ranking) });
      }

      setShowReviewModal(false);
      await checkAdminAndFetch();
      alert("Soumission évaluée avec succès !");
    } catch (err) {
      alert(err.response?.data?.message || "Erreur lors de l'évaluation");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString("fr-FR");
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <Navbar />
        <div style={styles.loadingContainer}>
          <div style={styles.spinner}></div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <Navbar />
      <main style={styles.main}>
        <div style={styles.header}>
          <h1 style={styles.title}>
            Soumissions: <span style={styles.projectTitle}>{project?.title}</span>
          </h1>
          <button onClick={() => navigate("/admin/projects")} style={styles.backBtn}>
            Retour à la gestion
          </button>
        </div>

        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Soumis par</th>
                <th style={styles.th}>Lien GitHub</th>
                <th style={styles.th}>Date</th>
                <th style={styles.th}>Statut</th>
                <th style={styles.th}>Score</th>
                <th style={styles.th}>Rang</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((sub) => (
                <tr key={sub._id} style={styles.tr}>
                  <td style={styles.td}>
                    {sub.submittedByTeam ? (
                      <div>
                        <strong>{sub.submittedByTeam.name}</strong>
                        <div style={styles.subText}>Équipe</div>
                      </div>
                    ) : (
                      <div>
                        <strong>{sub.submittedByUser?.firstName} {sub.submittedByUser?.lastName}</strong>
                        <div style={styles.subText}>@{sub.submittedByUser?.userName}</div>
                      </div>
                    )}
                  </td>
                  <td style={styles.td}>
                    <a href={sub.githubLink} target="_blank" rel="noopener noreferrer" style={styles.link}>
                      GitHub Repository
                    </a>
                  </td>
                  <td style={styles.td}>{formatDate(sub.submittedAt)}</td>
                  <td style={styles.td}>
                    <span style={{
                      ...styles.statusBadge,
                      background: sub.status === 'approved' ? '#dcfce7' : 
                                 sub.status === 'rejected' ? '#fee2e2' : '#f1f5f9',
                      color: sub.status === 'approved' ? '#166534' : 
                             sub.status === 'rejected' ? '#991b1b' : '#475569'
                    }}>
                      {sub.status === 'pending' ? 'En attente' : 
                       sub.status === 'approved' ? 'Approuvé' : 'Rejeté'}
                    </span>
                  </td>
                  <td style={styles.td}>{sub.score !== undefined ? `${sub.score}/100` : '-'}</td>
                  <td style={styles.td}>
                    {sub.ranking ? (
                      <span style={styles.rankBadge}>#{sub.ranking}</span>
                    ) : '-'}
                  </td>
                  <td style={styles.td}>
                    <button onClick={() => openReviewModal(sub)} style={styles.reviewBtn}>
                      Évaluer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {submissions.length === 0 && (
            <div style={styles.emptyState}>
              Aucune soumission pour ce projet pour le moment.
            </div>
          )}
        </div>
      </main>

      {/* Review Modal */}
      {showReviewModal && (
        <div style={styles.modalOverlay} onClick={() => setShowReviewModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>Évaluer la soumission</h2>
              <button onClick={() => setShowReviewModal(false)} style={styles.modalClose}>×</button>
            </div>
            <form onSubmit={handleReview}>
              <div style={styles.modalBody}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Statut</label>
                  <select
                    value={reviewForm.status}
                    onChange={(e) => setReviewForm({ ...reviewForm, status: e.target.value })}
                    style={styles.select}
                  >
                    <option value="pending">En attente</option>
                    <option value="approved">Approuvé</option>
                    <option value="rejected">Rejeté</option>
                  </select>
                </div>
                
                <div style={styles.formGroup}>
                  <label style={styles.label}>Score (0-100)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={reviewForm.score}
                    onChange={(e) => setReviewForm({ ...reviewForm, score: e.target.value })}
                    style={styles.input}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Classement (optionnel)</label>
                  <select
                    value={reviewForm.ranking}
                    onChange={(e) => setReviewForm({ ...reviewForm, ranking: e.target.value })}
                    style={styles.select}
                  >
                    <option value="">Non classé</option>
                    <option value="1">1er Place</option>
                    <option value="2">2e Place</option>
                    <option value="3">3e Place</option>
                    <option value="4">Top 10</option>
                  </select>
                  <p style={styles.hint}>Attribuer un rang distribuera automatiquement les points selon les règles du projet.</p>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Feedback / Commentaires</label>
                  <textarea
                    value={reviewForm.feedback}
                    onChange={(e) => setReviewForm({ ...reviewForm, feedback: e.target.value })}
                    style={styles.textarea}
                    placeholder="Conseils, remarques techniques..."
                    rows={4}
                  />
                </div>
              </div>
              <div style={styles.modalFooter}>
                <button type="button" onClick={() => setShowReviewModal(false)} style={styles.cancelBtn}>
                  Annuler
                </button>
                <button type="submit" style={styles.submitBtn} disabled={isSubmitting}>
                  {isSubmitting ? "Enregistrement..." : "Valider l'évaluation"}
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
  container: { minHeight: "100vh", backgroundColor: "#f8fafc" },
  loadingContainer: { display: "flex", alignItems: "center", justifyContent: "center", height: "calc(100vh - 70px)" },
  spinner: { width: "40px", height: "40px", border: "3px solid #e2e8f0", borderTop: "3px solid #6366f1", borderRadius: "50%", animation: "spin 1s linear infinite" },
  main: { maxWidth: "1200px", margin: "0 auto", padding: "32px 24px" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" },
  title: { fontSize: "24px", color: "#1e293b", margin: 0 },
  projectTitle: { color: "#6366f1" },
  backBtn: { padding: "8px 16px", background: "#f1f5f9", color: "#475569", border: "1px solid #e2e8f0", borderRadius: "8px", cursor: "pointer", fontSize: "14px" },
  tableContainer: { background: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", overflow: "hidden" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { padding: "14px 16px", background: "#f8fafc", color: "#64748b", fontSize: "12px", fontWeight: "600", textTransform: "uppercase", textAlign: "left" },
  tr: { borderBottom: "1px solid #e2e8f0" },
  td: { padding: "14px 16px", fontSize: "14px", color: "#1e293b" },
  subText: { fontSize: "12px", color: "#64748b" },
  link: { color: "#6366f1", textDecoration: "none" },
  statusBadge: { padding: "4px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: "600" },
  rankBadge: { padding: "4px 8px", background: "#fef3c7", color: "#92400e", borderRadius: "6px", fontWeight: "bold" },
  reviewBtn: { padding: "6px 12px", background: "#6366f1", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "13px" },
  emptyState: { padding: "40px", textAlign: "center", color: "#64748b" },
  // Modal
  modalOverlay: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 },
  modal: { background: "#fff", borderRadius: "16px", maxWidth: "500px", width: "100%" },
  modalHeader: { padding: "20px 24px", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" },
  modalTitle: { fontSize: "18px", margin: 0 },
  modalClose: { border: "none", background: "none", fontSize: "24px", cursor: "pointer" },
  modalBody: { padding: "24px" },
  formGroup: { marginBottom: "16px" },
  label: { display: "block", fontSize: "13px", fontWeight: "500", marginBottom: "6px" },
  select: { width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #e2e8f0" },
  input: { width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #e2e8f0", boxSizing: "border-box" },
  textarea: { width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #e2e8f0", fontFamily: "inherit", resize: "none", boxSizing: "border-box" },
  hint: { fontSize: "11px", color: "#64748b", marginTop: "4px" },
  modalFooter: { padding: "20px 24px", borderTop: "1px solid #e2e8f0", display: "flex", justifyContent: "flex-end", gap: "12px" },
  cancelBtn: { padding: "10px 16px", background: "#f1f5f9", borderRadius: "8px", border: "none", cursor: "pointer" },
  submitBtn: { padding: "10px 16px", background: "#6366f1", color: "#fff", borderRadius: "8px", border: "none", cursor: "pointer" }
};

export default AdminSubmissions;
