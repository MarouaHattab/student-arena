import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { projectAPI } from "../api/projectApi";
import { userAPI } from "../api/userApi";
import Navbar from "../components/Navbar";

const Projects = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [projects, setProjects] = useState([]);
  const [myProjects, setMyProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [filterType, setFilterType] = useState("");
  const [filterStatus, setFilterStatus] = useState("active");
  const [registering, setRegistering] = useState(null);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [projectsData, myProjectsData, profileData] = await Promise.all([
        projectAPI.getProjects({ status: "active" }),
        projectAPI.getMyProjects(),
        userAPI.getProfile()
      ]);
      setProjects(projectsData);
      setMyProjects(myProjectsData.projects || []);
      setProfile(profileData);
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (projectId) => {
    try {
      setRegistering(projectId);
      await projectAPI.registerToProject(projectId);
      await fetchData();
      alert("Inscription réussie !");
    } catch (err) {
      alert(err.response?.data?.message || "Erreur lors de l'inscription");
    } finally {
      setRegistering(null);
    }
  };

  const isRegistered = (projectId) => {
    return myProjects.some(p => p._id === projectId);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
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

  const filteredProjects = projects.filter(p => {
    if (filterType && p.type !== filterType) return false;
    if (filterStatus && p.status !== filterStatus) return false;
    return true;
  });

  if (loading) {
    return (
      <div style={styles.container}>
        <Navbar />
        <div style={styles.loadingContainer}>
          <div style={styles.spinner}></div>
          <p style={styles.loadingText}>Chargement des projets...</p>
        </div>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <Navbar />
      <main style={styles.main}>
        {/* Header */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Projets</h1>
            <p style={styles.subtitle}>Découvrez et participez aux compétitions</p>
          </div>
          {profile?.role === "admin" && (
            <button onClick={() => navigate("/admin/projects")} style={styles.adminBtn}>
              Gérer les projets
            </button>
          )}
        </div>

        {/* Tabs */}
        <div style={styles.tabs}>
          <button
            onClick={() => setActiveTab("all")}
            style={{ ...styles.tab, ...(activeTab === "all" ? styles.tabActive : {}) }}
          >
            Tous les projets
          </button>
          <button
            onClick={() => setActiveTab("my")}
            style={{ ...styles.tab, ...(activeTab === "my" ? styles.tabActive : {}) }}
          >
            Mes projets ({myProjects.length})
          </button>
        </div>

        {activeTab === "all" && (
          <>
            {/* Filters */}
            <div style={styles.filters}>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                style={styles.select}
              >
                <option value="">Tous les types</option>
                <option value="individual">Individuel</option>
                <option value="team">Équipe</option>
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                style={styles.select}
              >
                <option value="">Tous les statuts</option>
                <option value="active">Actif</option>
                <option value="completed">Terminé</option>
              </select>
            </div>

            {/* Projects Grid */}
            <div style={styles.grid}>
              {filteredProjects.length === 0 ? (
                <div style={styles.emptyState}>
                  <p>Aucun projet trouvé</p>
                </div>
              ) : (
                filteredProjects.map((project) => (
                  <div key={project._id} style={styles.card}>
                    <div style={styles.cardHeader}>
                      <span style={{
                        ...styles.typeBadge,
                        background: project.type === "team" ? "#e0e7ff" : "#fef3c7",
                        color: project.type === "team" ? "#3730a3" : "#92400e"
                      }}>
                        {project.type === "team" ? "Équipe" : "Individuel"}
                      </span>
                      <span style={{
                        ...styles.statusBadge,
                        ...getStatusColor(project.status)
                      }}>
                        {project.status}
                      </span>
                    </div>
                    <h3 style={styles.cardTitle}>{project.title}</h3>
                    <p style={styles.cardDescription}>
                      {project.description?.substring(0, 150)}
                      {project.description?.length > 150 ? "..." : ""}
                    </p>
                    {project.tags?.length > 0 && (
                      <div style={styles.tags}>
                        {project.tags.slice(0, 4).map((tag, i) => (
                          <span key={i} style={styles.tag}>{tag}</span>
                        ))}
                        {project.tags.length > 4 && (
                          <span style={styles.tagMore}>+{project.tags.length - 4}</span>
                        )}
                      </div>
                    )}
                    <div style={styles.cardMeta}>
                      <span>Date limite: {formatDate(project.endDate)}</span>
                      <span>{project.participants?.length || 0} participants</span>
                    </div>
                    <div style={styles.cardPoints}>
                      <span>1er: {project.firstPlacePoints}pts</span>
                      <span>2e: {project.secondPlacePoints}pts</span>
                      <span>3e: {project.thirdPlacePoints}pts</span>
                    </div>
                    <div style={styles.cardActions}>
                      <button
                        onClick={() => navigate(`/projects/${project._id}`)}
                        style={styles.viewBtn}
                      >
                        Voir détails
                      </button>
                      {isRegistered(project._id) ? (
                        <span style={styles.registeredBadge}>Inscrit</span>
                      ) : (
                        <button
                          onClick={() => handleRegister(project._id)}
                          style={styles.registerBtn}
                          disabled={registering === project._id || project.status !== "active"}
                        >
                          {registering === project._id ? "..." : "S'inscrire"}
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {activeTab === "my" && (
          <div style={styles.grid}>
            {myProjects.length === 0 ? (
              <div style={styles.emptyState}>
                <p>Vous n'êtes inscrit à aucun projet</p>
                <button onClick={() => setActiveTab("all")} style={styles.primaryBtn}>
                  Découvrir les projets
                </button>
              </div>
            ) : (
              myProjects.map((project) => (
                <div key={project._id} style={styles.card}>
                  <div style={styles.cardHeader}>
                    <span style={{
                      ...styles.typeBadge,
                      background: project.type === "team" ? "#e0e7ff" : "#fef3c7",
                      color: project.type === "team" ? "#3730a3" : "#92400e"
                    }}>
                      {project.type === "team" ? "Équipe" : "Individuel"}
                    </span>
                    <span style={{
                      ...styles.statusBadge,
                      ...getStatusColor(project.status)
                    }}>
                      {project.status}
                    </span>
                  </div>
                  <h3 style={styles.cardTitle}>{project.title}</h3>
                  <p style={styles.cardDescription}>
                    {project.description?.substring(0, 150)}
                    {project.description?.length > 150 ? "..." : ""}
                  </p>
                  <div style={styles.cardMeta}>
                    <span>Date limite: {formatDate(project.endDate)}</span>
                  </div>
                  <div style={styles.cardActions}>
                    <button
                      onClick={() => navigate(`/projects/${project._id}`)}
                      style={styles.viewBtn}
                    >
                      Voir détails
                    </button>
                    <span style={styles.registeredBadge}>Inscrit</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>
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
  adminBtn: {
    padding: "12px 24px",
    background: "#1e293b",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
  },
  tabs: {
    display: "flex",
    gap: "8px",
    marginBottom: "24px",
    borderBottom: "1px solid #e2e8f0",
    paddingBottom: "0",
  },
  tab: {
    padding: "12px 20px",
    background: "transparent",
    color: "#64748b",
    border: "none",
    borderBottom: "2px solid transparent",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
    marginBottom: "-1px",
  },
  tabActive: {
    color: "#6366f1",
    borderBottom: "2px solid #6366f1",
  },
  filters: {
    display: "flex",
    gap: "12px",
    marginBottom: "24px",
  },
  select: {
    padding: "10px 16px",
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    color: "#1e293b",
    fontSize: "14px",
    cursor: "pointer",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
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
    marginBottom: "12px",
  },
  typeBadge: {
    padding: "4px 10px",
    borderRadius: "12px",
    fontSize: "12px",
    fontWeight: "500",
  },
  statusBadge: {
    padding: "4px 10px",
    borderRadius: "12px",
    fontSize: "12px",
    fontWeight: "500",
  },
  cardTitle: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#1e293b",
    margin: "0 0 8px 0",
  },
  cardDescription: {
    fontSize: "14px",
    color: "#64748b",
    lineHeight: "1.5",
    margin: "0 0 12px 0",
  },
  tags: {
    display: "flex",
    flexWrap: "wrap",
    gap: "6px",
    marginBottom: "12px",
  },
  tag: {
    padding: "4px 10px",
    background: "#f1f5f9",
    color: "#475569",
    borderRadius: "6px",
    fontSize: "12px",
  },
  tagMore: {
    padding: "4px 10px",
    background: "#e0e7ff",
    color: "#3730a3",
    borderRadius: "6px",
    fontSize: "12px",
  },
  cardMeta: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "13px",
    color: "#94a3b8",
    marginBottom: "12px",
  },
  cardPoints: {
    display: "flex",
    gap: "12px",
    fontSize: "12px",
    color: "#64748b",
    marginBottom: "16px",
    padding: "10px",
    background: "#f8fafc",
    borderRadius: "8px",
  },
  cardActions: {
    display: "flex",
    gap: "10px",
  },
  viewBtn: {
    flex: 1,
    padding: "10px",
    background: "#f1f5f9",
    color: "#475569",
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
  },
  registerBtn: {
    flex: 1,
    padding: "10px",
    background: "#6366f1",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
  },
  registeredBadge: {
    flex: 1,
    padding: "10px",
    background: "#dcfce7",
    color: "#166534",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "500",
    textAlign: "center",
  },
  emptyState: {
    gridColumn: "1 / -1",
    textAlign: "center",
    padding: "60px 20px",
    background: "#fff",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    color: "#64748b",
  },
  primaryBtn: {
    marginTop: "16px",
    padding: "12px 24px",
    background: "#6366f1",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
  },
};

export default Projects;
