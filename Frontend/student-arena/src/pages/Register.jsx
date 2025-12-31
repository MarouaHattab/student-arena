import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
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
    // Clear error for this field when user types
    if (validationErrors[e.target.name]) {
      setValidationErrors({
        ...validationErrors,
        [e.target.name]: "",
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate confirmPassword match
    if (formData.password !== formData.confirmPassword) {
      setValidationErrors({
        confirmPassword: "Les mots de passe ne correspondent pas",
      });
      return;
    }

    // Validate all fields
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
      <div style={styles.card}>
        <h1 style={styles.title}>Inscription</h1>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Prénom</label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              style={{
                ...styles.input,
                ...(validationErrors.firstName ? styles.inputError : {}),
              }}
            />
            {validationErrors.firstName && (
              <span style={styles.fieldError}>
                {validationErrors.firstName}
              </span>
            )}
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Nom</label>
            <input
              type="text"
              name="lastName"
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

          <div style={styles.inputGroup}>
            <label style={styles.label}>Nom d'utilisateur</label>
            <input
              type="text"
              name="userName"
              value={formData.userName}
              onChange={handleChange}
              style={{
                ...styles.input,
                ...(validationErrors.userName ? styles.inputError : {}),
              }}
            />
            {validationErrors.userName && (
              <span style={styles.fieldError}>{validationErrors.userName}</span>
            )}
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              style={{
                ...styles.input,
                ...(validationErrors.email ? styles.inputError : {}),
              }}
            />
            {validationErrors.email && (
              <span style={styles.fieldError}>{validationErrors.email}</span>
            )}
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Mot de passe</label>
            <input
              type="password"
              name="password"
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
            <label style={styles.label}>Confirmer le mot de passe</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              style={{
                ...styles.input,
                ...(validationErrors.confirmPassword ? styles.inputError : {}),
              }}
            />
            {validationErrors.confirmPassword && (
              <span style={styles.fieldError}>
                {validationErrors.confirmPassword}
              </span>
            )}
          </div>

          <button type="submit" disabled={isLoading} style={styles.button}>
            {isLoading ? "Inscription..." : "S'inscrire"}
          </button>
        </form>

        <p style={styles.link}>
          Déjà un compte?{" "}
          <Link to="/login" style={styles.linkText}>
            Se connecter
          </Link>
        </p>
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
    backgroundColor: "#f5f5f5",
    padding: "20px",
  },
  card: {
    backgroundColor: "white",
    padding: "40px",
    borderRadius: "8px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    width: "100%",
    maxWidth: "400px",
  },
  title: {
    fontSize: "24px",
    fontWeight: "bold",
    marginBottom: "30px",
    textAlign: "center",
    color: "#333",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  label: {
    fontSize: "14px",
    fontWeight: "500",
    color: "#555",
  },
  input: {
    padding: "12px",
    border: "1px solid #ddd",
    borderRadius: "4px",
    fontSize: "14px",
  },
  inputError: {
    border: "1px solid #c33",
  },
  fieldError: {
    color: "#c33",
    fontSize: "12px",
    marginTop: "4px",
  },
  button: {
    padding: "12px",
    backgroundColor: "#333",
    color: "white",
    border: "none",
    borderRadius: "4px",
    fontSize: "16px",
    fontWeight: "500",
    cursor: "pointer",
    marginTop: "10px",
  },
  error: {
    padding: "12px",
    backgroundColor: "#fee",
    color: "#c33",
    borderRadius: "4px",
    marginBottom: "20px",
    fontSize: "14px",
  },
  link: {
    textAlign: "center",
    marginTop: "20px",
    fontSize: "14px",
    color: "#666",
  },
  linkText: {
    color: "#333",
    fontWeight: "500",
    textDecoration: "none",
  },
};

export default Register;
