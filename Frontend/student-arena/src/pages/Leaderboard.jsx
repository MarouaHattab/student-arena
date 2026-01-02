import { useState, useEffect } from "react";
import api from "../api/axiosConfig";
import Navbar from "../components/Navbar";

const Leaderboard = () => {
  const [activeTab, setActiveTab] = useState("students"); // "students" or "teams"
  const [students, setStudents] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      if (activeTab === "students") {
        const res = await api.get('/users/leaderboard');
        setStudents(res.data);
      } else {
        const res = await api.get('/teams');
        setTeams(res.data);
      }
    } catch (err) {
      setError("Erreur lors du chargement du classement");
    } finally {
      setLoading(false);
    }
  };

  const getRankStyle = (index) => {
    if (index === 0) return { background: "#fef3c7", color: "#92400e", border: "1px solid #fde68a" }; // Gold
    if (index === 1) return { background: "#f1f5f9", color: "#475569", border: "1px solid #e2e8f0" }; // Silver
    if (index === 2) return { background: "#ffedd5", color: "#9a3412", border: "1px solid #fed7aa" }; // Bronze
    return { background: "#fff", color: "#64748b", border: "1px solid #f1f5f9" };
  };

  const getRankEmoji = (index) => {
    if (index === 0) return "🥇";
    if (index === 1) return "🥈";
    if (index === 2) return "🥉";
    return `#${index + 1}`;
  };

  return (
    <div style={styles.container}>
      <Navbar />
      <main style={styles.main}>
        <div style={styles.header}>
          <h1 style={styles.title}>Classement Général</h1>
          <p style={styles.subtitle}>Découvrez les meilleurs contributeurs et équipes de la plateforme.</p>
        </div>

        <div style={styles.tabs}>
          <button 
            onClick={() => setActiveTab("students")}
            style={{
              ...styles.tab,
              ...(activeTab === "students" ? styles.activeTab : {})
            }}
          >
            👤 Étudiants
          </button>
          <button 
            onClick={() => setActiveTab("teams")}
            style={{
              ...styles.tab,
              ...(activeTab === "teams" ? styles.activeTab : {})
            }}
          >
            👥 Équipes
          </button>
        </div>

        {loading ? (
          <div style={styles.loadingContainer}>
            <div style={styles.spinner}></div>
            <p>Calcul des rangs...</p>
          </div>
        ) : error ? (
          <div style={styles.error}>{error}</div>
        ) : (
          <div style={styles.tableContainer}>
            {activeTab === "students" ? (
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Rang</th>
                    <th style={styles.th}>Participant</th>
                    <th style={styles.th}>Points</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student, index) => (
                    <tr key={student._id} style={styles.tr}>
                      <td style={styles.td}>
                        <div style={{...styles.rankBadge, ...getRankStyle(index)}}>
                          {getRankEmoji(index)}
                        </div>
                      </td>
                      <td style={styles.td}>
                        <div style={styles.userInfo}>
                          <div style={styles.userName}>{student.firstName} {student.lastName}</div>
                          <div style={styles.userHandle}>@{student.userName}</div>
                        </div>
                      </td>
                      <td style={styles.td}>
                        <div style={styles.pointsBadge}>{student.points} pts</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Rang</th>
                    <th style={styles.th}>Équipe</th>
                    <th style={styles.th}>Membres</th>
                    <th style={styles.th}>Points</th>
                  </tr>
                </thead>
                <tbody>
                  {teams.map((team, index) => (
                    <tr key={team._id} style={styles.tr}>
                      <td style={styles.td}>
                        <div style={{...styles.rankBadge, ...getRankStyle(index)}}>
                          {getRankEmoji(index)}
                        </div>
                      </td>
                      <td style={styles.td}>
                        <div style={styles.teamInfo}>
                          <div style={styles.teamName}>{team.name}</div>
                          <div style={styles.teamSlogan}>{team.slogan || "L'union fait la force"}</div>
                        </div>
                      </td>
                      <td style={styles.td}>
                        <div style={styles.memberAvatars}>
                          {team.members?.slice(0, 3).map((m, i) => (
                            <div key={i} style={styles.miniAvatar} title={m.userName}>
                              {m.firstName[0]}
                            </div>
                          ))}
                          {team.members?.length > 3 && (
                            <div style={styles.moreMembers}>+{team.members.length - 3}</div>
                          )}
                        </div>
                      </td>
                      <td style={styles.td}>
                        <div style={styles.pointsBadgeTeam}>{team.points || 0} pts</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
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
  main: {
    maxWidth: "1000px",
    margin: "0 auto",
    padding: "40px 24px",
  },
  header: {
    marginBottom: "40px",
    textAlign: "center",
  },
  title: {
    fontSize: "36px",
    fontWeight: "800",
    color: "#1e293b",
    margin: "0 0 10px 0",
    letterSpacing: "-0.025em",
  },
  subtitle: {
    fontSize: "16px",
    color: "#64748b",
    margin: 0,
  },
  tabs: {
    display: "flex",
    gap: "12px",
    background: "#fff",
    padding: "6px",
    borderRadius: "16px",
    maxWidth: "400px",
    margin: "0 auto 32px auto",
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
    border: "1px solid #e2e8f0",
  },
  tab: {
    flex: 1,
    padding: "12px",
    background: "transparent",
    border: "none",
    borderRadius: "12px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
    color: "#64748b",
    transition: "all 0.2s",
  },
  activeTab: {
    background: "#1e293b",
    color: "#fff",
  },
  tableContainer: {
    background: "#fff",
    borderRadius: "24px",
    border: "1px solid #e2e8f0",
    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05)",
    overflow: "hidden",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  th: {
    padding: "20px 24px",
    textAlign: "left",
    background: "#f8fafc",
    color: "#64748b",
    fontSize: "12px",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    borderBottom: "1px solid #f1f5f9",
  },
  tr: {
    borderBottom: "1px solid #f1f5f9",
    transition: "background 0.2s",
  },
  td: {
    padding: "20px 24px",
    fontSize: "14px",
    color: "#1e293b",
  },
  rankBadge: {
    width: "40px",
    height: "40px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "800",
    fontSize: "14px",
  },
  userInfo: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
  },
  userName: {
    fontWeight: "700",
    color: "#1e293b",
  },
  userHandle: {
    fontSize: "12px",
    color: "#94a3b8",
  },
  pointsBadge: {
    padding: "8px 16px",
    background: "#f0fdf4",
    color: "#166534",
    borderRadius: "12px",
    fontWeight: "700",
    fontSize: "14px",
    display: "inline-block",
  },
  pointsBadgeTeam: {
    padding: "8px 16px",
    background: "#eff6ff",
    color: "#1e40af",
    borderRadius: "12px",
    fontWeight: "700",
    fontSize: "14px",
    display: "inline-block",
  },
  teamInfo: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
  },
  teamName: {
    fontWeight: "700",
    color: "#1e293b",
  },
  teamSlogan: {
    fontSize: "12px",
    color: "#94a3b8",
    fontStyle: "italic",
  },
  memberAvatars: {
    display: "flex",
    alignItems: "center",
  },
  miniAvatar: {
    width: "28px",
    height: "28px",
    borderRadius: "50%",
    backgroundColor: "#6366f1",
    color: "white",
    fontSize: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "bold",
    border: "2px solid white",
    marginLeft: "-8px",
  },
  moreMembers: {
    fontSize: "11px",
    color: "#64748b",
    marginLeft: "4px",
    fontWeight: "600",
  },
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "100px 0",
    color: "#64748b",
  },
  spinner: {
    width: "40px",
    height: "40px",
    border: "3px solid #e2e8f0",
    borderTop: "3px solid #1e293b",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    marginBottom: "16px",
  },
  error: {
    textAlign: "center",
    padding: "40px",
    color: "#ef4444",
    background: "#fef2f2",
    borderRadius: "16px",
    border: "1px solid #fee2e2",
  }
};

export default Leaderboard;
