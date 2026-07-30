export default function Home() {
  return (
    <main style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #000000, #0f172a)",
      color: "white",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "Arial, sans-serif",
      textAlign: "center",
      padding: "20px"
    }}>
      
      <h1 style={{ fontSize: "3rem", marginBottom: "10px" }}>
        🚀 TrustSetu
      </h1>

      <p style={{ fontSize: "1.2rem", color: "#94a3b8" }}>
        AI-powered Trust Analysis Platform
      </p>

      <br />

      <div style={{
        background: "#020617",
        padding: "25px",
        borderRadius: "12px",
        boxShadow: "0 0 20px rgba(0,0,0,0.5)",
        marginTop: "20px",
        width: "300px"
      }}>
        <h2 style={{ marginBottom: "15px" }}>🔥 Features</h2>

        <ul style={{ listStyle: "none", padding: 0, textAlign: "left" }}>
          <li>✔ RAG-based Evidence Retrieval</li>
          <li>✔ Bias Detection</li>
          <li>✔ Scam Detection</li>
          <li>✔ PDF Report Generation</li>
        </ul>
      </div>

    </main>
  )
}