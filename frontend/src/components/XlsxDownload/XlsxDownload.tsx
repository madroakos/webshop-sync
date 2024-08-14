import React, { useEffect, useState } from "react";
import axios from "axios";
import { DownloadIcon } from "../../icons/DownloadIcon.tsx";
import { config } from "../../config.ts";

export function XlsxDownload() {
  const [files, setFiles] = useState(null);

  useEffect(() => {
    async function fetchFiles() {
      const data = await getFiles();
      setFiles(data.data);
    }
    fetchFiles();
  }, []);

  return (
    <div className="card">
      <h3>XLSX files</h3>
      <ul>
        {files &&
          files.map((file) => (
            <li key={file} className="flex">
              <p>{file}</p>
              <a
                href={`${config.fetchUrls.getSpecificXlsxFile}/${file}`}
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

  async function getFiles() {
    try {
      return await axios.get(config.fetchUrls.getXlsxFiles);
    } catch (error) {
      console.error("Error fetching xlsx files:", error);
    }
  }
}
