import { supabase } from "../supabase/supabase";



// ================= SAVE SCORE =================
export async function saveScore(

  userId,
  subject,
  score

) {

  const { data, error } =
    await supabase

      .from("scores")

      .insert([

        {
          user_id: userId,
          subject,
          score,
        },

      ]);

  return { data, error };
}




// ================= GET SCORES =================
export async function getScores() {

  const { data, error } =
    await supabase

      .from("scores")

      .select("*")

      .order(
        "score",
        { ascending: false }
      );

  return { data, error };
}