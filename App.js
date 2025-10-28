import React, { useState, useEffect } from "react";
import { Sandpack } from "@codesandbox/sandpack-react";
import FileExplorer from "./components/FileExplorer";
import "./App.css";

const API_BASE = "http://localhost:5000/api"; 

const defaultFiles = {
  "/App.js": {
    code: `export default function App() {
  return (
    <div style={{ textAlign: "center", marginTop: "40px" }}>
      <h1>Hello from CipherStudio 👋</h1>
      <p>Edit your React code live!</p>
    </div>
  );
}`
  },
  "/index.js": {
    code: `import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);`
  }
};

export default function App() {
  const [projectId, setProjectId] = useState(() => {
    return localStorage.getItem("cipherstudio-projectId") || `proj-${Math.random().toString(36).slice(2, 9)}`;
  });
  const [projectName, setProjectName] = useState("Untitled Project");
  const [files, setFiles] = useState(() => {
    const saved = localStorage.getItem(`cipherstudio-local-${projectId}`);
    return saved ? JSON.parse(saved) : defaultFiles;
  });
  const [status, setStatus] = useState("");


  useEffect(() => {
    localStorage.setItem(`cipherstudio-local-${projectId}`, JSON.stringify(files));
  }, [files, projectId]);

  useEffect(() => {
    localStorage.setItem("cipherstudio-projectId", projectId);
  }, [projectId]);

  const addFile = () => {
    let name = prompt("Enter new file path (e.g., /NewFile.js):");
    if (!name) return;
    if (!name.startsWith("/")) name = "/" + name;
    if (files[name]) return alert("File already exists");
    setFiles((prev) => ({ ...prev, [name]: { code: "// new file" } }));
  };

  const deleteFile = (name) => {
    if (!window.confirm(`Delete ${name}?`)) return;
    const updated = { ...files };
    delete updated[name];
    setFiles(updated);
  };

  const saveToServer = async () => {
    try {
      setStatus("Saving...");
      const res = await fetch(`${API_BASE}/projects/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, name: projectName, files })
      });
      const j = await res.json();
      if (res.ok) setStatus("Saved to server ✔");
      else setStatus("Save failed: " + (j.error || j.message));
    } catch (err) {
      console.error(err);
      setStatus("Save failed: network error");
    }
  };

  // Load from remote backend
  const loadFromServer = async () => {
    try {
      setStatus("Loading...");
      const res = await fetch(`${API_BASE}/projects/${projectId}`);
      const j = await res.json();
      if (!res.ok) {
        setStatus("Load failed: " + (j.error || "unknown"));
        return;
      }
      if (j.project && j.project.files) {
        setFiles(j.project.files);
        setProjectName(j.project.name || "Untitled Project");
        setStatus("Loaded from server ✔");
      } else {
        setStatus("No files found");
      }
    } catch (err) {
      console.error(err);
      setStatus("Load failed: network error");
    }
  };

  const resetToDefault = () => {
    if (!window.confirm("Reset files to default example?")) return;
    setFiles(defaultFiles);
  };

  return (
    <div className="app">
      <header className="header">
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <h2 style={{ margin: 0 }}>⚡ CipherStudio</h2>
          <small style={{ opacity: 0.8 }}> — Browser IDE (MVP)</small>
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            style={{ padding: 6, borderRadius: 6 }}
            title="Project ID"
          />
          <input
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            style={{ padding: 6, borderRadius: 6 }}
            title="Project Name"
          />
          <button onClick={addFile}>➕ Add File</button>
          <button onClick={saveToServer}>💾 Save to Server</button>
          <button onClick={loadFromServer}>📂 Load from Server</button>
          <button onClick={resetToDefault}>♻ Reset</button>
        </div>
      </header>

      <div className="main">
        <FileExplorer files={files} deleteFile={deleteFile} />

        <div className="editor">
          <Sandpack
            template="react"
            files={Object.fromEntries(Object.entries(files).map(([k, v]) => [k, typeof v === "object" ? v.code : v]))}
            options={{
              showNavigator: true,
              showTabs: true,
              showLineNumbers: true,
              recompileMode: "immediate",
              layout: "preview"
            }}
          />
        </div>
      </div>

      <footer className="footer">
        <div>{status}</div>
        <div style={{ opacity: 0.8 }}>Local autosave: files saved in browser storage</div>
      </footer>
    </div>
  );
}
