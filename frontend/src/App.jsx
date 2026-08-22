import { useEffect, useState } from "react";
import { checkBackendHealth } from "./services/api";

function App() {
  const [backendStatus, setBackendStatus] = useState("Checking...");
  const [error, setError] = useState("");

  useEffect(() => {
    async function checkBackend() {
      try {
        const data = await checkBackendHealth();

        if (data.status === "healthy") {
          setBackendStatus("Connected");
        } else {
          setBackendStatus("Unavailable");
        }
      } catch (err) {
        setBackendStatus("Unavailable");
        setError(err.message);
      }
    }

    checkBackend();
  }, []);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-4">
      <h1 className="text-4xl font-bold">
        TOC Interactive Virtual Lab
      </h1>

      <p className="text-lg">
        Backend Status:{" "}
        <span className="font-semibold">
          {backendStatus}
        </span>
      </p>

      {error && (
        <p className="text-sm">
          {error}
        </p>
      )}
    </main>
  );
}

export default App;