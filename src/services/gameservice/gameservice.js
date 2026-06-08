import { supabase } from "../supabase/supabase";



// ================= CREATE GAME =================
export async function createGame(
  roomCode,
  quizId,
  quizTitle
) {

  return await supabase
    .from("game_state")
    .insert({

      room_code: roomCode,

      quiz_id: quizId,

      quiz_title: quizTitle,

      current_question: 0,

      game_started: false,

      game_ended: false,

      winner_name: null,

    });
}



// ================= START GAME =================
export async function startGame(
  roomCode
) {

  const { data, error } =
    await supabase

      .from("game_state")

      .update({

        game_started: true,

      })

      .eq(
        "room_code",
        roomCode
      );

  return { data, error };
}




// ================= NEXT QUESTION =================
export async function nextQuestion(

  roomCode,
  questionNumber

) {

  const { data, error } =
    await supabase

      .from("game_state")

      .update({

        current_question:
          questionNumber,

      })

      .eq(
        "room_code",
        roomCode
      );

  return { data, error };
}




// ================= GET GAME =================
export async function getGame(
  roomCode
) {

  const { data, error } =
    await supabase

      .from("game_state")

      .select("*")

      .eq(
        "room_code",
        roomCode
      )

      .single();

  return { data, error };
}