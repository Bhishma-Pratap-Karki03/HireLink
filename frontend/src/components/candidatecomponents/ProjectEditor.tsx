import React, { useState, useRef, ChangeEvent, useEffect } from "react";
import "../../styles/ProjectEditor.css";

// Import images
import closeIcon from "../../images/Candidate Profile Page Images/corss icon.png";
import trashIcon from "../../images/Candidate Profile Page Images/trash.png";
import uploadIcon from "../../images/Candidate Profile Page Images/upload-icon.svg";
import editIcon from "../../images/Candidate Profile Page Images/261_2045.svg";

// Define the Project interface
export interface Project {
  _id?: string;
  projectTitle: string;
  projectDescription: string;
  coverImage: string;
  coverImageFileName: string;
  coverImageFileSize: number;
  startDate: string;
  endDate: string | null;
  isOngoing: boolean;
  projectUrl: string;
  technologies: string[];
  createdAt?: string;
  updatedAt?: string;
}

// Define the props interface for the component
interface ProjectEditorProps {
  project: Project | null; // Current project data (null for adding new)
  isOpen: boolean; // Whether the modal is open
  onClose: () => void; // Function to close the modal
  onSave: (projectData: FormData) => Promise<void>; // Function to save the project
}

/**
 * ProjectEditor Component
 * A modal for adding/editing projects with cover image upload
 */
