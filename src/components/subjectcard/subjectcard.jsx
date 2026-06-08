import { Link } from "react-router-dom";

import "./subjectcard.css";

function SubjectCard({ subject }) {

  return (

    <Link
      to={`/subject/${encodeURIComponent(subject.name)}`}
      className="subject-card-link"
    >

      <div className="subject-card">

        <div className="subject-card-top">

          <span className="subject-category">

            {subject.category}

          </span>

        </div>

        <h2 className="subject-title">

          {subject.name}

        </h2>

        <p className="subject-description">

          {
            subject.description ||
            "AI generated study subject."
          }

        </p>

        <div className="subject-stats">

          <div className="subject-stat">

            <h3>

              {subject.total_questions || 0}

            </h3>

            <span>
              Questions
            </span>

          </div>

          <div className="subject-stat">

            <h3>

              {subject.total_pdfs || 0}

            </h3>

            <span>
              PDFs
            </span>

          </div>

        </div>

        <button className="open-subject-btn">

          Open Subject

        </button>

      </div>

    </Link>
  );
}

export default SubjectCard;