import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../api/axiosConfig";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      <Navbar />
      <div style={styles.content} className="fade-in">
        <div style={styles.errorBox}>
          <div style={styles.glitchContainer}>
            <h1 style={styles.errorCode}>404</h1>
            <div style={styles.glitchLogo}>Student Arena</div>
          </div>
          
          <h2 style={styles.title}>Oups ! Vous vous êtes égaré.</h2>
          <p style={styles.description}>
            La page que vous recherchez semble avoir été déplacée, supprimée ou n'a jamais existé dans cette arène.
          </p>
          
          <div style={styles.actionButtons}>
            <button onClick={() => navigate(-1)} style={styles.secondaryBtn}>
              Retourner en arrière
            </button>
            <button onClick={() => navigate("/")} style={styles.primaryBtn}>
              Retourner à l'accueil
            </button>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div style={styles.blob1}></div>
      <div style={styles.blob2}></div>

      <style>{`
        @keyframes orbit {
          0% { transform: rotate(0deg) translateX(20px) rotate(0deg); }
          100% { transform: rotate(360deg) translateX(20px) rotate(-360deg); }
        }
      `}</style>
    </div>
  );
};

const styles = {
  container: {
    minHeight: "100vh",
    background: "#f8fafc",
    position: "relative",
    overflow: "hidden",
  },
  content: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "calc(100vh - 72px)",
    padding: "20px",
    position: "relative",
    zIndex: 2,
  },
  errorBox: {
    maxWidth: "500px",
    width: "100%",
    background: "rgba(255, 255, 255, 0.8)",
    backdropFilter: "blur(12px)",
    padding: "60px 40px",
    borderRadius: "32px",
    border: "1px solid rgba(255, 255, 255, 0.5)",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.08)",
    textAlign: "center",
  },
  glitchContainer: {
    marginBottom: "32px",
  },
  errorCode: {
    fontSize: "100px",
    fontWeight: "900",
    background: "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    margin: 0,
    lineHeight: "1",
    letterSpacing: "-4px",
  },
  glitchLogo: {
    fontSize: "14px",
    fontWeight: "800",
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: "4px",
    marginTop: "8px",
  },
  title: {
    fontSize: "24px",
    fontWeight: "800",
    color: "#1e293b",
    marginBottom: "16px",
  },
  description: {
    fontSize: "15px",
    color: "#64748b",
    lineHeight: "1.6",
    marginBottom: "40px",
  },
  actionButtons: {
    display: "flex",
    gap: "12px",
    justifyContent: "center",
    flexWrap: "wrap",
  },
  primaryBtn: {
    padding: "12px 24px",
    background: "#6366f1",
    color: "#fff",
    border: "none",
    borderRadius: "14px",
    fontWeight: "700",
    fontSize: "14px",
    cursor: "pointer",
    boxShadow: "0 10px 15px -3px rgba(99, 102, 241, 0.3)",
    transition: "all 0.2s",
  },
  secondaryBtn: {
    padding: "12px 24px",
    background: "#fff",
    color: "#475569",
    border: "1px solid #e2e8f0",
    borderRadius: "14px",
    fontWeight: "700",
    fontSize: "14px",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  blob1: {
    position: "absolute",
    top: "20%",
    left: "15%",
    width: "300px",
    height: "300px",
    background: "rgba(99, 102, 241, 0.1)",
    borderRadius: "50%",
    filter: "blur(60px)",
    zIndex: 0,
  },
  blob2: {
    position: "absolute",
    bottom: "20%",
    right: "15%",
    width: "350px",
    height: "350px",
    background: "rgba(168, 85, 247, 0.1)",
    borderRadius: "50%",
    filter: "blur(60px)",
    zIndex: 0,
  },
};

export default NotFound;
