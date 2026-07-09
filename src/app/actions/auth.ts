'use server';

import { signIn, signOut } from "../../../auth";

export async function loginWithGoogle() {
  await signIn("google", { redirectTo: "/admin" });
}

export async function logoutAction() {
  await signOut({ redirectTo: "/admin" });
}
