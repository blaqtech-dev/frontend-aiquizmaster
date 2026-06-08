import { supabase }
from "../supabase/supabase";

// ================= CREATE =================

export async function createNotification({

  userId,

  classroomId = null,

  title,

  message,

  type = "general",

}) {

  const { error } =

    await supabase

      .from("notifications")

      .insert([

        {

          user_id: userId,

          classroom_id: classroomId,

          title,

          message,

          type,

          read: false,
        },
      ]);

  if (error) {

    console.log(error);
  }
}

// ================= MARK READ =================

export async function markNotificationRead(id) {

try {


const { error } =

  await supabase

    .from("notifications")

    .update({

      read: true,
    })

    .eq("id", id);

if (error) {

  console.log(error);
}


} catch (error) {


console.log(error);


}
}

// ================= DELETE =================

export async function deleteNotification(id) {

try {


const { error } =

  await supabase

    .from("notifications")

    .delete()

    .eq("id", id);

if (error) {

  console.log(error);
}


} catch (error) {


console.log(error);


}
}
