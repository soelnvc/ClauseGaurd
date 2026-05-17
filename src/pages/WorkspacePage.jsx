import React, { useState, useRef, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../context/ToastContext";
import { analyzePolicy } from "../services/aiService";
import { savePolicyAnalysis, toggleFavoritePolicy } from "../services/dbService";
import Button from "../components/common/Button";
import UploadArea from "../components/workspace/UploadArea";
import ProcessingArea from "../components/workspace/ProcessingArea";
import ResultsArea from "../components/workspace/ResultsArea";
import "./WorkspacePage.css";

function WorkspacePage() {
  const { user } = useAuth();
  const location = useLocation();
  const { addToast } = useToast();
  const [state, setState] = useState("upload");
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("clauses");
  const fileInputRef = useRef(null);

  const firstName = user?.displayName?.split(" ")[0] || "there";

  useEffect(() => {
    if (location.state?.policy) {
      setAnalysis(location.state.policy);
      setState("results");
    }
  }, [location.state]);

  const handleFile = useCallback((selectedFile) => {
    setError("");
    if (!selectedFile) return;
    const validTypes = ["application/pdf", "image/png", "image/jpeg", "text/plain"];
    if (!validTypes.includes(selectedFile.type)) {
      setError("Please upload a PDF, image, or text file.");
      return;
    }
    if (selectedFile.size > 25 * 1024 * 1024) {
      setError("File must be under 25 MB.");
      return;
    }
    setFile(selectedFile);
  }, []);

  const handleDragOver = (e) => { e.preventDefault(); setDragOver(true); };
  const handleDragLeave = () => setDragOver(false);
  const handleDrop = (e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); };
  const handleBrowse = () => fileInputRef.current?.click();
  const handleInputChange = (e) => handleFile(e.target.files[0]);
  const removeFile = () => { setFile(null); setError(""); };

  const startAnalysis = async () => {
    if (!file) return;
    setState("processing");
    setProgress(0);
    setProgressLabel("Initializing...");

    try {
      const result = await analyzePolicy(file, (p, label) => {
        setProgress(p);
        setProgressLabel(label);
      });

      setProgress(99);
      let firestoreId = null;
      if (user?.uid) {
        try {
          firestoreId = await savePolicyAnalysis(user.uid, result);
          addToast("Contract safely stored.", "success");
        } catch (dbErr) {
          console.warn("Firestore save failed:", dbErr);
          addToast("Cloud backup unavailable. Showing results locally.", "warning");
        }
      }

      setAnalysis({ ...result, id: firestoreId, isFavorite: false });
      setState("results");
    } catch (err) {
      setError("Analysis failed. Please try again or check your document.");
      addToast("Failed to analyze document via AI.", "error");
      setState("upload");
    }
  };

  const startOver = () => {
    setState("upload");
    setFile(null);
    setProgress(0);
    setAnalysis(null);
    setError("");
    setActiveTab("clauses");
  };

  const handleTrySample = async () => {
    try {
      const response = await fetch("/demo.txt");
      const sampleText = await response.text();
      const blob = new Blob([sampleText], { type: "text/plain" });
      const sampleFile = new File([blob], "demo_contract.txt", { type: "text/plain" });
      setFile(sampleFile);
      addToast("Loaded sample contract successfully!", "success");
    } catch (err) {
      addToast("Failed to load sample contract.", "error");
    }
  };

  const handleToggleFavorite = async () => {
    if (!user || !analysis?.id) return;
    const newStatus = !analysis.isFavorite;
    await toggleFavoritePolicy(user.uid, analysis.id, newStatus);
    setAnalysis((prev) => ({ ...prev, isFavorite: newStatus }));
    addToast(newStatus ? "Added to favorites." : "Removed from favorites.", "success");
  };

  return (
    <div className="theme-main page-content page-enter">
      <div className="workspace">
        <motion.div className="workspace__header" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <div className="container">
            <div className="workspace__header-content">
              <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3, duration: 0.8 }}>
                <p className="text-overline" style={{ marginBottom: "0.25rem" }}>CLAUSEGUARD AI WORKSPACE</p>
                <h1 className="workspace__title">
                  {state === "upload" && <>Hey {firstName}, let's <span className="text-gradient">decode a contract</span></>}
                  {state === "processing" && "Analyzing your document..."}
                  {state === "results" && <>Analysis <span className="text-gradient--lime">Complete</span></>}
                </h1>
                {state === "upload" && <p className="workspace__subtitle">Upload a legal document. Our adversarial AI will find hidden traps.</p>}
              </motion.div>
              {state === "results" && (
                <div className="workspace__actions-group" style={{ display: "flex", gap: "12px" }}>
                  <Button variant="primary" className="workspace__new-btn" onClick={startOver}>New Analysis</Button>
                </div>
              )}
            </div>
          </div>
        </motion.div>
        
        <div className="container">
          {state === "upload" && (
            <UploadArea
              file={file} dragOver={dragOver} handleDragOver={handleDragOver} handleDragLeave={handleDragLeave}
              handleDrop={handleDrop} handleBrowse={handleBrowse} handleInputChange={handleInputChange}
              removeFile={removeFile} handleTrySample={handleTrySample} startAnalysis={startAnalysis}
              error={error} fileInputRef={fileInputRef}
            />
          )}
          {state === "processing" && <ProcessingArea progress={progress} progressLabel={progressLabel} file={file} />}
          {state === "results" && <ResultsArea analysis={analysis} activeTab={activeTab} setActiveTab={setActiveTab} />}
        </div>
      </div>
    </div>
  );
}

export default WorkspacePage;
