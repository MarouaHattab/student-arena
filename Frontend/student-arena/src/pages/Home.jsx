import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Student Arena</h1>
        <button onClick={handleLogout} style={styles.logoutBtn}>
          Déconnexion
        </button>
      </div>

      <div style={styles.content}>
        <div style={styles.card}>
          <h2 style={styles.welcomeTitle}>
            Bienvenue, {user?.firstName} {user?.lastName}!
          </h2>

          <div style={styles.info}>
            <div style={styles.infoItem}>
              <span style={styles.infoLabel}>Email:</span>
              <span style={styles.infoValue}>{user?.email}</span>
            </div>

            <div style={styles.infoItem}>
              <span style={styles.infoLabel}>Nom d'utilisateur:</span>
              <span style={styles.infoValue}>{user?.userName}</span>
            </div>

            <div style={styles.infoItem}>
              <span style={styles.infoLabel}>Rôle:</span>
              <span style={styles.infoValue}>{user?.role}</span>
            </div>

            <div style={styles.infoItem}>
              <span style={styles.infoLabel}>Points:</span>
              <span style={styles.infoValue}>{user?.points || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#f5f5f5",
  },
  header: {
    backgroundColor: "white",
    padding: "20px 40px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  },
  title: {
    fontSize: "24px",
    fontWeight: "bold",
    color: "#333",
    margin: 0,
  },
  logoutBtn: {
    padding: "10px 20px",
    backgroundColor: "#333",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "14px",
  },
  content: {
    padding: "40px",
    display: "flex",
    justifyContent: "center",
  },
  card: {
    backgroundColor: "white",
    padding: "40px",
    borderRadius: "8px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    maxWidth: "600px",
    width: "100%",
  },
  welcomeTitle: {
    fontSize: "28px",
    fontWeight: "bold",
    color: "#333",
    marginBottom: "30px",
  },
  info: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  infoItem: {
    display: "flex",
    justifyContent: "space-between",
    padding: "15px",
    backgroundColor: "#f9f9f9",
    borderRadius: "4px",
  },
  infoLabel: {
    fontWeight: "500",
    color: "#666",
  },
  infoValue: {
    color: "#333",
    fontWeight: "600",
  },
};

export default Home;
