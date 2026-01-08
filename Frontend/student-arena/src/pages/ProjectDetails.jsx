import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axiosConfig";
import Navbar from "../components/Navbar";

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [project, setProject] = useState(null);
  const [participants, setParticipants] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profile, setProfile] = useState(null);
  
  // Submission states
  const [mySubmission, setMySubmission] = useState(null);
  const [githubLink, setGithubLink] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSubmissionForm, setShowSubmissionForm] = useState(false);
  
  // AI Summary states
  const [aiSummary, setAiSummary] = useState(null);
  const [loadingSummary, setLoadingSummary] = useState(false);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [projectRes, participantsRes, profileRes, submissionsRes] = await Promise.all([
        api.get(`/projects/${id}`),
        api.get(`/projects/${id}/participants`),
        api.get('/users/profile'),
        api.get('/submissions/my-submissions')
      ]);

      setProject(projectRes.data);
      setParticipants(participantsRes.data);
      setProfile(profileRes.data);
      
      const submissionsData = submissionsRes.data;
      
      // Find if I have a submission for THIS project
      const submission = submissionsData.find(s => s.project?._id === id || s.project === id);
      if (submission) {
        setMySubmission(submission);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors du chargement des détails du projet");
    } finally {
      setLoading(false);
    }
  };

  const fetchAiSummary = async () => {
    try {
      setLoadingSummary(true);
      const res = await api.get(`/ai/project-summary/${id}`);
      const response = res.data;
      if (response.success) {
        setAiSummary(response.summary);
      }
    } catch (err) {
      console.error("Erreur lors de la génération du résumé:", err);
    } finally {
      setLoadingSummary(false);
    }
  };

  const handleRegister = async () => {
    try {
      await api.post(`/projects/${id}/register`);
      await fetchData();
      alert("Inscription réussie !");
    } catch (err) {
      alert(err.response?.data?.message || "Erreur lors de l'inscription");
    }
  };

  const handleSubmission = async (e) => {
    e.preventDefault();
    if (!githubLink.startsWith("https://github.com/")) {
      alert("Veuillez entrer un URL GitHub valide");
      return;
    }

    try {
      setIsSubmitting(true);
      await api.post('/submissions', {
        projectId: id,
        githubLink
      });
      setShowSubmissionForm(false);
      await fetchData();
      alert("Projet soumis avec succès !");
    } catch (err) {
      alert(err.response?.data?.message || "Erreur lors de la soumission");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isUserRegistered = () => {
    if (!profile) return false;
    return profile.registeredProjects?.some(p => (p._id || p) === id);
  };

  const isTeamRegistered = () => {
    if (!profile?.team) return false;
    // For team projects, we check if the team is in participants
    return project?.participants?.some(p => (p._id || p) === profile.team?._id);
  };

  const canSubmit = () => {
    if (project?.status !== 'active') return false;
    if (new Date() > new Date(project?.endDate)) return false;
    
    if (project?.type === 'individual') {
      return isUserRegistered() && !mySubmission;
    } else {
      // Must be in a team, team must be registered, and must be leader potentially?
      // Actually any member can submit usually, but let's check if registered
      return isTeamRegistered() && !mySubmission;
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <Navbar />
        <div style={styles.loadingContainer}>
          <div style={styles.spinner}></div>
          <p>Chargement des détails...</p>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div style={styles.container}>
        <Navbar />
        <div style={styles.errorContainer}>
          <p>{error || "Projet non trouvé"}</p>
          <button onClick={() => navigate("/projects")} style={styles.backBtn}>Retour aux projets</button>
        </div>
      </div>
    );
  }

  const isRegistered = project.type === 'individual' ? isUserRegistered() : isTeamRegistered();

  return (
    <div style={styles.container}>
      <Navbar />
      <main style={styles.main}>
        {/* Project Header */}
        <div style={styles.projectHeader}>
          <button onClick={() => navigate("/projects")} style={styles.backLink}>
            ← Retour aux projets
          </button>
          
          <div style={styles.headerTitleRow}>
            <h1 style={styles.title}>{project.title}</h1>
            <div style={styles.badges}>
              <span style={{
                ...styles.typeBadge,
                background: project.type === "team" ? "#e0e7ff" : "#fef3c7",
                color: project.type === "team" ? "#3730a3" : "#92400e"
              }}>
                {project.type === "team" ? "Projet en équipe" : "Projet individuel"}
              </span>
              <span style={{
                ...styles.statusBadge,
                background: project.status === 'active' ? '#dcfce7' : '#fee2e2',
                color: project.status === 'active' ? '#166534' : '#991b1b'
              }}>
                {project.status.toUpperCase()}
              </span>
            </div>
          </div>

          <div style={styles.headerMeta}>
            <div style={styles.metaItem}>
              <strong>Début:</strong> {formatDate(project.startDate)}
            </div>
            <div style={styles.metaItem}>
              <strong>Fin:</strong> {formatDate(project.endDate)}
            </div>
            <div style={styles.metaItem}>
              <strong>Participants:</strong> {project.participants?.length || 0}
            </div>
          </div>
        </div>

        <div style={styles.contentGrid}>
          {/* Left Column: Info */}
          <div style={styles.leftCol}>
            <div style={styles.card}>
              <h2 style={styles.cardSectionTitle}>Description</h2>
              <p style={styles.description}>{project.description}</p>

              {/* AI Summary Section */}
              <div style={styles.aiSummaryContainer}>
                {!aiSummary ? (
                  <button 
                    onClick={fetchAiSummary} 
                    style={styles.aiSummaryBtn}
                    disabled={loadingSummary}
                  >
                    {loadingSummary ? "Analyse IA en cours..." : "Générer un résumé intelligent"}
                  </button>
                ) : (
                  <div style={styles.aiSummaryBox}>
                    <h3 style={styles.aiSummaryTitle}>Résumé Intelligent</h3>
                    <p style={styles.aiSummaryText}>{aiSummary.summary}</p>
                    
                    <div style={styles.aiSummaryFeatures}>
                      <div style={styles.aiFeatureItem}>
                        <strong>Difficulté:</strong> {aiSummary.difficulty}
                      </div>
                      <div style={styles.aiFeatureItem}>
                        <strong>Compétences:</strong> {aiSummary.requiredSkills?.join(', ')}
                      </div>
                    </div>

                    <div style={styles.aiKeyPoints}>
                      <strong>Points clés:</strong>
                      <ul>
                        {aiSummary.keyPoints?.map((p, i) => (
                          <li key={i}>{p}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
              
              {project.successCriteria && (
                <>
                  <h2 style={styles.cardSectionTitle}>Critères de succès</h2>
                  <div style={styles.criteria}>{project.successCriteria}</div>
                </>
              )}

              {project.tags?.length > 0 && (
                <div style={styles.tagsRow}>
                  {project.tags.map((tag, i) => (
                    <span key={i} style={styles.tag}>{tag}</span>
                  ))}
                </div>
              )}
            </div>

            <div style={styles.card}>
              <h2 style={styles.cardSectionTitle}>Points à gagner</h2>
              <div style={styles.pointsGrid}>
                <div style={styles.pointCard}>
                  <div style={styles.pointRank}>1er Place</div>
                  <div style={styles.pointValue}>{project.firstPlacePoints} pts</div>
                </div>
                <div style={styles.pointCard}>
                  <div style={styles.pointRank}>2e Place</div>
                  <div style={styles.pointValue}>{project.secondPlacePoints} pts</div>
                </div>
                <div style={styles.pointCard}>
                  <div style={styles.pointRank}>3e Place</div>
                  <div style={styles.pointValue}>{project.thirdPlacePoints} pts</div>
                </div>
                <div style={styles.pointCard}>
                  <div style={styles.pointRank}>Participation</div>
                  <div style={styles.pointValue}>{project.otherParticipantsPoints} pts</div>
                </div>
              </div>
            </div>

            {/* Participants Section */}
            <div style={styles.card}>
              <h2 style={styles.cardSectionTitle}>
                {project.type === 'team' ? "Équipes inscrites" : "Participants inscrits"} ({participants?.totalParticipants || 0})
              </h2>
              <div style={styles.participantsList}>
                {project.type === 'team' ? (
                  participants?.teams?.length > 0 ? (
                    participants.teams.map(t => (
                      <div key={t._id} style={styles.participantItem}>
                        <div style={styles.participantIcon}>T</div>
                        <div style={styles.participantInfo}>
                          <div style={styles.participantName}>{t.name}</div>
                          <div style={styles.participantSub}>{t.members?.length} membres</div>
                        </div>
                        <div style={styles.participantPoints}>{t.points} pts</div>
                      </div>
                    ))
                  ) : <p style={styles.emptyText}>Aucune équipe inscrite pour le moment.</p>
                ) : (
                  participants?.individuals?.length > 0 ? (
                    participants.individuals.map(u => (
                      <div key={u._id} style={styles.participantItem}>
                        <div style={styles.participantIcon}>U</div>
                        <div style={styles.participantInfo}>
                          <div style={styles.participantName}>{u.firstName} {u.lastName}</div>
                          <div style={styles.participantSub}>@{u.userName}</div>
                        </div>
                        <div style={styles.participantPoints}>{u.points} pts</div>
                      </div>
                    ))
                  ) : <p style={styles.emptyText}>Aucun participant inscrit pour le moment.</p>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Actions / Submission */}
          <div style={styles.rightCol}>
            <div style={styles.stickyCard}>
              {!isRegistered ? (
                <div style={styles.actionBox}>
                  <h3 style={styles.actionTitle}>Envie de participer ?</h3>
                  <p style={styles.actionText}>
                    Inscrivez-vous dès maintenant pour soumettre votre projet et gagner des points.
                  </p>
                  <button 
                    onClick={handleRegister} 
                    style={styles.primaryBtn}
                    disabled={project.status !== 'active'}
                  >
                    S'inscrire au projet
                  </button>
                  {project.type === 'team' && !profile?.team && (
                    <p style={styles.hintText}>Vous devez faire partie d'une équipe pour vous inscrire.</p>
                  )}
                </div>
              ) : (
                <div style={styles.actionBox}>
                  <h3 style={styles.actionTitle}>Votre Participation</h3>
                  <div style={styles.registeredStatus}>
                    <span style={styles.checkIcon}>✓</span> Inscrit
                  </div>

                  {mySubmission ? (
                    <div style={styles.submissionInfo}>
                      <h4 style={styles.subTitle}>Votre soumission</h4>
                      <div style={styles.subStatus}>
                        Status: <span style={{
                          ...styles.statusText,
                          color: mySubmission.status === 'approved' ? '#166534' : 
                                 mySubmission.status === 'rejected' ? '#991b1b' : '#1e293b'
                        }}>
                          {mySubmission.status === 'pending' ? 'En attente' : 
                           mySubmission.status === 'approved' ? 'Approuvée' : 'Refusée'}
                        </span>
                      </div>
                      <a href={mySubmission.githubLink} target="_blank" rel="noopener noreferrer" style={styles.githubLinkDisplay}>
                        Lien GitHub
                      </a>
                      {mySubmission.feedback && (
                        <div style={styles.feedbackBox}>
                          <strong>Feedback:</strong> {mySubmission.feedback}
                        </div>
                      )}
                      {mySubmission.ranking && (
                        <div style={styles.rankingBox}>
                          Classement: #{mySubmission.ranking}
                        </div>
                      )}
                    </div>
                  ) : (
                    <>
                      {canSubmit() ? (
                        <>
                          <button 
                            onClick={() => setShowSubmissionForm(!showSubmissionForm)} 
                            style={styles.primaryBtn}
                          >
                            {showSubmissionForm ? "Annuler" : "Soumettre mon projet"}
                          </button>

                          {showSubmissionForm && (
                            <form onSubmit={handleSubmission} style={styles.submissionForm}>
                              <div style={styles.formGroup}>
                                <label style={styles.label}>Lien GitHub</label>
                                <input 
                                  type="url" 
                                  value={githubLink}
                                  onChange={(e) => setGithubLink(e.target.value)}
                                  placeholder="https://github.com/votre-compte/votre-projet"
                                  style={styles.input}
                                  required
                                />
                              </div>
                              <button 
                                type="submit" 
                                style={styles.submitBtn}
                                disabled={isSubmitting}
                              >
                                {isSubmitting ? "Envoi en cours..." : "Valider la soumission"}
                              </button>
                            </form>
                          )}
                        </>
                      ) : (
                        <p style={styles.closedText}>
                          Les soumissions sont fermées pour ce projet.
                        </p>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
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
    marginBottom: "16px",
  },
  main: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "32px 24px",
  },
  projectHeader: {
    background: "#fff",
    borderRadius: "16px",
    padding: "32px",
    marginBottom: "24px",
    border: "1px solid #e2e8f0",
  },
  backLink: {
    background: "none",
    border: "none",
    color: "#6366f1",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    padding: 0,
    marginBottom: "20px",
  },
  headerTitleRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px",
    flexWrap: "wrap",
    gap: "16px",
  },
  title: {
    fontSize: "32px",
    fontWeight: "bold",
    color: "#1e293b",
    margin: 0,
  },
  badges: {
    display: "flex",
    gap: "10px",
  },
  typeBadge: {
    padding: "6px 14px",
    borderRadius: "20px",
    fontSize: "13px",
    fontWeight: "600",
  },
  statusBadge: {
    padding: "6px 14px",
    borderRadius: "20px",
    fontSize: "13px",
    fontWeight: "600",
  },
  headerMeta: {
    display: "flex",
    gap: "24px",
    color: "#64748b",
    fontSize: "14px",
  },
  metaItem: {
    display: "flex",
    gap: "6px",
  },
  contentGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 340px",
    gap: "24px",
  },
  card: {
    background: "#fff",
    borderRadius: "16px",
    padding: "24px",
    marginBottom: "24px",
    border: "1px solid #e2e8f0",
  },
  cardSectionTitle: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: "16px",
    marginTop: 0,
    borderBottom: "1px solid #f1f5f9",
    paddingBottom: "8px",
  },
  description: {
    fontSize: "16px",
    color: "#475569",
    lineHeight: "1.6",
    whiteSpace: "pre-wrap",
    marginBottom: "24px",
  },
  criteria: {
    fontSize: "15px",
    color: "#475569",
    lineHeight: "1.6",
    whiteSpace: "pre-wrap",
    background: "#f8fafc",
    padding: "16px",
    borderRadius: "8px",
    marginBottom: "24px",
  },
  tagsRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
  },
  tag: {
    padding: "4px 12px",
    background: "#f1f5f9",
    color: "#475569",
    borderRadius: "6px",
    fontSize: "13px",
  },
  pointsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
    gap: "12px",
  },
  pointCard: {
    background: "#f8fafc",
    padding: "16px",
    borderRadius: "12px",
    textAlign: "center",
    border: "1px solid #e2e8f0",
  },
  pointRank: {
    fontSize: "12px",
    color: "#64748b",
    textTransform: "uppercase",
    fontWeight: "600",
    marginBottom: "4px",
  },
  pointValue: {
    fontSize: "18px",
    fontWeight: "bold",
    color: "#1e293b",
  },
  participantsList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  participantItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px",
    borderRadius: "10px",
    border: "1px solid #f1f5f9",
    transition: "all 0.2s ease",
  },
  participantIcon: {
    width: "40px",
    height: "40px",
    background: "#6366f1",
    color: "#fff",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "bold",
    fontSize: "14px",
  },
  participantInfo: {
    flex: 1,
  },
  participantName: {
    fontWeight: "600",
    color: "#1e293b",
    fontSize: "14px",
  },
  participantSub: {
    fontSize: "12px",
    color: "#64748b",
  },
  participantPoints: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#6366f1",
  },
  stickyCard: {
    position: "sticky",
    top: "100px",
  },
  actionBox: {
    background: "#fff",
    borderRadius: "16px",
    padding: "24px",
    border: "1px solid #e2e8f0",
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
  },
  actionTitle: {
    fontSize: "18px",
    fontWeight: "Bold",
    marginBottom: "12px",
    marginTop: 0,
  },
  actionText: {
    fontSize: "14px",
    color: "#64748b",
    marginBottom: "20px",
    lineHeight: "1.5",
  },
  primaryBtn: {
    width: "100%",
    padding: "14px",
    background: "#6366f1",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    fontWeight: "600",
    cursor: "pointer",
    fontSize: "15px",
    transition: "background 0.2s",
  },
  hintText: {
    fontSize: "12px",
    color: "#ef4444",
    marginTop: "10px",
    textAlign: "center",
  },
  registeredStatus: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    color: "#166534",
    fontWeight: "600",
    marginBottom: "20px",
    fontSize: "15px",
  },
  checkIcon: {
    background: "#dcfce7",
    width: "20px",
    height: "20px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "12px",
  },
  submissionInfo: {
    marginTop: "20px",
    paddingTop: "20px",
    borderTop: "1px solid #f1f5f9",
  },
  subTitle: {
    fontSize: "16px",
    fontWeight: "600",
    marginBottom: "12px",
    marginTop: 0,
  },
  subStatus: {
    fontSize: "14px",
    marginBottom: "12px",
  },
  statusText: {
    fontWeight: "600",
  },
  githubLinkDisplay: {
    display: "block",
    color: "#6366f1",
    textDecoration: "none",
    fontSize: "14px",
    fontWeight: "500",
    padding: "10px",
    background: "#f8fafc",
    borderRadius: "8px",
    textAlign: "center",
    border: "1px solid #e2e8f0",
  },
  feedbackBox: {
    marginTop: "16px",
    padding: "12px",
    background: "#fff7ed",
    border: "1px solid #ffedd5",
    borderRadius: "8px",
    fontSize: "13px",
    color: "#9a3412",
  },
  rankingBox: {
    marginTop: "12px",
    padding: "8px 12px",
    background: "#fef3c7",
    color: "#92400e",
    borderRadius: "20px",
    display: "inline-block",
    fontSize: "13px",
    fontWeight: "bold",
  },
  submissionForm: {
    marginTop: "20px",
    padding: "16px",
    background: "#f8fafc",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
  },
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
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #e2e8f0",
    fontSize: "14px",
    boxSizing: "border-box",
  },
  submitBtn: {
    width: "100%",
    padding: "12px",
    background: "#1e293b",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontWeight: "500",
    cursor: "pointer",
  },
  closedText: {
    fontSize: "14px",
    color: "#ef4444",
    fontStyle: "italic",
    textAlign: "center",
  },
  emptyText: {
    fontSize: "14px",
    color: "#94a3b8",
    textAlign: "center",
    padding: "20px",
  },
  errorContainer: {
    textAlign: "center",
    padding: "60px",
  },
  backBtn: {
    marginTop: "20px",
    padding: "12px 24px",
    background: "#6366f1",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },
  aiSummaryContainer: {
    marginBottom: "24px",
    padding: "16px",
    background: "#fdfcfe",
    borderRadius: "12px",
    border: "1px dashed #e0e7ff",
  },
  aiSummaryBtn: {
    width: "100%",
    padding: "12px",
    background: "linear-gradient(135deg, #e0e7ff 0%, #fae8ff 100%)",
    color: "#4338ca",
    border: "none",
    borderRadius: "10px",
    fontWeight: "700",
    fontSize: "14px",
    cursor: "pointer",
    transition: "transform 0.2s",
  },
  aiSummaryBox: {
    animation: "fadeIn 0.5s ease-out",
  },
  aiSummaryTitle: {
    fontSize: "15px",
    fontWeight: "800",
    color: "#4338ca",
    margin: "0 0 12px 0",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  aiSummaryText: {
    fontSize: "14px",
    lineHeight: "1.6",
    color: "#475569",
    margin: "0 0 16px 0",
    fontStyle: "italic",
  },
  aiSummaryFeatures: {
    display: "flex",
    gap: "16px",
    marginBottom: "16px",
    flexWrap: "wrap",
  },
  aiFeatureItem: {
    fontSize: "12px",
    color: "#4338ca",
    background: "#eef2ff",
    padding: "4px 10px",
    borderRadius: "6px",
    fontWeight: "600",
  },
  aiKeyPoints: {
    fontSize: "13px",
    color: "#475569",
  },
};

export default ProjectDetails;
