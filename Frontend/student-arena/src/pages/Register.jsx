import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axiosConfig";
import { validateRegister, hasErrors } from "../utils/validation";

const Register = () => {
  const navigate = useNavigate();
  const { register, error } = useAuth();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    userName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (validationErrors[e.target.name]) {
      setValidationErrors({
        ...validationErrors,
        [e.target.name]: "",
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setValidationErrors({
        confirmPassword: "Les mots de passe ne correspondent pas",
      });
      return;
    }

    const errors = validateRegister(formData);
    if (hasErrors(errors)) {
      setValidationErrors(errors);
      return;
    }

    setIsLoading(true);
    try {
      const { confirmPassword, ...registerData } = formData;
      await register(registerData);
      navigate("/");
    } catch (err) {
      console.error("Register error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.backgroundShapes}>
        <div style={styles.shape1}></div>
        <div style={styles.shape2}></div>
      </div>

      <div style={styles.card} className="fade-in">
        <div style={styles.header}>
            <div style={styles.logoBadge}>SA</div>
            <h1 style={styles.title}>Rejoignez l'Arena</h1>
            <p style={styles.subtitle}>Créez votre compte en quelques secondes et commencez à monter dans le classement.</p>
        </div>

        {error && <div style={styles.errorAlert}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGrid}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Prénom</label>
              <input
                type="text"
                name="firstName"
                placeholder="Ex: Sophie"
                value={formData.firstName}
                onChange={handleChange}
                style={{
                  ...styles.input,
                  ...(validationErrors.firstName ? styles.inputError : {}),
                }}
              />
              {validationErrors.firstName && (
                <span style={styles.fieldError}>{validationErrors.firstName}</span>
              )}
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Nom</label>
              <input
                type="text"
                name="lastName"
                placeholder="Ex: Martin"
                value={formData.lastName}
                onChange={handleChange}
                style={{
                  ...styles.input,
                  ...(validationErrors.lastName ? styles.inputError : {}),
                }}
              />
              {validationErrors.lastName && (
                <span style={styles.fieldError}>{validationErrors.lastName}</span>
              )}
            </div>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Nom d'utilisateur</label>
            <div style={styles.inputWrapper}>
              <span style={styles.inputIcon}>👤</span>
              <input
                type="text"
                name="userName"
                placeholder="sophie_dev"
                value={formData.userName}
                onChange={handleChange}
                style={{
                  ...styles.inputWithIcon,
                  ...(validationErrors.userName ? styles.inputError : {}),
                }}
              />
            </div>
            {validationErrors.userName && (
              <span style={styles.fieldError}>{validationErrors.userName}</span>
            )}
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Email professionnel / étudiant</label>
            <div style={styles.inputWrapper}>
              <span style={styles.inputIcon}>📧</span>
              <input
                type="email"
                name="email"
                placeholder="sophie@exemple.com"
                value={formData.email}
                onChange={handleChange}
                style={{
                  ...styles.inputWithIcon,
                  ...(validationErrors.email ? styles.inputError : {}),
                }}
              />
            </div>
            {validationErrors.email && (
              <span style={styles.fieldError}>{validationErrors.email}</span>
            )}
          </div>

          <div style={styles.formGrid}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Mot de passe</label>
              <input
                type="password"
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                style={{
                  ...styles.input,
                  ...(validationErrors.password ? styles.inputError : {}),
                }}
              />
              {validationErrors.password && (
                <span style={styles.fieldError}>{validationErrors.password}</span>
              )}
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Confirmation</label>
              <input
                type="password"
                name="confirmPassword"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                style={{
                  ...styles.input,
                  ...(validationErrors.confirmPassword ? styles.inputError : {}),
                }}
              />
              {validationErrors.confirmPassword && (
                <span style={styles.fieldError}>{validationErrors.confirmPassword}</span>
              )}
            </div>
          </div>

          <button type="submit" disabled={isLoading} style={styles.button}>
            {isLoading ? "Création du profil..." : "Créer mon compte"}
          </button>
        </form>

        <div style={styles.footer}>
          <p style={styles.linkText}>
            Déjà membre ? <Link to="/login" style={styles.link}>Se connecter</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    position: "relative",
    overflow: "hidden",
    padding: "40px 20px",
  },
  backgroundShapes: {
    position: "absolute",
    inset: 0,
    zIndex: 0,
  },
  shape1: {
    position: "absolute",
    top: "-15%",
    left: "-5%",
    width: "450px",
    height: "450px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(99, 102, 241, 0.1) 100%)",
    filter: "blur(70px)",
  },
  shape2: {
    position: "absolute",
    bottom: "-10%",
    right: "-5%",
    width: "400px",
    height: "400px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(168, 85, 247, 0.1) 100%)",
    filter: "blur(70px)",
  },
  card: {
    background: "rgba(255, 255, 255, 0.8)",
    backdropFilter: "blur(16px)",
    padding: "48px",
    borderRadius: "32px",
    border: "1px solid rgba(255, 255, 255, 0.5)",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.08)",
    width: "100%",
    maxWidth: "600px",
    zIndex: 1,
    position: "relative",
  },
  header: {
    textAlign: "center",
    marginBottom: "40px",
  },
  logoBadge: {
    width: "52px",
    height: "52px",
    background: "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)",
    color: "#fff",
    borderRadius: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "800",
    fontSize: "22px",
    margin: "0 auto 16px",
    boxShadow: "0 10px 15px -3px rgba(99, 102, 241, 0.3)",
  },
  title: {
    fontSize: "32px",
    fontWeight: "800",
    color: "#1e293b",
    marginBottom: "10px",
    letterSpacing: "-1px",
  },
  subtitle: {
    fontSize: "15px",
    color: "#64748b",
    lineHeight: "1.5",
    maxWidth: "400px",
    margin: "0 auto",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "20px",
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  label: {
    fontSize: "13px",
    fontWeight: "700",
    color: "#475569",
    marginLeft: "4px",
  },
  inputWrapper: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  },
  inputIcon: {
    position: "absolute",
    left: "14px",
    fontSize: "18px",
    color: "#94a3b8",
  },
  input: {
    width: "100%",
    padding: "14px 16px",
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: "14px",
    fontSize: "15px",
    outline: "none",
    transition: "all 0.2s",
    color: "#1e293b",
  },
  inputWithIcon: {
    width: "100%",
    padding: "14px 14px 14px 44px",
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: "14px",
    fontSize: "15px",
    outline: "none",
    transition: "all 0.2s",
    color: "#1e293b",
  },
  inputError: {
    borderColor: "#ef4444",
    background: "#fffafb",
  },
  fieldError: {
    color: "#ef4444",
    fontSize: "12px",
    fontWeight: "600",
    marginLeft: "4px",
  },
  button: {
    padding: "18px",
    background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
    color: "white",
    border: "none",
    borderRadius: "16px",
    fontSize: "16px",
    fontWeight: "700",
    cursor: "pointer",
    transition: "all 0.2s",
    boxShadow: "0 10px 15px -3px rgba(99, 102, 241, 0.2)",
    marginTop: "12px",
  },
  errorAlert: {
    padding: "14px 16px",
    background: "#fef2f2",
    color: "#991b1b",
    borderRadius: "12px",
    marginBottom: "24px",
    fontSize: "14px",
    fontWeight: "600",
    border: "1px solid #fee2e2",
  },
  footer: {
    marginTop: "32px",
    textAlign: "center",
  },
  linkText: {
    fontSize: "14px",
    color: "#64748b",
  },
  link: {
    color: "#6366f1",
    fontWeight: "700",
    textDecoration: "none",
    marginLeft: "4px",
  },
};

export default Register;
