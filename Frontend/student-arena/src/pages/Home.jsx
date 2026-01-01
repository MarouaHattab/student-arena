import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";

const Home = () => {
  const { user } = useAuth();

  return (
    <div style={styles.container}>
      <Navbar />

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
    backgroundColor: "#f8fafc",
  },
  content: {
    padding: "40px",
    display: "flex",
    justifyContent: "center",
  },
  card: {
    backgroundColor: "white",
    padding: "40px",
    borderRadius: "12px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
    border: "1px solid #e2e8f0",
    maxWidth: "600px",
    width: "100%",
  },
  welcomeTitle: {
    fontSize: "28px",
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: "30px",
  },
  info: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  infoItem: {
    display: "flex",
    justifyContent: "space-between",
    padding: "14px 16px",
    backgroundColor: "#f8fafc",
    borderRadius: "8px",
  },
  infoLabel: {
    fontWeight: "500",
    color: "#64748b",
    fontSize: "14px",
  },
  infoValue: {
    color: "#1e293b",
    fontWeight: "600",
    fontSize: "14px",
  },
};

export default Home;
