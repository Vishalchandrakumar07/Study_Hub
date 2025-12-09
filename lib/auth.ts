export function validateAdminLogin(email: string, password: string) {
  return (
    email === process.env.NEXT_PUBLIC_ADMIN_EMAIL &&
    password === process.env.ADMIN_PASSWORD
  );
}
