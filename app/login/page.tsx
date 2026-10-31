import LoginForm from "./login-form";

export const metadata = { title: "Sign in · Bella del Gelato" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ setup?: string; reset?: string }> }) {
  const params = await searchParams;
  return <LoginForm showSetup={params.setup === "1"} reset={params.reset === "1"} />;
}
