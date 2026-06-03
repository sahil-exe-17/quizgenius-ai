"use client";

import React, { useState, useRef } from 'react';
import styles from './FileUpload.module.css';

export default function FileUpload() {
  const [isDragActive, setIsDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [difficulty, setDifficulty] = useState<string>("Medium");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!selectedFile) {
      setIsDragActive(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    
    if (selectedFile) return;

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (file: File) => {
    if (file.type !== "application/pdf") {
      alert("Please upload a PDF file.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert("File is too large. Maximum size is 10MB.");
      return;
    }
    setSelectedFile(file);
  };

  const handleClick = () => {
    if (!selectedFile) {
      inputRef.current?.click();
    }
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedFile(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const handleGenerate = async () => {
    if (!selectedFile) return;
    
    setIsUploading(true);
    
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("numberOfQuestions", questionCount.toString());
      formData.append("difficulty", difficulty);
      
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error("Upload failed");
      }
      
      const data = await response.json();
      console.log("Success:", data);
      
      if (data.quiz && data.quiz.id) {
        window.location.href = `/quiz/${data.quiz.id}`;
      }
      
    } catch (error) {
      console.error(error);
      alert("Error generating quiz. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={styles.uploadContainer}>
      {!selectedFile ? (
        <div 
          className={`${styles.uploadBox} ${isDragActive ? styles.active : ''}`}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={handleClick}
        >
          <input 
            ref={inputRef}
            type="file" 
            accept="application/pdf" 
            onChange={handleChange} 
            className={styles.input} 
          />
          
          <div className={styles.uploadIcon}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
          </div>
          <h3 className={styles.title}>Drag & Drop your PDF</h3>
          <p className={styles.subtitle}>or click to browse files (Max 10MB)</p>
        </div>
      ) : (
        <div className={styles.settingsCard}>
          <div className={styles.filePreview}>
            <div className={styles.fileIcon}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
            </div>
            <div className={styles.fileInfo}>
              <div className={styles.fileName}>{selectedFile.name}</div>
              <div className={styles.fileSize}>{formatSize(selectedFile.size)}</div>
            </div>
          </div>

          <div className={styles.settingsGrid}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Questions Count</label>
              <select 
                value={questionCount} 
                onChange={(e) => setQuestionCount(Number(e.target.value))}
                className={styles.selectInput}
              >
                <option value={5}>5 Questions</option>
                <option value={10}>10 Questions</option>
                <option value={15}>15 Questions</option>
                <option value={20}>20 Questions</option>
                <option value={25}>25 Questions</option>
                <option value={30}>30 Questions</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Difficulty Level</label>
              <select 
                value={difficulty} 
                onChange={(e) => setDifficulty(e.target.value)}
                className={styles.selectInput}
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
                <option value="University/Expert">University/Expert</option>
              </select>
            </div>
          </div>

          <div className={styles.buttonGroup}>
            <button 
              type="button" 
              onClick={handleCancel} 
              className={styles.btnCancel}
              disabled={isUploading}
            >
              Cancel
            </button>
            <button 
              type="button" 
              onClick={handleGenerate} 
              className={styles.btnSubmit}
              disabled={isUploading}
            >
              Generate Quiz
            </button>
          </div>
        </div>
      )}

      {isUploading && (
        <div className={styles.uploadingOverlay}>
          <div className={styles.spinner}></div>
          <p style={{ fontWeight: 500, fontSize: '1.05rem', color: '#fff' }}>Analyzing PDF with Gemini AI...</p>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
            Generating {questionCount} {difficulty} questions
          </p>
        </div>
      )}
    </div>
  );
}
