/**
 * Professional Login page - Redirects to enhanced experience.
 * This redirect happens server-side to avoid wasteful rendering.
 */
import { redirect } from 'next/navigation';

type Props = {
  searchParams: { email?: string };
};

export default function LoginPage({ searchParams }: Props) {
  // Server-side redirect to enhanced experience
  const emailParam = searchParams.email;
  redirect(`/auth/login-experience${emailParam ? `?email=${emailParam}` : ''}`);
}
