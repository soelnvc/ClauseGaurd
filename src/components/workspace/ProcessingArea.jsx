import React from "react";
import Loader from "../common/Loader";

const ProcessingArea = ({ progress, progressLabel, file }) => {
  return (
    <div className="workspace__processing">
      <div className="workspace__processing-card">
        <h2 className="workspace__ai-thinking">ClauseGuard AI is analyzing...</h2>
        <div className="workspace__processing-visual">
          <Loader variant="orb" />
        </div>
        <div className="workspace__processing-info">
          <div className="workspace__progress-bar">
            <div className="workspace__progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <p className="workspace__progress-label">{progressLabel}</p>
          <p className="workspace__progress-pct">{progress}%</p>
        </div>
        <p className="workspace__processing-file">
          Reviewing <strong>{file?.name}</strong>
        </p>
      </div>
    </div>
  );
};

export default ProcessingArea;
