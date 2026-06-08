import { supabase } from "../supabase/supabase";

export async function
getUserAnalytics(userId) {

  const {
    data: attempts,
  } = await supabase
    .from("quiz_attempts")
    .select("*")
    .eq("user_id", userId);

  const {
    data: quizzes,
  } = await supabase
    .from("quizzes")
    .select("id")
    .eq("user_id", userId);

  const totalQuizzes =
    attempts?.length || 0;

  const highestScore =
    Math.max(
      ...(attempts || [])
        .map(
          (a) =>
            a.percentage || 0
        ),
      0
    );

  const accuracy =
    totalQuizzes
      ? Math.round(
          attempts.reduce(
            (sum, item) =>
              sum +
              (item.percentage || 0),
            0
          ) /
            totalQuizzes
        )
      : 0;

  const totalSubjects =
    new Set(
      (attempts || []).map(
        (a) => a.subject
      )
    ).size;

  return {
    totalQuizzes,
    highestScore,
    accuracy,
    totalSubjects,
    pdfCount:
      quizzes?.length || 0,
  };
}