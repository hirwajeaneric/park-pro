// app/api/logout/route.ts
import { cookies } from 'next/headers';
export async function POST() {
  (await cookies()).delete('access-token');
  return new Response(null, { status: 200 });
}