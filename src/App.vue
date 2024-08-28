<script setup>
import { RouterView } from "vue-router";
import { ref, onMounted } from "vue";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import MenuHeader from "@/components/MenuHeader.vue";

//import MenuTest from "@/components/MenuTest.vue";

import Loader from "@/components/Loader.vue";

import { useAuthStore } from "./stores/authStore";

const authStore = useAuthStore();

const isLoading = ref(true);

onMounted(() => {
  onAuthStateChanged(getAuth(), (user) => {
    if (user) {
      if (localStorage.getItem("familyName")) {
        authStore.familyName = localStorage.getItem("familyName");
        if (localStorage.getItem("subMenu")) {
          const dataMenu = JSON.parse(localStorage.getItem("subMenu"));
          //console.log(dataMenu);
          authStore.subMenu = dataMenu.subMenu;
        }
        // надо проверить в Firebase, что имя из localstorage существует в аккаунте и забрать тип меню

        //
        authStore.userId = user.uid;
        authStore.userEmail = user.email;
      } else {
        authStore.userId = "";
        authStore.familyName = "";
        authStore.userEmail = "";
      }
    } else {
      authStore.userId = "";
      authStore.familyName = "";
      authStore.userEmail = "";
    }
    isLoading.value = false;
  });
});
</script>

<template>
  <Loader v-if="isLoading" />
  <div v-else class="container">
    <MenuHeader />
    <div class="content">
      <RouterView />
    </div>
  </div>
</template>

<style scoped>
.container {
  max-width: 1200px;
  margin: auto;
}
</style>
