import { LoginCard } from "./login-card";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const { error, next } = await searchParams;

  return <LoginCard error={error} next={next} />;
}
