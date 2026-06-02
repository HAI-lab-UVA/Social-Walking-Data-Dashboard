"use client";
import { onAuthStateChanged, signInWithEmailAndPassword } from "firebase/auth";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { auth } from "./firebase-config";
import { getSWUser } from "./firebase-db";

export const checkAuthAndReroute = {
  ifAuthed: (route: string, router: AppRouterInstance): Promise<boolean> => {
    return new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        unsubscribe();
        if (user) {
          router.push(route);
          resolve(true);
        } else {
          resolve(false);
        }
      });
    });
  },
  ifNotAuthed: (route: string, router: AppRouterInstance): Promise<boolean> => {
    return new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        unsubscribe();
        if (!user) {
          router.push(route);
          resolve(true);
        } else {
          resolve(false);
        }
      });
    });
  },
  checkBothAuth: (
    ifAuthedRoute: string,
    ifNotAuthedRoute: string,
    router: AppRouterInstance,
  ): Promise<boolean> => {
    return new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        unsubscribe();

        if (user) {
          router.push(ifAuthedRoute);
          resolve(true);
        } else {
          router.push(ifNotAuthedRoute);
          resolve(false);
        }
      });
    });
  },
};

export const logout = async () => auth.signOut;

export const login = async (email: string, password: string) => {
  const userCredential = await signInWithEmailAndPassword(
    auth,
    email,
    password,
  );
  if (userCredential) {
    const authUser = await getSWUser(userCredential.user);
    if (authUser.group == "admin") {
      return true;
    } else {
      throw new Error("User does not have admin privileges");
    }
  } else {
    return false;
  }
};
