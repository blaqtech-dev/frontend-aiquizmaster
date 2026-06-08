export function requirePro(
  isPro,
  navigate,
  message = "This feature requires Pro."
) {

  if (isPro) return true;

  alert(message);

  navigate("/upgrade");

  return false;
}