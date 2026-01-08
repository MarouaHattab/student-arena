import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axiosConfig";
import Navbar from "../components/Navbar";

const Projects = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [projects, setProjects] = useState([]);
  const [myProjects, setMyProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [filterType, setFilterType] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [registering, setRegistering] = useState(null);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Récupérer tous les projets visibles (actifs et terminés) pour permettre le filtrage
      const [projectsRes, myProjectsRes, profileRes] = await Promise.all([
        api.get("/projects"), // Récupérer tous les projets visibles sans filtre de statut
        api.get("/projects/my-projects"),
        api.get("/users/profile"),
      ]);
      setProjects(projectsRes.data);
      setMyProjects(myProjectsRes.data.projects || []);
      setProfile(profileRes.data);
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (projectId) => {
    try {
      setRegistering(projectId);
      await api.post(`/projects/${projectId}/register`);
      await fetchData();
      alert("Inscription réussie !");
    } catch (err) {
      alert(err.response?.data?.message || "Erreur lors de l'inscription");
    } finally {
      setRegistering(null);
    }
  };

  const isRegistered = (project) => {
    // Vérification via myProjects (inscriptions directes ou synchronisées)
    if (myProjects.some((p) => p._id === project._id)) return true;

    // Vérification de secours pour les projets d'équipe
    if (project.type === "team" && profile?.team) {
      const teamId = profile.team._id || profile.team;
      return project.participants?.some(
        (p) => (p._id || p) === teamId || p === teamId
      );
    }

    return false;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
    });
  };

  const filteredProjects = projects.filter((p) => {
    if (filterType && p.type !== filterType) return false;
    if (filterStatus && p.status !== filterStatus) return false;
    return true;
  });

  if (loading)
    return <div className="loading-screen">Chargement de l'Arena...</div>;

  return (
    <div className="projects-page">
      <Navbar />
      <main className="page-container">
        <header className="section-header">
          <div>
            <h1 className="section-title">Catalogue des Projets</h1>
            <p className="subtitle">
              Relevez les défis et gagnez des points pour votre équipe.
            </p>
          </div>
          <div className="header-actions">
            <div className="tab-pill-container">
              <button
                onClick={() => setActiveTab("all")}
                className={activeTab === "all" ? "active" : ""}
              >
                Exploration
              </button>
              <button
                onClick={() => setActiveTab("my")}
                className={activeTab === "my" ? "active" : ""}
              >
                Mes Inscriptions
              </button>
            </div>
          </div>
        </header>

        {activeTab === "all" && (
          <div className="filter-shelf fade-in">
            <div className="filter-group">
              <label>Type de participation</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="">Tous les types</option>
                <option value="individual">Solo</option>
                <option value="team">Team</option>
              </select>
            </div>
            <div className="filter-group">
              <label>État du projet</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="active">En cours</option>
                <option value="completed">Terminé</option>
              </select>
            </div>
          </div>
        )}

        <div className="projects-grid fade-in">
          {(activeTab === "all" ? filteredProjects : myProjects).map(
            (project) => (
              <div
                key={project._id}
                className="project-card card premium-shadow"
              >
                <div className="card-top">
                  <div
                    style={{
                      display: "flex",
                      gap: "8px",
                      alignItems: "center",
                    }}
                  >
                    <div className={`type-indicator ${project.type}`}>
                      {project.type === "team" ? "TEAM" : "SOLO"}
                    </div>
                    {project.status === "completed" && (
                      <div className="status-badge completed">TERMINÉ</div>
                    )}
                    {project.status === "active" && (
                      <div className="status-badge active">EN COURS</div>
                    )}
                  </div>
                  <div className="points-pool">
                    {project.firstPlacePoints} pts
                  </div>
                </div>

                <h3 className="project-title">{project.title}</h3>
                <p className="project-desc">{project.description}</p>

                <div className="tag-cloud">
                  {project.tags?.map((tag, i) => (
                    <span key={i} className="project-tag">
                      #{tag}
                    </span>
                  ))}
                </div>

                <div className="project-footer">
                  <div className="meta-info">
                    <div className="meta-item">
                      Finit le {formatDate(project.endDate)}
                    </div>
                    <div className="meta-item">
                      {project.participants?.length || 0} inscrits
                    </div>
                  </div>

                  <div className="btn-row">
                    <button
                      onClick={() => navigate(`/projects/${project._id}`)}
                      className="btn-outline"
                    >
                      Explorer
                    </button>
                    {isRegistered(project) ? (
                      <div className="registered-tag">✓ Inscrit</div>
                    ) : (
                      <button
                        onClick={() => handleRegister(project._id)}
                        className="btn-primary"
                        disabled={
                          registering === project._id ||
                          project.status !== "active"
                        }
                      >
                        {registering === project._id ? "..." : "Participer"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          )}

          {(activeTab === "all" ? filteredProjects : myProjects).length ===
            0 && (
            <div className="empty-projects">
              <div className="empty-icon"></div>
              <h3>Aucun projet ici</h3>
              <p>Repassez plus tard pour de nouveaux défis !</p>
            </div>
          )}
        </div>
      </main>

      <style>{`
        .projects-page { min-height: 100vh; background: #f8fafc; }
        .subtitle { color: #64748b; margin-top: 4px; }
        
        .tab-pill-container { display: flex; gap: 4px; background: #f1f5f9; padding: 4px; border-radius: 14px; }
        .tab-pill-container button { padding: 8px 16px; border: none; background: transparent; border-radius: 10px; cursor: pointer; color: #64748b; font-weight: 700; font-size: 14px; transition: all 0.2s; }
        .tab-pill-container button.active { background: #fff; color: #6366f1; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
 
        .filter-shelf { display: flex; gap: 24px; margin-bottom: 32px; background: #fff; padding: 20px; border-radius: 20px; border: 1px solid #e2e8f0; }
        .filter-group { display: flex; flex-direction: column; gap: 6px; }
        .filter-group label { font-size: 12px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; }
        .filter-group select { padding: 10px; border-radius: 10px; border: 1px solid #e2e8f0; background: #f8fafc; font-weight: 600; outline: none; cursor: pointer; }
 
        .projects-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 24px; }
        
        .project-card { display: flex; flex-direction: column; height: 100%; }
        .card-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
        
        .type-indicator { padding: 4px 10px; border-radius: 8px; font-size: 11px; font-weight: 800; letter-spacing: 0.5px; }
        .type-indicator.individual { background: #fff7ed; color: #c2410c; border: 1px solid #ffedd5; }
        .type-indicator.team { background: #eef2ff; color: #4338ca; border: 1px solid #e0e7ff; }
        
        .status-badge { padding: 4px 10px; border-radius: 8px; font-size: 10px; font-weight: 800; letter-spacing: 0.5px; }
        .status-badge.completed { background: #dbeafe; color: #1e40af; border: 1px solid #bfdbfe; }
        .status-badge.active { background: #dcfce7; color: #166534; border: 1px solid #bbf7d0; }
        
        .points-pool { font-weight: 800; color: #10b981; font-size: 14px; }
        
        .project-title { font-size: 20px; font-weight: 800; color: #1e293b; margin-bottom: 8px; line-height: 1.3; }
        .project-desc { font-size: 14px; color: #64748b; line-height: 1.6; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; margin-bottom: 20px; flex: 1; }
        
        .tag-cloud { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 24px; }
        .project-tag { padding: 4px 10px; background: #f1f5f9; color: #64748b; border-radius: 6px; font-size: 12px; font-weight: 600; }
        
        .project-footer { border-top: 1px solid #f1f5f9; padding-top: 20px; }
        .meta-info { display: flex; justify-content: space-between; margin-bottom: 20px; }
        .meta-item { font-size: 12px; font-weight: 600; color: #94a3b8; display: flex; align-items: center; gap: 4px; }
        
        .btn-row { display: flex; gap: 12px; }
        .btn-outline { flex: 1; padding: 12px; border-radius: 12px; border: 1px solid #e2e8f0; background: #fff; color: #475569; font-weight: 700; cursor: pointer; transition: all 0.2s; }
        .btn-outline:hover { background: #f8fafc; border-color: #cbd5e1; }
        
        .btn-primary { flex: 1.5; height: 46px; }
        
        .registered-tag { flex: 1.5; display: flex; align-items: center; justify-content: center; background: #f0fdf4; color: #16a34a; font-weight: 800; border-radius: 12px; font-size: 14px; }
 
        .empty-projects { grid-column: 1 / -1; padding: 100px 0; text-align: center; background: #fff; border-radius: 24px; border: 2px dashed #e2e8f0; }
        .empty-icon { font-size: 48px; margin-bottom: 16px; opacity: 0.5; }
        
        .loading-screen { height: 100vh; display: flex; align-items: center; justify-content: center; font-weight: 800; color: #6366f1; font-size: 1.25rem; background: #fff; }
      `}</style>
    </div>
  );
};

export default Projects;
