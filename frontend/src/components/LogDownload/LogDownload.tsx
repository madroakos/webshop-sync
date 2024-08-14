import React, { useEffect, useState } from "react";
import { DownloadIcon } from "../../icons/DownloadIcon.tsx";
import axios from "axios";
import { config } from "../../config.ts";

export function LogDownload() {
  const [files, setFiles] = useState(null);

  useEffect(() => {
    async function fetchLogs() {
      const data = await getLogs();
      setFiles(data.data);
    }
    fetchLogs();
  }, []);

  return (
    <div className="card third-item">
      <h3>Log files:</h3>
      <ul id="logs">
        {files &&
          files.map((file: string) => (
            <li key={file} className="flex cardInfo">
              <p>{file}</p>
              <a
                href={`${config.fetchUrls.getSpecificLogFile}/${file}`}
                target={"_blank"}
                rel="noreferrer"
              >
                <DownloadIcon />
              </a>
            </li>
          ))}
      </ul>
    </div>
  );

  async function getLogs() {
    try {
      return await axios.get(config.fetchUrls.getLogs);
    } catch (error) {
      console.error("Error fetching backups:", error);
    }
  }
}
