<script setup>
import { useAuthStore } from "@/stores/authStore";
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useToast } from "primevue/usetoast";

import { getFirestore, setDoc, doc, getDoc } from "firebase/firestore";

const db = getFirestore();

const isLogin = ref(true);
const email = ref("");
const password = ref("");
const familyName = ref("");
const showPassword = ref(false);
const isLoading = ref(false);

const router = useRouter();
const toast = useToast();

const authStore = useAuthStore();

const subtitleText = computed(() => {
  return isLogin.value
    ? "Don't have an account?"
    : "Are you already registered?";
});

const linkAccountText = computed(() => {
  return isLogin.value ? "Register here" : "Login here";
});

const submitButtonText = computed(() => {
  return isLogin.value ? "Sign In" : "Sign Up";
});
//
const toggleAuth = () => {
  isLogin.value = !isLogin.value;
};
//
//
const checkFamily = async (userId, family) => {
  const docref = doc(db, `fusers/${userId}/family`, family);
  try {
    const docSnap = await getDoc(docref);
    return docSnap.data();
  } catch (error) {
    console.log(error);
    return null;
  }
};
//
const createFamily = async (userId, family) => {
  await setDoc(doc(db, `fusers/${userId}/family`, family), {
    name: family,
    status: true,
    subMenu: true,
  });
};
//
const submitForm = async () => {
  if (!isLogin.value) {
    // SIGN UP
    isLoading.value = true;
    await authStore.signUp(email.value, password.value, familyName.value);

    isLoading.value = false;
    if (authStore.authError) {
      toast.add({
        severity: "error",
        summary: "Error",
        detail: authStore.toastText,
        life: 3000,
      });
    } else {
      await createFamily(authStore.userId, familyName.value);
      authStore.familyName = familyName.value;
      localStorage.setItem("familyName", familyName.value);
      localStorage.setItem("subMenu", JSON.stringify({ subMenu: true }));
      router.push("/");
    }
  } else {
    // SIGN IN
    isLoading.value = true;
    await authStore.signIn(email.value, password.value);
    //
    let isFamily = "";
    if (authStore.userId) {
      isFamily = await checkFamily(authStore.userId, familyName.value);
      if (!isFamily) {
        authStore.userId = "";
        authStore.authError = true;
        authStore.toastText = "Family name is not defined";
        authStore.familyName = "";
      } else {
        authStore.subMenu = isFamily.subMenu;
        authStore.familyName = familyName.value;
        localStorage.setItem("familyName", familyName.value);
        localStorage.setItem(
          "subMenu",
          JSON.stringify({ subMenu: authStore.subMenu })
        );
      }
    }

    isLoading.value = false;
    //
    if (authStore.authError) {
      toast.add({
        severity: "error",
        summary: "Error",
        detail: authStore.toastText,
        life: 3000,
      });
    } else {
      router.push("/");
    }
  }
};
//
//
//
</script>
<template>
  <Toast position="top-right" />
  <div class="flex justify-content-center p-2">
    <div class="surface-card p-4 shadow-2 border-round w-full lg:w-4">
      <div class="text-center mb-3">
        <div class="text-900 text-3xl font-medium mb-3">Welcome</div>
        <span class="text-500 font-medium line-height-3">{{
          subtitleText
        }}</span>
        <a
          class="font-medium no-underline ml-2 text-blue-500 cursor-pointer"
          @click="toggleAuth"
        >
          {{ linkAccountText }}
        </a>
      </div>

      <form @submit.prevent="submitForm">
        <div class="p-inputgroup flex-1 text-900 font-medium mb-3">
          <span class="p-inputgroup-addon">
            <i class="pi pi-users"></i>
          </span>
          <InputText
            type="text"
            placeholder="Your Name"
            v-model="familyName"
            id="familyName"
          />
        </div>
        <div class="p-inputgroup flex-1 text-900 font-medium mb-3">
          <span class="p-inputgroup-addon">
            <i class="pi pi-at"></i>
          </span>
          <InputText
            type="email"
            placeholder="Your Email"
            v-model="email"
            id="email1"
          />
        </div>
        <div class="p-inputgroup flex-1 text-900 font-medium mb-5">
          <span class="p-inputgroup-addon">
            <i
              :class="!showPassword ? 'pi pi-eye-slash' : 'pi pi-eye'"
              style="color: cornflowerblue; cursor: pointer"
              @click="showPassword = !showPassword"
            ></i>
          </span>
          <InputText
            :type="!showPassword ? 'password' : 'text'"
            placeholder="Password"
            v-model="password"
            id="password1"
          />
        </div>

        <Button
          :label="submitButtonText"
          type="submit"
          icon="pi pi-user"
          :loading="isLoading"
          class="w-full"
        ></Button>
      </form>
    </div>
  </div>
</template>
