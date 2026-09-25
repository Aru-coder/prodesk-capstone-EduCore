import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { confirmPayment } from "../services/apiService";

function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const sessionId = searchParams.get("session_id");
  const courseId = searchParams.get("course_id");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [enrollment, setEnrollment] = useState(null);

  useEffect(() => {
    const handleConfirm = async () => {
      if (!courseId) {
        setError("Missing course reference in URL.");
        setLoading(false);
        return;
      }

      try {
        const data = await confirmPayment(courseId, sessionId || "test_session");
        setEnrollment(data.enrollment);
      } catch (err) {
        console.error("Payment confirmation failed:", err);
        setError(err.message || "Failed to confirm payment.");
      } finally {
        setLoading(false);
      }
    };

    handleConfirm();
  }, [courseId, sessionId]);

  return (
    <div className="payment-success-container">
      <div className="payment-card">
        {loading ? (
          <div className="loading-spinner-box">
            <div className="spinner"></div>
            <h2>Processing Stripe Payment...</h2>
            <p>Verifying session payload with backend gateway...</p>
          </div>
        ) : error ? (
          <div className="payment-error-box">
            <div className="error-icon">❌</div>
            <h2>Payment Confirmation Issue</h2>
            <p>{error}</p>
            <button className="btn btn-primary" onClick={() => navigate("/dashboard")}>
              Return to Dashboard
            </button>
          </div>
        ) : (
          <div className="payment-success-box">
            <div className="success-icon">🎉</div>
            <h2>Payment Successful!</h2>
            <p className="subtitle">
              You are now officially enrolled in <strong>{enrollment?.courseId?.title || "your course"}</strong>.
            </p>

            <div className="receipt-details">
              <div className="receipt-row">
                <span>Transaction ID:</span>
                <code>{sessionId || "tx_stripe_test"}</code>
              </div>
              <div className="receipt-row">
                <span>Status:</span>
                <span className="status-badge">PAID (Stripe Verified)</span>
              </div>
            </div>

            <div className="payment-actions">
              <button
                className="btn btn-success"
                onClick={() => navigate(`/courses/${courseId}`)}
              >
                Start Learning Now 🚀
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => navigate("/dashboard")}
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PaymentSuccess;
