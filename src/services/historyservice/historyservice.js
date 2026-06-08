import { supabase } from "../supabase/supabase";

// ================= SAVE QUIZ ATTEMPT =================

export async function saveQuizAttempt(data) {

  try {

    const payload = {

      user_id: data.user_id,

      username:
        data.username || "Player",

      subject:
        data.subject || "Quiz",

      score:
        Number(data.score) || 0,

      mode:
        data.multiplayer
          ? "multiplayer"
          : "singleplayer",
    };

    console.log(
      "Saving score:",
      payload
    );

    const {
      data: result,
      error,
    } = await supabase
      .from("scores")
      .insert([payload])
      .select();

    if (error) {

      console.log(
        "SCORE SAVE ERROR:",
        error
      );

      return {
        error,
      };
    }

    return {
      data: result,
    };

  } catch (err) {

    console.log(
      "SAVE ERROR:",
      err
    );

    return {
      error: err,
    };
  }
}