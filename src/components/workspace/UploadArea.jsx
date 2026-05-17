import React from "react";
import { motion } from "framer-motion";
import Button from "../common/Button";
import { formatFileSize } from "../../services/aiService";

const UploadArea = ({
  file,
  dragOver,
  handleDragOver,
  handleDragLeave,
  handleDrop,
  handleBrowse,
  handleInputChange,
  removeFile,
  handleTrySample,
  startAnalysis,
  error,
  fileInputRef,
}) => {
  return (
    <motion.div
      className="workspace__upload-area"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="workspace__dropzone-wrapper">
        <motion.div
          className={`workspace__dropzone ${dragOver ? "workspace__dropzone--active" : ""} ${file ? "workspace__dropzone--has-file" : ""}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={!file ? handleBrowse : undefined}
          animate={{
            y: dragOver ? -16 : 0,
            scale: dragOver ? 1.02 : 1,
            boxShadow: dragOver
              ? "0 50px 80px -20px rgba(0, 0, 0, 0.15), 0 0 50px rgba(79, 140, 255, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.4) inset"
              : "0 25px 50px -12px rgba(0, 0, 0, 0.08), 0 0 0px rgba(79, 140, 255, 0), 0 0 0 1px rgba(255, 255, 255, 0.4) inset",
          }}
          whileHover={{
            y: -16,
            scale: 1.02,
            boxShadow:
              "0 50px 80px -20px rgba(0, 0, 0, 0.15), 0 0 50px rgba(79, 140, 255, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.6) inset",
          }}
          transition={{ type: "spring", stiffness: 260, damping: 25 }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.png,.jpg,.jpeg,.txt"
            onChange={handleInputChange}
            hidden
          />

          {!file ? (
            <div className="workspace__dropzone-empty">
              <svg className="workspace__dropzone-border-svg" width="100%" height="100%">
                <defs>
                  <linearGradient id="borderGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#4F8CFF" />
                    <stop offset="50%" stopColor="#7AA2FF" />
                    <stop offset="100%" stopColor="#4F8CFF" />
                  </linearGradient>
                </defs>
                <rect className="workspace__dropzone-border-rect" x="1" y="1" width="calc(100% - 2px)" height="calc(100% - 2px)" rx="24" ry="24" />
              </svg>
              <div className="workspace__dropzone-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3v12m0-12l-4 4m4-4l4 4" />
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                </svg>
              </div>
              <h3 className="workspace__dropzone-title">
                {dragOver ? "Release to upload" : "Drop a contract. Let ClauseGuard find the traps."}
              </h3>
              <p className="workspace__dropzone-sub">or click to browse files</p>
              
              <button
                className="workspace__dropzone-sample-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  handleTrySample();
                }}
              >
                Try with a sample Terms of Service
              </button>
            </div>
          ) : (
            <div className="workspace__file-preview">
              <div className="workspace__file-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
              </div>
              <div className="workspace__file-info">
                <p className="workspace__file-name">{file.name}</p>
                <p className="workspace__file-size">{formatFileSize(file.size)}</p>
              </div>
              <button className="workspace__file-remove" onClick={(e) => { e.stopPropagation(); removeFile(); }}>
                ✕
              </button>
            </div>
          )}
        </motion.div>
      </div>

      {error && <div className="workspace__error">{error}</div>}

      {file && (
        <div className="workspace__actions">
          <Button variant="primary" size="lg" onClick={startAnalysis}>
            Run ClauseGuard Analysis
          </Button>
        </div>
      )}
    </motion.div>
  );
};

export default UploadArea;
