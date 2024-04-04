'use server';

import { redirect, RedirectType } from 'next/navigation';

export async function navigate(data: string) {
  redirect(`${data}`, 'replace' as RedirectType);
}
