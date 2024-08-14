import React, { useEffect, useState } from "react";
import axios from "axios";
import { DownloadIcon } from "../../icons/DownloadIcon.tsx";
import { config } from "../../config.ts";

export function BackupDownload() {
  const [files, setFiles] = useState(null);

  useEffect(() => {
    async function fetchExecutions() {
      const data = await getExecutions();
      setFiles(data.data);
    }
    fetchExecutions();
  }, []);

  return (
    <div className="flex card">
      <h3>Backup files:</h3>
      <ul>
        {files &&
          files.map((file: string) => (
            <li key={file} className="flex">
              <p>{file}</p>
              <a
                href={`${config.fetchUrls.getSpecificBackupFile}/${file}`}
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

  async function getExecutions() {
    try {
      return await axios.get(config.fetchUrls.getBackupFiles);
    } catch (error) {
      console.error("Error fetching backups:", error);
    }
  }
}
