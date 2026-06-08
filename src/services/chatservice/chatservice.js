import { supabase } from "../supabase/supabase";

// ================= SEND MESSAGE =================

export async function sendMessage(
  roomCode,
  userId,
  username,
  message
) {

  return await supabase
    .from("room_messages")
    .insert([
      {
        room_code: roomCode,
        user_id: userId,
        username,
        message,
      },
    ]);
}
// ================= GET MESSAGES =================

export async function getMessages(roomCode) {

  return await supabase
    .from("room_messages")
    .select("*")
    .eq("room_code", roomCode)
    .order("created_at", {
      ascending: true,
    });
}