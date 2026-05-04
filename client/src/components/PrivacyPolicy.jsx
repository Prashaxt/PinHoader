// import ReactMarkdown from "react-markdown";
// import content from "../../privacy-policy.md?raw";  // ?raw tells Vite to import as plain text

// const PrivacyPolicy = () => {
//   return (
//     <div style={{ maxWidth: "800px", margin: "0 auto", padding: "2rem" }}>
//       <ReactMarkdown>{content}</ReactMarkdown>
//     </div>
//   );
// };

// export default PrivacyPolicy;

const PrivacyPolicy = () => {
  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", background: "var(--background-one)", minHeight: "100vh", paddingBottom: "4rem" }}>

      {/* Hero */}
      <div style={{ background: "var(--pink-gradient)", padding: "3.5rem 2rem 3rem", textAlign: "center" }}>
        <span style={{ display: "inline-block", background: "rgba(255,255,255,0.18)", color: "#fff", fontSize: "11px", fontWeight: 600, letterSpacing: "0.08em", padding: "4px 14px", borderRadius: "50px", marginBottom: "1rem", textTransform: "uppercase" }}>Legal</span>
        <h1 style={{ margin: "0 0 0.5rem", fontSize: "2.2rem", fontWeight: 700, color: "#fff" }}>Privacy Policy</h1>
        <p style={{ margin: 0, fontSize: "0.9rem", color: "rgba(255,255,255,0.8)" }}>Effective Date: July 22, 2025</p>
      </div>

      <div style={{ maxWidth: "680px", margin: "0 auto", padding: "0 1.5rem" }}>

        {/* Summary cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "12px", margin: "-1.5rem 0 2.5rem" }}>
          {[
            { label: "No data stored", sub: "Zero retention" },
            { label: "No tracking", sub: "No cookies" },
            { label: "No third parties", sub: "Private by design" },
          ].map((c) => (
            <div key={c.label} style={{ background: "#fff", border: "0.5px solid rgba(191,63,63,0.15)", borderRadius: "12px", padding: "1rem 1.25rem", textAlign: "center" }}>
              <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-one)" }}>{c.label}</div>
              <div style={{ fontSize: "11px", color: "var(--text-two)", marginTop: "2px" }}>{c.sub}</div>
            </div>
          ))}
        </div>

        {/* Sections */}
        {[
          {
            title: "What we collect: NOTHING",
            content: (
              <>
                <p style={{ margin: "0 0 0.75rem", fontSize: "0.88rem", color: "var(--text-two)", lineHeight: 1.65 }}>
                  PinHoarder is designed with privacy first. We <strong style={{ color: "var(--text-one)" }}>do not</strong> collect, store, or track any of the following:
                </p>
                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "8px" }}>
                  {["No Personal information", "No Pinterest account data", "No Cookies or tracking information", "No Uploaded files or board contents"].map((item) => (
                    <li key={item} style={{ fontSize: "0.88rem", color: "var(--text-two)", paddingLeft: "1rem", borderLeft: "2px solid var(--accent-color)" }}>{item}</li>
                  ))}
                </ul>
              </>
            ),
          },
          {
            title: "How it works",
            content: (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {[
                  "You provide a public Pinterest board URL",
                  "Our backend temporarily fetches the images and returns them to you",
                  "Nothing is stored, logged, or shared with any third parties",
                ].map((step, i) => (
                  <div key={i} style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                    <div style={{ width: "24px", height: "24px", background: "var(--pink-gradient)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 700, color: "#fff", flexShrink: 0 }}>{i + 1}</div>
                    <p style={{ margin: 0, fontSize: "0.88rem", color: "var(--text-two)", lineHeight: 1.55 }}>{step}</p>
                  </div>
                ))}
              </div>
            ),
          },
          {
            title: "Data retention",
            content: <p style={{ margin: 0, fontSize: "0.88rem", color: "var(--text-two)", lineHeight: 1.65 }}>We retain <strong style={{ color: "var(--text-one)" }}>no user data</strong>. Everything is processed in real-time and immediately discarded after your request completes. There are no logs, databases, or backups of your activity.</p>,
          },
          {
            title: "Contact",
            content: (
              <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                <div style={{ width: "44px", height: "44px", borderRadius: "50%", background: "var(--pink-gradient)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: 700, color: "#fff", flexShrink: 0 }}>P</div>
                <div>
                  <p style={{ margin: "0 0 2px", fontSize: "0.95rem", fontWeight: 700, color: "var(--text-one)" }}>Prashaxt</p>
                  <a href="https://github.com/Prashaxt" target="_blank" rel="noopener noreferrer" style={{ fontSize: "0.82rem", color: "var(--main-color)", textDecoration: "none", fontWeight: 500 }}>github.com/Prashaxt</a>
                </div>
              </div>
            ),
          },
        ].map((s) => (
          <div key={s.title} style={{ background: "#fff", border: "0.5px solid rgba(191,63,63,0.12)", borderRadius: "14px", padding: "1.5rem 1.75rem", marginBottom: "1rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "1rem" }}>
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--pink-gradient)", flexShrink: 0 }} />
              <h2 style={{ margin: 0, fontSize: "1rem", fontWeight: 700, color: "var(--text-one)" }}>{s.title}</h2>
            </div>
            {s.content}
          </div>
        ))}

        <p style={{ textAlign: "center", fontSize: "0.78rem", color: "var(--text-two)", lineHeight: 1.6, marginTop: "2rem" }}>
          This policy may be updated from time to time.<br />Please check back for any changes.
        </p>
      </div>
    </div>
  );
};

export default PrivacyPolicy;