import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header style={styles.header}>
      <div style={styles.headerContent}>
        <h1 style={styles.logo} onClick={() => navigate("/")}>
          Student Arena
        </h1>
        <nav style={styles.nav}>
          <button 
            onClick={() => navigate("/")} 
            style={{
              ...styles.navBtn,
              ...(isActive("/") ? styles.navBtnActive : {})
            }}
          >
            Accueil
          </button>
          <button 
            onClick={() => navigate("/projects")} 
            style={{
              ...styles.navBtn,
              ...(isActive("/projects") || location.pathname.startsWith("/projects") ? styles.navBtnActive : {})
            }}
          >
            Projets
          </button>
          <button 
            onClick={() => navigate("/team")} 
            style={{
              ...styles.navBtn,
              ...(isActive("/team") ? styles.navBtnActive : {})
            }}
          >
            Équipe
          </button>
          <button 
            onClick={() => navigate("/profile")} 
            style={{
              ...styles.navBtn,
              ...(isActive("/profile") ? styles.navBtnActive : {})
            }}
          >
            Profil
          </button>
          <button onClick={handleLogout} style={styles.logoutBtn}>
            Déconnexion
          </button>
        </nav>
      </div>
    </header>
  );
};

const styles = {
  header: {
    background: "#fff",
    borderBottom: "1px solid #e2e8f0",
    position: "sticky",
    top: 0,
    zIndex: 100,
  },
  headerContent: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "16px 24px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  logo: {
    fontSize: "22px",
    fontWeight: "bold",
    color: "#1e293b",
    margin: 0,
    cursor: "pointer",
  },
  nav: {
    display: "flex",
    gap: "12px",
  },
  navBtn: {
    padding: "10px 20px",
    background: "#f1f5f9",
    color: "#475569",
    border: "1px solid #e2e8f0",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
    transition: "all 0.2s ease",
  },
  navBtnActive: {
    background: "#6366f1",
    color: "#fff",
    border: "1px solid #6366f1",
  },
  logoutBtn: {
    padding: "10px 20px",
    background: "#1e293b",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
  },
};

export default Navbar;
