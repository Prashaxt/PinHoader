import { Link } from "react-router-dom";
import mascot from "../assets/PageNotFoundMonster.png"; // swap with your image path

const NotFound = () => {
  return (
    <div style={{
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      backgroundColor: "var(--background-one)",
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "2rem",
      textAlign: "center",
    }}>

      <img
        src={mascot}
        alt="mascot"
        style={{ width: "300px", height: "300px", marginBottom: "0.1rem", objectFit: "contain", position: 'relative',
        top: '70px', }}
      />

      <h1 style={{
        fontSize: "7rem",
        fontWeight: 1000,
        lineHeight: 1,
        background: "var(--pink-gradient)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        marginBottom: "0.5rem",
        zIndex: 2,
      }}>
        404
      </h1>

      <h2 style={{ fontSize: "1.6rem", fontWeight: 600, color: "var(--text-one)", marginBottom: "0.75rem" }}>
        Page not found
      </h2>

      <p style={{ fontSize: "1rem", color: "var(--text-two)", maxWidth: "380px", lineHeight: 1.6, marginBottom: "2rem" }}>
        Oops! Looks like this page took a wrong turn. It might have been moved, deleted, or never existed.
      </p>

      <Link to="/" style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "8px",
        background: "var(--pink-gradient)",
        color: "#fff",
        fontSize: "0.95rem",
        fontWeight: 600,
        padding: "0.75rem 2rem",
        borderRadius: "50px",
        textDecoration: "none",
      }}>
        Go back home
      </Link>
    </div>
  );
};

export default NotFound;