const ProjectEditor: React.FC<ProjectEditorProps> = ({
  project,
  isOpen,
  onClose,
  onSave,
}) => {
  // State for form fields
  const [projectTitle, setProjectTitle] = useState<string>("");
  const [projectDescription, setProjectDescription] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [isOngoing, setIsOngoing] = useState<boolean>(false);
  const [projectUrl, setProjectUrl] = useState<string>("");
  const [technologies, setTechnologies] = useState<string>("");

  // State for loading/saving indicator
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize state when modal opens
  useEffect(() => {
    if (isOpen) {
      if (project) {
        // Editing existing project
        setProjectTitle(project.projectTitle || "");
        setProjectDescription(project.projectDescription || "");
        setSelectedFile(null);
        setStartDate(
          project.startDate
            ? new Date(project.startDate).toISOString().split("T")[0]
            : ""
        );
        setEndDate(
          project.endDate
            ? new Date(project.endDate).toISOString().split("T")[0]
            : ""
        );
        setIsOngoing(project.isOngoing || false);
        setProjectUrl(project.projectUrl || "");
        setTechnologies(project.technologies?.join(", ") || "");
      } else {
        // Adding new project - empty dates as requested
        setProjectTitle("");
        setProjectDescription("");
        setSelectedFile(null);
        setStartDate(""); // Empty as requested
        setEndDate(""); // Empty as requested
        setIsOngoing(false);
        setProjectUrl("");
        setTechnologies("");
      }
      setIsSaving(false);
      setError(null);
      setShowRemoveConfirm(false);
    }
  }, [isOpen, project]);

  // Handle Escape key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        handleCancel();
      }
    };

    // Add event listener for Escape key
    document.addEventListener("keydown", handleEscape);

    // Cleanup event listener
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    // Cleanup function to restore scroll
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  // Handle file select
  const handleFileSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type - Only images
      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
        "image/gif",
      ];
      const allowedExtensions = [".jpg", ".jpeg", ".png", ".webp", ".gif"];

      if (!allowedTypes.includes(file.type)) {
        setError("Only image files are allowed (JPG, JPEG, PNG, WEBP, GIF)");
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size too large. Maximum size is 5MB");
        return;
      }

      setSelectedFile(file);
      setError(null);
      setShowRemoveConfirm(false);
    }
  };

  // Handle remove cover image
  const handleRemoveImage = () => {
    if (project?.coverImage && !selectedFile) {
      // If there's an existing cover image and no new file selected, show confirmation
      setShowRemoveConfirm(true);
    } else {
      // If there's a newly selected file, just clear it
      setSelectedFile(null);
      setError(null);
      setShowRemoveConfirm(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Confirm remove cover image
  const confirmRemoveImage = () => {
    setSelectedFile(null);
    setShowRemoveConfirm(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Cancel remove cover image
  const cancelRemoveImage = () => {
    setShowRemoveConfirm(false);
  };

  // Trigger file input
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: string[] = [];

    if (!projectTitle.trim()) {
      newErrors.push("Project title is required");
    }

    if (!startDate && !isOngoing) {
      newErrors.push("Start date is required");
    }

    if (!isOngoing && endDate && startDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (end < start) {
        newErrors.push("End date cannot be before start date");
      }
    }

    if (newErrors.length > 0) {
      setError(newErrors.join(". "));
      return false;
    }

    setError(null);
    return true;
  };

  /**
   * Save the project
   */
  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setIsSaving(true);
      setError(null);

      // Create FormData for file upload
      const formData = new FormData();
      formData.append("projectTitle", projectTitle.trim());
      formData.append("projectDescription", projectDescription.trim());
      formData.append("startDate", startDate);
      formData.append("isOngoing", isOngoing.toString());

      if (!isOngoing && endDate) {
        formData.append("endDate", endDate);
      }

      if (projectUrl.trim()) {
        formData.append("projectUrl", projectUrl.trim());
      }

      if (technologies.trim()) {
        formData.append("technologies", technologies.trim());
      }

      if (selectedFile) {
        formData.append("coverImage", selectedFile);
      } else if (showRemoveConfirm) {
        // This indicates we want to remove existing image
        formData.append("removeCoverImage", "true");
      }

      if (project?._id) {
        formData.append("_id", project._id);
      }

      await onSave(formData);
      onClose();
    } catch (error) {
      console.error("Error saving project:", error);
      setError(
        error instanceof Error ? error.message : "Failed to save project"
      );
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Cancel editing and close modal
   */
  const handleCancel = () => {
    setError(null);
    setShowRemoveConfirm(false);
    onClose();
  };

  /**
   * Handle click on overlay to close modal
   */
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      handleCancel();
    }
  };

  /**
   * Handle is ongoing checkbox change
   */
  const handleIsOngoingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsOngoing(e.target.checked);
    if (e.target.checked) {
      setEndDate("");
    }
  };

  // Helper function to truncate filename
  const truncateFileName = (
    fileName: string,
    maxLength: number = 20
  ): string => {
    if (!fileName) return "";

    if (fileName.length <= maxLength) return fileName;

    const extensionIndex = fileName.lastIndexOf(".");
    if (extensionIndex === -1) {
      return fileName.substring(0, maxLength) + "...";
    }

    const name = fileName.substring(0, extensionIndex);
    const extension = fileName.substring(extensionIndex);
    const maxNameLength = maxLength - extension.length - 3;

    if (name.length <= maxNameLength) return fileName;

    return name.substring(0, maxNameLength) + "..." + extension;
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Get current file info
  const getCurrentFileInfo = () => {
    if (selectedFile) {
      return {
        name: selectedFile.name,
        size: selectedFile.size,
      };
    } else if (project?.coverImageFileName) {
      return {
        name: project.coverImageFileName,
        size: project.coverImageFileSize || 0,
      };
    }
    return null;
  };

  // Don't render anything if modal is not open
  if (!isOpen) return null;

  const currentFileInfo = getCurrentFileInfo();
  const hasCoverImage =
    currentFileInfo || (project?.coverImage && !showRemoveConfirm);

  return (
    <div
      className="project-showcase-modal-overlay"
      onClick={handleOverlayClick}
    >
      <div
        className="project-showcase-modal-container"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          className="project-showcase-close-button"
          aria-label="Close editor"
          onClick={handleCancel}
          disabled={isSaving}
        >
          <img src={closeIcon} alt="Close Icon" />
        </button>

        <div className="project-showcase-modal-content">
          {/* Header Section */}
          <header className="project-showcase-modal-header">
            <h2 className="project-showcase-modal-title">
              {project ? "Edit Project" : "Add Project"}
            </h2>
            <p className="project-showcase-modal-subtitle">
              {project
                ? "Update your project details"
                : "Add a new project to showcase your work"}
            </p>
          </header>

          {/* Form Section */}
          <div className="project-showcase-form">
            <div className="project-showcase-form-fields-wrapper">
              {/* Project Title and URL in same row */}
              <div className="project-showcase-form-row">
                <div className="project-showcase-form-group project-showcase-form-group-half">
                  <label
                    className="project-showcase-form-label"
                    data-required="*"
                  >
                    Project Title
                  </label>
                  <input
                    type="text"
                    value={projectTitle}
                    onChange={(e) => setProjectTitle(e.target.value)}
                    placeholder="e.g., Mobile E-Wallet App"
                    className={`project-showcase-form-input ${
                      error?.includes("Project title") ? "error" : ""
                    }`}
                    disabled={isSaving}
                  />
                </div>

                <div className="project-showcase-form-group project-showcase-form-group-half">
                  <label className="project-showcase-form-label">
                    Project URL
                  </label>
                  <input
                    type="url"
                    value={projectUrl}
                    onChange={(e) => setProjectUrl(e.target.value)}
                    placeholder="https://your-project.com"
                    className="project-showcase-form-input"
                    disabled={isSaving}
                  />
                </div>
              </div>

              {/* Technologies Used - Full width */}
              <div className="project-showcase-form-group">
                <label className="project-showcase-form-label">
                  Technologies Used
                </label>
                <input
                  type="text"
                  value={technologies}
                  onChange={(e) => setTechnologies(e.target.value)}
                  placeholder="e.g., React, Node.js, MongoDB, Figma"
                  className="project-showcase-form-input"
                  disabled={isSaving}
                />
                <p className="project-showcase-field-help">
                  Separate technologies with commas
                </p>
              </div>

              {/* Start Date and End Date in same row */}
              <div className="project-showcase-form-row">
                <div className="project-showcase-form-group project-showcase-form-group-half">
                  <label className="project-showcase-form-label">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className={`project-showcase-form-input ${
                      error?.includes("Start date") ? "error" : ""
                    }`}
                    disabled={isSaving}
                    max={new Date().toISOString().split("T")[0]}
                  />
                </div>

                <div className="project-showcase-form-group project-showcase-form-group-half">
                  <label className="project-showcase-form-label">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className={`project-showcase-form-input ${
                      error?.includes("End date") ? "error" : ""
                    }`}
                    disabled={isSaving || isOngoing}
                    min={startDate}
                    max={new Date().toISOString().split("T")[0]}
                  />
                </div>
              </div>

              {/* Is Ongoing Checkbox */}
              <div className="project-showcase-checkbox-group">
                <label className="project-showcase-checkbox-label">
                  <input
                    type="checkbox"
                    checked={isOngoing}
                    onChange={handleIsOngoingChange}
                    disabled={isSaving}
                    className="project-showcase-checkbox"
                  />
                  <span className="project-showcase-checkbox-text">
                    This project is currently ongoing
                  </span>
                </label>
              </div>

              {/* Cover Image Upload Area - Similar to resume upload */}
              <div
                className="project-showcase-upload-area"
                onClick={triggerFileInput}
              >
                <div className="project-showcase-upload-icon">
                  <img
                    src={uploadIcon}
                    alt="Upload"
                    className="project-showcase-upload-icon-image"
                  />
                </div>
                <div className="project-showcase-upload-text">
                  <p className="project-showcase-upload-title">
                    Click to upload cover image
                  </p>
                  <p className="project-showcase-upload-subtitle">
                    Supported files: .jpg, .jpeg, .png, .webp, .gif (Max size:
                    5MB)
                  </p>
                </div>
              </div>

              {/* File Info Row - Show current or selected file */}
              {hasCoverImage && (
                <div className="project-showcase-file-row">
                  <div className="project-showcase-file-info">
                    <div className="project-showcase-file-details">
                      <span
                        className="project-showcase-file-name"
                        title={
                          currentFileInfo?.name || project?.coverImageFileName
                        }
                      >
                        {truncateFileName(
                          currentFileInfo?.name ||
                            project?.coverImageFileName ||
                            ""
                        )}
                      </span>
                      <span className="project-showcase-file-size">
                        {formatFileSize(
                          currentFileInfo?.size ||
                            project?.coverImageFileSize ||
                            0
                        )}
                      </span>
                    </div>
                  </div>
                  <button
                    className="project-showcase-remove-button"
                    onClick={handleRemoveImage}
                    disabled={isSaving}
                  >
                    <img
                      src={trashIcon}
                      alt="Trash Icon"
                      className="project-showcase-icon-trash"
                    />
                    <span className="project-showcase-remove-text">Remove</span>
                  </button>
                </div>
              )}

              {/* Remove Confirmation Dialog */}
              {showRemoveConfirm && (
                <div className="project-showcase-confirm-dialog">
                  <div className="project-showcase-confirm-content">
                    <p className="project-showcase-confirm-text">
                      Are you sure you want to remove the cover image?
                    </p>
                    <div className="project-showcase-confirm-buttons">
                      <button
                        className="project-showcase-btn project-showcase-btn-cancel"
                        onClick={cancelRemoveImage}
                        disabled={isSaving}
                      >
                        Cancel
                      </button>
                      <button
                        className="project-showcase-btn project-showcase-btn-remove"
                        onClick={confirmRemoveImage}
                        disabled={isSaving}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Project Description */}
              <div className="project-showcase-form-group">
                <label className="project-showcase-form-label">
                  Project Description
                </label>
                <textarea
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  placeholder="Describe your project in detail. Include your role, responsibilities, key features you implemented, technologies used, challenges faced, and outcomes achieved..."
                  className="project-showcase-form-textarea"
                  rows={6}
                  disabled={isSaving}
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="project-showcase-error-message">
                  <span className="project-showcase-error-text">{error}</span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="project-showcase-action-buttons">
              <button
                className="project-showcase-btn project-showcase-btn-cancel"
                onClick={handleCancel}
                disabled={isSaving}
                type="button"
              >
                Cancel
              </button>
              <button
                className="project-showcase-btn project-showcase-btn-save"
                onClick={handleSave}
                disabled={isSaving}
                type="button"
              >
                {isSaving ? (
                  <>
                    <span className="project-showcase-saving-spinner"></span>
                    Saving...
                  </>
                ) : project ? (
                  "Update Project"
                ) : (
                  "Add Project"
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Hidden file input */}
        <input
          type="file"
          ref={fileInputRef}
          accept=".jpg,.jpeg,.png,.webp,.gif,image/*"
          onChange={handleFileSelect}
          style={{ display: "none" }}
        />
      </div>
    </div>
  );
};

export default ProjectEditor;
