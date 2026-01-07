import React, { useState, useEffect } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css"; // Import Quill styles
import "../../styles/AboutUsEditor.css";

// Import images
import closeIcon from "../../images/Candidate Profile Page Images/corss icon.png";

// Define the props interface for the component
interface AboutUsEditorProps {
  currentAbout: string; // Current about text from the user's profile
  isOpen: boolean; // Whether the modal is open
  onClose: () => void; // Function to close the modal
  onSave: (aboutText: string) => Promise<void>; // Function to save the about text
}

// Define modules configuration for React Quill editor
const modules = {
  toolbar: [
    // Text formatting options
    [{ header: [1, 2, 3, false] }], // Header sizes (H1, H2, H3, Normal)
    ["bold", "italic", "underline", "strike"], // Basic text formatting
    [{ list: "ordered" }, { list: "bullet" }], // Lists (ordered and bullet)

    // Text alignment
    [{ align: [] }],

    // Indentation
    [{ indent: "-1" }, { indent: "+1" }],

    // Color options
    [{ color: [] }, { background: [] }],

    // Clean formatting
    ["clean"],

    // Link and image
    ["link", "image"],

    // Blockquote and code block
    ["blockquote", "code-block"],
  ],
};

// Define formats that the editor will support
const formats = [
  "header",
  "bold",
  "italic",
  "underline",
  "strike",
  "list",
  "bullet",
  "indent",
  "align",
  "color",
  "background",
  "link",
  "image",
  "blockquote",
  "code-block",
];

/**
 * AboutUsEditor Component
 * A rich text editor modal for editing the "About Me" section
 * Uses React Quill for WYSIWYG editing experience
 */
const AboutUsEditor: React.FC<AboutUsEditorProps> = ({
  currentAbout,
  isOpen,
  onClose,
  onSave,
}) => {
  // State for the about text
  const [aboutText, setAboutText] = useState<string>(currentAbout || "");

  // State for loading/saving indicator
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Initialize state when modal opens
  useEffect(() => {
    if (isOpen) {
      // Reset to current about text when modal opens
      setAboutText(currentAbout || "");
      setIsSaving(false);
    }
  }, [isOpen, currentAbout]);

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

  /**
   * Handle text change in the editor
   * @param content - The HTML content from the editor
   */
  const handleTextChange = (content: string) => {
    setAboutText(content);
  };

  /**
   * Save the about text
   * Calls the onSave prop function and closes modal on success
   */
  const handleSubmit = async () => {
    try {
      setIsSaving(true);
      await onSave(aboutText.trim());
      onClose();
    } catch (error) {
      console.error("Error saving about information:", error);
      // You could add error state here to show error message to user
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Cancel editing and close modal
   * Resets form to original values
   */
  const handleCancel = () => {
    setAboutText(currentAbout || "");
    onClose();
  };

  /**
   * Handle click on overlay to close modal
   * Only closes if click is directly on overlay (not modal content)
   */
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      handleCancel();
    }
  };

  // Don't render anything if modal is not open
  if (!isOpen) return null;

  return (
    <div className="about-us-modal-overlay" onClick={handleOverlayClick}>
      <div
        className="about-us-modal-container"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button - Top right corner */}
        <button
          className="about-us-close-button"
          aria-label="Close editor"
          onClick={handleCancel}
          disabled={isSaving}
        >
          <img src={closeIcon} alt="Close Icon" />
        </button>

        <div className="about-us-modal-content">
          {/* Header Section */}
          <header className="about-us-modal-header">
            <h2 className="about-us-modal-title">About Me Editor</h2>
            <p className="about-us-modal-subtitle">
              Write about yourself, your experience, and your goals
            </p>
          </header>

          {/* Rich Text Editor Section */}
          <div className="about-us-editor-wrapper">
            <ReactQuill
              theme="snow"
              value={aboutText}
              onChange={handleTextChange}
              modules={modules}
              formats={formats}
              placeholder="Write about yourself here... 
              
You can include:
• Your professional background and experience
• Skills and expertise
• Education and certifications
• Career goals and aspirations
• Personal interests and hobbies
• Any other relevant information..."
              className="about-us-quill-editor"
              readOnly={isSaving}
            />
          </div>

          {/* Editor Tips */}
          <div className="about-us-editor-tips">
            <h4 className="about-us-tips-title">Editor Tips:</h4>
            <ul className="about-us-tips-list">
              <li>
                Use headers to organize sections (About Me, Experience,
                Education, etc.)
              </li>
              <li>
                Use bullet points or numbered lists for skills and achievements
              </li>
              <li>
                Add links to your portfolio, LinkedIn, or other relevant sites
              </li>
              <li>
                Keep it professional but personal - let your personality shine
                through
              </li>
              <li>Proofread before saving</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="about-us-action-buttons">
            <button
              className="about-us-btn about-us-btn-cancel"
              onClick={handleCancel}
              disabled={isSaving}
              type="button"
            >
              Cancel
            </button>
            <button
              className="about-us-btn about-us-btn-save"
              onClick={handleSubmit}
              disabled={isSaving}
              type="button"
            >
              {isSaving ? "Saving..." : "Save About Me"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUsEditor;
