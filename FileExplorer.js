import React from "react";
import "./FileExplorer.css";

export default function FileExplorer({ files, deleteFile }) {
  return (
    <div className="sidebar">
      <h3>📂 Files</h3>
      <ul>
        {Object.keys(files).map((file) => (
          <li key={file}>
            <span className="fname">{file}</span>
            <button className="del" onClick={() => deleteFile(file)}>🗑️</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
