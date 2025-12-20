/**
 * Professional Login page - Redirects to enhanced experience.
 * This redirect happens server-side to avoid wasteful rendering.
 */
import { redirect } from 'next/navigation';

type Props = {
  searchParams: Promise<{ email?: string }> | { email?: string };
};

export default async function LoginPage({ searchParams }: Props) {
  // Server-side redirect to enhanced experience
  const params = await Promise.resolve(searchParams);
  const emailParam = params.email;
  redirect(`/auth/login-experience${emailParam ? `?email=${emailParam}` : ''}`);
}
