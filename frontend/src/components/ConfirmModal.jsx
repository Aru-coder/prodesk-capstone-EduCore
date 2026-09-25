function ConfirmModal({ isOpen, title, message, onConfirm, onCancel, loading }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content confirm-modal">
        <div className="modal-header">
          <h3>⚠️ {title || "Confirm Action"}</h3>
          <button className="close-btn" onClick={onCancel}>&times;</button>
        </div>
        <div className="modal-body">
          <p>{message || "Are you sure you want to proceed with this action?"}</p>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onCancel} disabled={loading}>
            Cancel
          </button>
          <button className="btn btn-danger" onClick={onConfirm} disabled={loading}>
            {loading ? "Deleting..." : "Yes, Delete Permanently"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;
