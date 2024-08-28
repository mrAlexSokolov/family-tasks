import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
} from "firebase/auth";

import { ref } from "vue";
import { defineStore } from "pinia";
//

//

//
export const useAuthStore = defineStore("auth", () => {
  const userId = ref("");
  const userEmail = ref("");
  const familyName = ref("");
  const subMenu = ref(false);
  const useBackground = ref(false);
  const authError = ref(false);
  const toastText = ref("");
  const justRegistered = ref(false);
  //

  // S I G N  I N
  const signIn = async (email, password) => {
    try {
      await signInWithEmailAndPassword(getAuth(), email, password);
      onAuthStateChanged(getAuth(), (user) => {
        if (user) {
          userId.value = user.uid;
          userEmail.value = user.email;
          authError.value = false;
          toastText.value = "";
          justRegistered.value = false;
        } else {
          userId.value = "";
          userEmail.value = "";
          familyName.value = "";
          authError.value = true;
          toastText.value = "Invalid credentinal";
        }
      });
    } catch (error) {
      authError.value = true;
      toastText.value = error.message;
    } finally {
      //
    }
  };
  //

  // S I G N  U P
  const signUp = async (email, password) => {
    try {
      await createUserWithEmailAndPassword(getAuth(), email, password);
      onAuthStateChanged(getAuth(), (user) => {
        if (user) {
          userId.value = user.uid;
          userEmail.value = user.email;
          authError.value = false;
          toastText.value = "";
          justRegistered.value = true;
        } else {
          justRegistered.value = false;
          userId.value = "";
          userEmail.value = "";
          familyName.value = "";
          authError.value = true;
          toastText.value = "Invalid credentinal";
        }
      });
    } catch (error) {
      justRegistered.value = false;
      authError.value = true;
      toastText.value = error.message;
    } finally {
      //
    }
  };
  return {
    userId,
    userEmail,
    authError,
    toastText,
    justRegistered,
    familyName,
    subMenu,
    useBackground,
    signIn,
    signUp,
  };
});
