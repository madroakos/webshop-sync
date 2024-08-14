import React from "react";
import { ExternalWebshopInfo } from "../../ExternalWebshopInfo/ExternalWebshopInfo.tsx";
import { BackupDownload } from "../../BackupDownload/BackupDownload.tsx";
import { LogDownload } from "../../LogDownload/LogDownload.tsx";
import "./AllInfoView.css";
import { XlsxDownload } from "../../XlsxDownload/XlsxDownload.tsx";

export default function AllInfoView() {
  return (
    <div className="gridView secondItemInFlex">
      <ExternalWebshopInfo />
      <BackupDownload />
      <LogDownload />
      <XlsxDownload />
    </div>
  );
}
