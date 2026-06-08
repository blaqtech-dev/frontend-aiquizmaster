import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../../services/supabase/supabase";
import "./gradesubmit.css";

export default function GradeSubmissionsPage() {
  const { submissionId } = useParams();

  const [submission, setSubmission] = useState(null);
  const [grade, setGrade] = useState("");
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // ================= LOAD =================
  useEffect(() => {
    loadSubmission();
  }, [submissionId]);

  async function loadSubmission() {
    setLoading(true);

    const { data, error } = await supabase
      .from("assignment_submissions")
      .select(`
        *,
        profiles (
          id,
          username,
          email,
          avatar_url
        )
      `)
      .eq("id", submissionId)
      .single();

    if (error) {
      console.log(error);
      setLoading(false);
      return;
    }

    setSubmission(data);
    setGrade(data?.score ?? "");
    setFeedback(data?.feedback ?? "");
    setLoading(false);
  }

  // ================= SAVE GRADE =================
  async function saveGrade() {
    try {
      setSaving(true);

      // 1. update grade
      const { error } = await supabase
        .from("assignment_submissions")
        .update({
          score: grade,
          feedback,
          status: "graded",
        })
        .eq("id", submissionId);

      if (error) {
        alert(error.message);
        return;
      }

      // 2. send notification (IMPORTANT FIX)
      await supabase.from("notifications").insert({
        user_id: submission.student_id, // ✅ FIXED
        type: "grade",
        message: `Your assignment has been graded (${grade}%)`,
        read: false,
      });

      alert("Graded Successfully");

      loadSubmission();
    } catch (err) {
      console.log(err);
    } finally {
      setSaving(false);
    }
  }

  // ================= UI =================
  if (loading) {
    return <div className="grade-loading">Loading submission...</div>;
  }

  if (!submission) {
    return <div className="grade-loading">Submission not found</div>;
  }

  return (
    <div className="grade-page">

      <div className="grade-header">
        <h1>Grade Submission</h1>
        <p>Review student work and assign score</p>
      </div>

      <div className="student-card">
        <img
          src={submission.profiles?.avatar_url || "/avatar.png"}
          alt=""
        />

        <div>
          <h3>{submission.profiles?.username}</h3>
          <p>{submission.profiles?.email}</p>
          <span>Status: {submission.status}</span>
        </div>
      </div>

      <div className="answer-box">
        <h3>Student Answer</h3>
        <p>{submission.answer}</p>
      </div>

      {submission.file_url && (
        <div className="file-box">
          <a
            href={submission.file_url}
            target="_blank"
            rel="noreferrer"
          >
            View Uploaded File
          </a>
        </div>
      )}

      <div className="grade-panel">
        <h3>Give Grade</h3>

        <input
          type="number"
          value={grade}
          onChange={(e) => setGrade(e.target.value)}
          placeholder="Score (0 - 100)"
        />

        <textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="Write feedback..."
        />

        <button onClick={saveGrade} disabled={saving}>
          {saving ? "Saving..." : "Save Grade"}
        </button>
      </div>
    </div>
  );
}