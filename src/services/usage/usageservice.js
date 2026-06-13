import { supabase } from "../supabase/supabase";

export async function getUsage(userId) {

  const { data, error } =
    await supabase

      .from("counts")

      .select("*")

      .eq("user_id", userId)

      .maybeSingle();

  if (error) {
    console.log(error);
    return null;
  }

  return data;
}



export async function incrementUsage(
  userId,
  field
) {

  const usage =
    await getUsage(userId);

  // Create row if missing
  if (!usage) {

    const initialData = {
      user_id: userId,
      pdf_count: 0,
      question_count: 0,
      image_count: 0,
    };

    initialData[field] = 1;

    const { error } =
      await supabase
        .from("counts")
        .insert(initialData);

    if (error) {
      console.log(error);
    }

    return;
  }

  const current =
    usage[field] || 0;

  const { error } =
    await supabase
      .from("counts")
      .update({
        [field]: current + 1,
      })
      .eq("user_id", userId);

  if (error) {
    console.log(error);
  }
}