import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState, useEffect } from "react";
import api from "../api/axiosConfig";

const Navbar = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [showAdminMenu, setShowAdminMenu] = useState(false);
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    // Mettre à jour le chemin actuel quand on navigue
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener("popstate", handleLocationChange);
    
    // Une petite astuce pour intercepter les changements de navigation interne
    // sans useLocation
    const interval = setInterval(() => {
      if (window.location.pathname !== currentPath) {
        setCurrentPath(window.location.pathname);
      }
    }, 100);

    return () => {
      window.removeEventListener("popstate", handleLocationChange);
      clearInterval(interval);
    };
  }, [currentPath]);

  const handleNavigate = (path) => {
    navigate(path);
    setCurrentPath(path);
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const isActive = (path) => currentPath === path;

  return (
    <header style={styles.header}>
      <div style={styles.headerContent}>
        <div style={styles.brand} onClick={() => handleNavigate("/")}>
          <div style={styles.logoBadge}>SA</div>
          <h1 style={styles.logoText}>Student Arena</h1>
        </div>

        <nav style={styles.nav}>
          <div style={styles.mainNav}>
            <button 
              onClick={() => handleNavigate("/")} 
              style={{...styles.navBtn, ...(isActive("/") ? styles.navBtnActive : {})}}
            >
              Accueil
            </button>
            <button 
              onClick={() => handleNavigate("/projects")} 
              style={{...styles.navBtn, ...(currentPath.startsWith("/projects") ? styles.navBtnActive : {})}}
            >
              Projets
            </button>
            <button 
              onClick={() => handleNavigate("/leaderboard")} 
              style={{...styles.navBtn, ...(isActive("/leaderboard") ? styles.navBtnActive : {})}}
            >
              Classement
            </button>
            <button 
              onClick={() => handleNavigate("/team")} 
              style={{...styles.navBtn, ...(isActive("/team") ? styles.navBtnActive : {})}}
            >
              Équipe
            </button>
            
            <div style={styles.divider} />

            <button 
              onClick={() => handleNavigate("/ai/chat")} 
              style={{...styles.aiBtn, ...(isActive("/ai/chat") ? styles.aiBtnActive : {})}}
            >
              ✨ Assistant
            </button>
            <button 
              onClick={() => handleNavigate("/ai/generate-idea")} 
              style={{...styles.aiBtn, ...(isActive("/ai/generate-idea") ? styles.aiBtnActive : {})}}
            >
              💡 Idées
            </button>
          </div>

          <div style={styles.userActions}>
            {user?.role === 'admin' && (
              <div style={styles.adminDropdown}>
                {showAdminMenu && (
                  <div 
                    style={styles.backdrop} 
                    onClick={() => setShowAdminMenu(false)} 
                  />
                )}
                <button 
                  onClick={() => setShowAdminMenu(!showAdminMenu)}
                  style={{
                    ...styles.adminMenuBtn,
                    ...(showAdminMenu ? styles.adminMenuBtnOpen : {})
                  }}
                >
                  ⚙️ Admin
                </button>
                {showAdminMenu && (
                  <div style={styles.dropdownMenu}>
                    <div style={styles.dropdownHeader}>Gestion</div>
                    <button onClick={() => { handleNavigate("/admin/projects"); setShowAdminMenu(false); }} style={styles.dropdownItem}>
                         Gérer Projets
                    </button>
                    <button onClick={() => { handleNavigate("/admin/users"); setShowAdminMenu(false); }} style={styles.dropdownItem}>
                        Utilisateurs
                    </button>
                    <button onClick={() => { handleNavigate("/admin/teams"); setShowAdminMenu(false); }} style={styles.dropdownItem}>
                         Équipes
                    </button>
                  </div>
                )}
              </div>
            )}
            
            <div 
              style={styles.profileIndicator}
              onClick={() => handleNavigate("/profile")}
            >
              <div style={styles.avatar}>
                {user?.userName?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div style={styles.userInfo}>
                <span style={styles.userName}>{user?.userName}</span>
                <span style={styles.userRole}>{user?.role}</span>
              </div>
            </div>

            <button onClick={handleLogout} style={styles.logoutBtn} title="Déconnexion">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
            </button>
          </div>
        </nav>
      </div>
    </header>
  );
};

const styles = {
  header: {
    background: "rgba(255, 255, 255, 0.8)",
    backdropFilter: "blur(12px)",
    borderBottom: "1px solid #e2e8f0",
    position: "sticky",
    top: 0,
    zIndex: 1000,
    height: "72px",
    display: "flex",
    alignItems: "center",
  },
  headerContent: {
    maxWidth: "1400px",
    width: "100%",
    margin: "0 auto",
    padding: "0 24px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  brand: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    cursor: "pointer",
  },
  logoBadge: {
    padding: "6px 10px",
    background: "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)",
    color: "#fff",
    borderRadius: "10px",
    fontWeight: "800",
    fontSize: "14px",
    boxShadow: "0 4px 12px rgba(99, 102, 241, 0.3)",
  },
  logoText: {
    fontSize: "20px",
    fontWeight: "800",
    color: "#1e293b",
    margin: 0,
    letterSpacing: "-0.5px",
  },
  nav: {
    display: "flex",
    alignItems: "center",
    gap: "32px",
    flex: 1,
    justifyContent: "flex-end",
  },
  mainNav: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    background: "#f1f5f9",
    padding: "4px",
    borderRadius: "12px",
  },
  navBtn: {
    padding: "8px 16px",
    background: "transparent",
    color: "#64748b",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
    transition: "all 0.2s ease",
  },
  navBtnActive: {
    background: "#fff",
    color: "#6366f1",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
  },
  divider: {
    width: "1px",
    height: "20px",
    background: "#cbd5e1",
    margin: "0 4px",
  },
  aiBtn: {
    padding: "8px 16px",
    background: "transparent",
    color: "#64748b",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
    transition: "all 0.2s",
  },
  aiBtnActive: {
    background: "linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)",
    color: "#6366f1",
  },
  userActions: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
  },
  adminDropdown: {
    position: "relative",
    zIndex: 1002,
  },
  backdrop: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "transparent",
    zIndex: 1000,
  },
  adminMenuBtn: {
    padding: "8px 16px",
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: "10px",
    color: "#475569",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    transition: "all 0.2s",
  },
  adminMenuBtnOpen: {
    borderColor: "#6366f1",
    color: "#6366f1",
    background: "#f5f3ff",
  },
  dropdownMenu: {
    position: "absolute",
    top: "calc(100% + 12px)",
    right: 0,
    width: "200px",
    background: "#fff",
    borderRadius: "16px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
    border: "1px solid #e2e8f0",
    padding: "8px",
    zIndex: 1001,
    animation: "fadeIn 0.2s ease-out",
  },
  dropdownHeader: {
    padding: "8px 12px",
    fontSize: "11px",
    fontWeight: "700",
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  dropdownItem: {
    width: "100%",
    padding: "10px 12px",
    textAlign: "left",
    background: "transparent",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "500",
    color: "#475569",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  profileIndicator: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "4px 12px 4px 4px",
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: "30px",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  avatar: {
    width: "32px",
    height: "32px",
    background: "#6366f1",
    color: "#fff",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "14px",
    fontWeight: "700",
  },
  userInfo: {
    display: "flex",
    flexDirection: "column",
  },
  userName: {
    fontSize: "13px",
    fontWeight: "700",
    color: "#1e293b",
    lineHeight: "1.2",
  },
  userRole: {
    fontSize: "10px",
    color: "#94a3b8",
    textTransform: "uppercase",
    fontWeight: "700",
  },
  logoutBtn: {
    padding: "8px",
    background: "#f1f5f9",
    color: "#64748b",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s",
  },
};

export default Navbar;
