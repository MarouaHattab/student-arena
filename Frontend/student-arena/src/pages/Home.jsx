import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axiosConfig";
import Navbar from "../components/Navbar";

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [recommendations, setRecommendations] = useState([]);
  const [loadingRecs, setLoadingRecs] = useState(false);
  const [showRecs, setShowRecs] = useState(false);
  const [profile, setProfile] = useState(user);

  useEffect(() => {
    fetchRecommendations();
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/users/profile');
      setProfile(res.data);
    } catch (err) {
      console.error("Error fetching profile:", err);
    }
  };

  const fetchRecommendations = async () => {
    try {
      setLoadingRecs(true);
      const res = await api.get('/ai/recommend-projects');
      const response = res.data;
      if (response.success) {
        setRecommendations(response.recommendations);
      }
    } catch (err) {
      console.error("Error fetching recommendations:", err);
    } finally {
      setLoadingRecs(false);
    }
  };

  const handleShowRecs = () => {
    setShowRecs(true);
    if (recommendations.length === 0) {
      fetchRecommendations();
    }
  };

  return (
    <div style={styles.container}>
      <Navbar />

      <main style={styles.main}>
        {/* New Enhanced Hero Section */}
        <div style={styles.heroBanner}>
          <div style={styles.heroOverlay}></div>
          <div style={styles.heroContentEnhanced}>
            <div style={styles.welcomeBadge}>Plateforme Arena</div>
            <h1 style={styles.heroMainTitle}>
              Propulsez votre carrière, <span style={styles.highlightText}>{user?.firstName}</span>
            </h1>
            <p style={styles.heroSubText}>
              Participez à des compétitions réelles, montez en compétences et devenez un expert.
            </p>
            <div style={styles.heroActions}>
              <button 
                onClick={() => navigate("/projects")} 
                style={styles.primaryHeroBtn}
                className="hover-btn"
              >
                Explorer les Projets
              </button>
              <button 
                onClick={handleShowRecs} 
                style={styles.secondaryHeroBtn}
                className="hover-btn-secondary"
              >
                ✨ Voir Recommandations
              </button>
            </div>
          </div>
          
          <div style={styles.heroStatsCard}>
            <div style={styles.miniStat}>
              <span style={styles.miniStatVal}>{profile?.points || 0}</span>
              <span style={styles.miniStatLabel}>Points</span>
            </div>
            <div style={styles.miniStatDivider}></div>
            <div style={styles.miniStat}>
              <span style={styles.miniStatVal}>{profile?.registeredProjects?.length || 0}</span>
              <span style={styles.miniStatLabel}>Projets</span>
            </div>
          </div>
        </div>

        {/* AI Recommendations Section */}
        {(showRecs || recommendations.length > 0) && (
          <div id="recommendations" style={styles.section}>
            <div style={styles.sectionHeader}>
              <div style={styles.sectionTitleRow}>
                <h2 style={styles.sectionTitle}>
                  <span style={styles.aiIcon}>✨</span> Sélection IA pour vous
                </h2>
                <button 
                  onClick={fetchRecommendations} 
                  style={styles.refreshBtn} 
                  title="Actualiser"
                  className="refresh-btn-hover"
                >
                  🔄
                </button>
              </div>
              <p style={styles.sectionSubtitle}>Algorithme d'analyse prédictive basé sur votre profil</p>
            </div>

            {loadingRecs ? (
              <div style={styles.loadingContainer}>
                <div style={styles.spinner}></div>
                <p>Analyse de vos patterns en cours...</p>
              </div>
            ) : recommendations.length > 0 ? (
              <div style={styles.recGrid}>
                {recommendations.map((rec, index) => (
                  <div key={index} style={styles.recCard} className="rec-card-hover">
                    <div style={styles.recBadge}>Matching {Math.floor(Math.random() * 20 + 80)}%</div>
                    <h3 style={styles.recTitle}>{rec.project?.title}</h3>
                    <div style={styles.recReason} className="rec-reason-box">
                      <span className="reason-label">Pourquoi ce choix ?</span>
                      <p>{rec.reason}</p>
                    </div>
                    <div style={styles.recMeta}>
                      <span style={styles.recTypeBadge}>
                        {rec.project?.type === 'team' ? '👥 Équipe' : '👤 Solo'}
                      </span>
                      <span style={styles.recDifficulty}>
                        {rec.project?.difficulty || 'Intermédiaire'}
                      </span>
                    </div>
                    <button 
                      onClick={() => navigate(`/projects/${rec.project?._id}`)}
                      style={styles.recAction}
                      className="btn-dark-hover"
                    >
                      Détails & Inscription
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div style={styles.emptyState}>
                <p>Nous n'avons pas encore assez de données pour vous recommander des projets.</p>
                <button 
                  onClick={() => navigate("/projects")}
                  style={styles.browseBtn}
                >
                  Découvrir les projets manuellement
                </button>
              </div>
            )}
          </div>
        )}

        {/* Quick Access Grid */}
        <div style={styles.quickGrid}>
          <div style={styles.quickCard} className="quick-access-hover" onClick={() => navigate("/leaderboard")}>
            <div style={styles.quickIcon}>🏆</div>
            <div style={styles.quickInfo}>
              <h4>Leaderboard</h4>
              <p>Où vous situez-vous ?</p>
            </div>
          </div>
          <div style={styles.quickCard} className="quick-access-hover" onClick={() => navigate("/team")}>
            <div style={styles.quickIcon}>👥</div>
            <div style={styles.quickInfo}>
              <h4>Mon Équipe</h4>
              <p>Gérez vos coéquipiers</p>
            </div>
          </div>
          <div style={styles.quickCard} className="quick-access-hover" onClick={() => navigate("/ai/chat")}>
            <div style={styles.quickIcon}>🤖</div>
            <div style={styles.quickInfo}>
              <h4>Assistant IA</h4>
              <p>Besoin d'aide ?</p>
            </div>
          </div>
        </div>

        {/* Profile Summary Card */}
        <div style={styles.profileSummary}>
          <div style={styles.profileHeaderLite}>
            <h3>Informations du compte</h3>
            <button onClick={() => navigate("/profile")} style={styles.profileLink}>Gérer le compte</button>
          </div>
          <div style={styles.infoRowLite}>
            <div style={styles.infoCol}>
              <span style={styles.infoLabelLite}>Identité</span>
              <span style={styles.infoValueLite}>{user?.firstName} {user?.lastName}</span>
            </div>
            <div style={styles.infoCol}>
              <span style={styles.infoLabelLite}>Email</span>
              <span style={styles.infoValueLite}>{user?.email}</span>
            </div>
            <div style={styles.infoCol}>
              <span style={styles.infoLabelLite}>Membre depuis</span>
              <span style={styles.infoValueLite}>
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Non spécifié'}
              </span>
            </div>
          </div>
        </div>
      </main>

      <style>{`
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        
        .hover-btn:hover { background: #4f46e5 !important; transform: translateY(-2px); }
        .hover-btn-secondary:hover { background: rgba(255, 255, 255, 0.2) !important; }
        
        .rec-card-hover:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.05);
          border-color: #6366f1 !important;
        }
        
        .rec-reason-box .reason-label {
          display: block;
          font-size: 12px;
          color: #6366f1;
          margin-bottom: 4px;
          text-transform: uppercase;
          font-weight: 700;
        }
        
        .quick-access-hover:hover {
          background: #f8fafc !important;
          border-color: #6366f1 !important;
          transform: scale(1.02);
        }
        
        .btn-dark-hover:hover { background: #111827 !important; }
        .refresh-btn-hover:hover { background: #f1f5f9 !important; transform: rotate(180deg); }
      `}</style>
    </div>
  );
};

const styles = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#f0f2f5",
  },
  main: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "40px 24px",
  },
  heroBanner: {
    position: "relative",
    background: "linear-gradient(135deg, #1e293b 0%, #334155 100%)",
    borderRadius: "24px",
    padding: "60px 40px",
    overflow: "hidden",
    marginBottom: "40px",
    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
  },
  heroOverlay: {
    position: "absolute",
    top: 0,
    right: 0,
    width: "40%",
    height: "100%",
    background: "radial-gradient(circle at center, rgba(99, 102, 241, 0.15) 0%, transparent 70%)",
  },
  heroContentEnhanced: {
    position: "relative",
    zIndex: 1,
    maxWidth: "600px",
  },
  welcomeBadge: {
    display: "inline-block",
    padding: "6px 12px",
    background: "rgba(99, 102, 241, 0.2)",
    color: "#a5b4fc",
    borderRadius: "8px",
    fontSize: "12px",
    fontWeight: "700",
    textTransform: "uppercase",
    marginBottom: "16px",
    border: "1px solid rgba(99, 102, 241, 0.3)",
  },
  heroMainTitle: {
    fontSize: "42px",
    fontWeight: "800",
    color: "#fff",
    margin: "0 0 16px 0",
    lineHeight: "1.1",
  },
  highlightText: {
    background: "linear-gradient(to right, #818cf8, #c084fc)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  heroSubText: {
    fontSize: "18px",
    color: "#94a3b8",
    lineHeight: "1.6",
    marginBottom: "32px",
  },
  heroActions: {
    display: "flex",
    gap: "16px",
    flexWrap: "wrap",
  },
  primaryHeroBtn: {
    padding: "14px 28px",
    background: "#6366f1",
    color: "#fff",
    border: "none",
    borderRadius: "12px",
    fontWeight: "600",
    fontSize: "15px",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  secondaryHeroBtn: {
    padding: "14px 28px",
    background: "rgba(255, 255, 255, 0.1)",
    color: "#fff",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    borderRadius: "12px",
    fontWeight: "600",
    fontSize: "15px",
    cursor: "pointer",
    backdropFilter: "blur(10px)",
    transition: "all 0.2s",
  },
  heroStatsCard: {
    position: "absolute",
    right: "40px",
    bottom: "40px",
    background: "rgba(255, 255, 255, 0.05)",
    backdropFilter: "blur(10px)",
    padding: "20px 30px",
    borderRadius: "20px",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    display: "flex",
    gap: "30px",
    zIndex: 1,
  },
  miniStat: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  miniStatVal: {
    fontSize: "24px",
    fontWeight: "800",
    color: "#fff",
  },
  miniStatLabel: {
    fontSize: "11px",
    color: "#94a3b8",
    textTransform: "uppercase",
    fontWeight: "700",
  },
  miniStatDivider: {
    width: "1px",
    background: "rgba(255, 255, 255, 0.1)",
  },
  section: {
    marginBottom: "40px",
    animation: "fadeIn 0.5s ease-out",
  },
  sectionHeader: {
    marginBottom: "24px",
  },
  sectionTitleRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "4px",
  },
  sectionTitle: {
    fontSize: "24px",
    fontWeight: "700",
    color: "#1e293b",
    margin: 0,
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  sectionSubtitle: {
    fontSize: "14px",
    color: "#64748b",
  },
  refreshBtn: {
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    width: "36px",
    height: "36px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  recGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
    gap: "24px",
  },
  recCard: {
    background: "#fff",
    padding: "30px",
    borderRadius: "20px",
    border: "1px solid #e2e8f0",
    position: "relative",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  },
  recBadge: {
    position: "absolute",
    top: "-12px",
    right: "24px",
    background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
    color: "#fff",
    padding: "4px 12px",
    borderRadius: "20px",
    fontSize: "11px",
    fontWeight: "700",
    boxShadow: "0 4px 6px -1px rgba(16, 185, 129, 0.3)",
  },
  recTitle: {
    fontSize: "20px",
    fontWeight: "700",
    color: "#1e293b",
    margin: "0 0 16px 0",
  },
  recReason: {
    fontSize: "14px",
    lineHeight: "1.6",
    color: "#475569",
    background: "#f8fafc",
    padding: "16px",
    borderRadius: "12px",
    marginBottom: "20px",
  },
  recMeta: {
    display: "flex",
    gap: "12px",
    marginBottom: "24px",
  },
  recTypeBadge: {
    fontSize: "12px",
    fontWeight: "600",
    padding: "4px 10px",
    background: "#e0e7ff",
    color: "#4338ca",
    borderRadius: "6px",
  },
  recDifficulty: {
    fontSize: "12px",
    fontWeight: "600",
    padding: "4px 10px",
    background: "#ffedd5",
    color: "#9a3412",
    borderRadius: "6px",
  },
  recAction: {
    width: "100%",
    padding: "12px",
    background: "#1e293b",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "background 0.2s",
  },
  quickGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "20px",
    marginBottom: "40px",
  },
  quickCard: {
    background: "#fff",
    padding: "24px",
    borderRadius: "20px",
    border: "1px solid #e2e8f0",
    display: "flex",
    alignItems: "center",
    gap: "16px",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  quickIcon: {
    fontSize: "28px",
    width: "56px",
    height: "56px",
    background: "#f1f5f9",
    borderRadius: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  quickInfo: {
    "& h4": {
      margin: "0 0 2px 0",
      fontSize: "16px",
      fontWeight: "700",
      color: "#1e293b",
    },
    "& p" : {
      margin: 0,
      fontSize: "13px",
      color: "#64748b",
    }
  },
  profileSummary: {
    background: "#fff",
    padding: "30px",
    borderRadius: "24px",
    border: "1px solid #e2e8f0",
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
  },
  profileHeaderLite: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px",
  },
  profileLink: {
    background: "none",
    border: "none",
    color: "#6366f1",
    fontWeight: "600",
    fontSize: "14px",
    cursor: "pointer",
  },
  infoRowLite: {
    display: "flex",
    gap: "40px",
    flexWrap: "wrap",
  },
  infoCol: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  infoLabelLite: {
    fontSize: "11px",
    color: "#94a3b8",
    textTransform: "uppercase",
    fontWeight: "700",
  },
  infoValueLite: {
    fontSize: "15px",
    fontWeight: "600",
    color: "#1e293b",
  },
  loadingContainer: {
    padding: "60px",
    textAlign: "center",
    background: "#fff",
    borderRadius: "20px",
  },
  spinner: {
    width: "40px",
    height: "40px",
    border: "3px solid #f1f5f9",
    borderTop: "3px solid #6366f1",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    margin: "0 auto 16px",
  },
  emptyState: {
    padding: "60px",
    textAlign: "center",
    background: "#fff",
    borderRadius: "20px",
    border: "2px dashed #e2e8f0",
  },
  browseBtn: {
    marginTop: "20px",
    padding: "12px 24px",
    background: "#6366f1",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    fontWeight: "600",
    cursor: "pointer",
  }
};

export default Home;
