import { supabase } from "../supabase/supabase";



// ================= CREATE ROOM =================
export async function createRoom(

  roomCode,
  hostId

) {

  const { data, error } =
    await supabase

      .from("rooms")

      .insert([

        {
          room_code: roomCode,
          host_id: hostId,
        },

      ]);

  return { data, error };
}




// ================= JOIN ROOM =================
export async function joinRoom(
  roomCode,
  userId,
  username,
  avatarUrl
) {

  const { data, error } =
    await supabase
      .from("room_players")
      .upsert({
        room_code: roomCode,
        user_id: userId,
        username,
        avatar_url: avatarUrl,
        score: 0,
      });

  if (error) {

    console.log(
      "JOIN ROOM ERROR:",
      error
    );
  }

  return { data, error };
}




// ================= GET PLAYERS =================
export async function getRoomPlayers(
  roomCode
) {

  const { data, error } =
    await supabase

      .from("room_players")

      .select("*")

      .eq(
        "room_code",
        roomCode
      );

  return { data, error };
}


// ================= UPDATE PLAYER SCORE =================
export async function updatePlayerScore(

  roomCode,
  userId,
  newScore

) {

  const { data, error } =
    await supabase

      .from("room_players")

      .update({

        score: newScore,

      })

      .eq(
        "room_code",
        roomCode
      )

      .eq(
        "user_id",
        userId
      );

  return { data, error };
}