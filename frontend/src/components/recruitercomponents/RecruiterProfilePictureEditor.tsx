import React, { useState, useRef, useEffect } from "react";
import "../../styles/RecruiterProfilePictureEditor.css";

// Import images
import defaultAvatar from "../../images/Register Page Images/Default Profile.webp";
import closeIcon from "../../images/Candidate Profile Page Images/corss icon.png";
import uploadIcon from "../../images/Recruiter Profile Page Images/6_10.svg";
import cameraIcon from "../../images/Recruiter Profile Page Images/cameraIcon.svg";

interface RecruiterProfilePictureEditorProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { imageFile?: File | null }) => Promise<void>; // Remove currentJobTitle from here
  currentImage?: string;
  // Remove currentJobTitle from props
}

const RecruiterProfilePictureEditor: React.FC<
  RecruiterProfilePictureEditorProps
> = ({ isOpen, onClose, onSave, currentImage }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(
    currentImage || defaultAvatar
  );
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update preview when currentImage changes
  useEffect(() => {
    if (currentImage) {
      setPreviewUrl(currentImage);
    }
  }, [currentImage]);

  // Handle file selection from input
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);

      // Create preview URL for the selected file
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Trigger file input click
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  // Remove selected file and reset to default avatar
  const handleRemove = () => {
    setSelectedFile(null);
    setPreviewUrl(defaultAvatar);
  };

  // Save changes and close editor
  const handleSave = async () => {
    try {
      setIsLoading(true);
      await onSave({
        imageFile:
          selectedFile === null && previewUrl === defaultAvatar
            ? null
            : selectedFile,
      });
      onClose();
    } catch (error) {
      console.error("Error saving profile picture:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="profile-picture-editor-overlay">
      <div className="profile-picture-editor-modal">
        <div className="profile-picture-editor-header">
          <h2>Edit Company Logo</h2>
          <button className="close-button" onClick={onClose}>
            <img src={closeIcon} alt="Close" />
          </button>
        </div>

        <div className="profile-picture-editor-content">
          {/* Profile Preview - Larger preview for better visibility */}
          <div className="profile-preview-container">
            <div className="profile-preview-wrapper recruiter-preview">
              <img
                src={previewUrl}
                alt="Logo Preview"
                className="profile-preview-image"
                onError={(e) => {
                  e.currentTarget.src = defaultAvatar;
                }}
              />
            </div>
            <p className="preview-label">Company Logo Preview</p>
          </div>

          {/* Upload Options */}
          <div className="upload-options">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept="image/*"
              className="file-input"
            />

            <button className="upload-button" onClick={handleUploadClick}>
              <img src={cameraIcon} alt="Upload" />
              Upload New Logo
            </button>

            {/* Remove button with centered text */}
            <button className="remove-button" onClick={handleRemove}>
              <span>Remove Logo</span>
            </button>
          </div>

          {/* REMOVED JOB TITLE INPUT SECTION */}

          {/* File Info */}
          <div className="file-info">
            <p>Recommended: 400×400px (JPG, PNG). Max Size 2MB</p>
          </div>
        </div>

        <div className="profile-picture-editor-actions">
          <button
            className="cancel-button"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            className="save-button"
            onClick={handleSave}
            disabled={isLoading}
          >
            {isLoading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecruiterProfilePictureEditor;
