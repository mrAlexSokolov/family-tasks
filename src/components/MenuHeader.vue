<script setup>
import { ref, computed } from "vue";
import { useRouter, RouterLink } from "vue-router";
import { useAuthStore } from "@/stores/authStore.js";
import { getAuth, signOut } from "firebase/auth";

const authStore = useAuthStore();

const router = useRouter();

const items = ref([
  {
    label: "Sign In",
    icon: "pi pi-user",
    show: computed(() => !authStore.userId || !authStore.familyName),
    command: () => {
      router.push("/auth");
    },
  },
  {
    label: "Purchases",
    icon: "pi pi-shopping-bag",
    show: computed(() => !!authStore.userId && !!authStore.familyName),
    items: [
      {
        label: "List of purchases",
        icon: "pi pi-cart-arrow-down",
        show: computed(() => !!authStore.userId && !!authStore.familyName),
        command: () => {
          router.push("/");
        },
      },
      {
        label: "Setings",
        icon: "pi pi-cog",
        show: computed(() => !!authStore.userId && !!authStore.familyName),
        command: () => {
          router.push("/fsettings");
        },
      },
    ],
  },
  {
    label: "Catalogs",
    icon: "pi pi-clone",
    show: computed(() => !!authStore.userId && !!authStore.familyName),
    items: [
      {
        label: "Items groups",
        icon: "pi pi-book",
        show: computed(() => !!authStore.userId && !!authStore.familyName),
        command: () => {
          router.push("/groups");
        },
      },
      {
        label: "Items",
        icon: "pi pi-equals",
        show: computed(() => !!authStore.userId && !!authStore.familyName),
        command: () => {
          router.push("/items");
        },
      },
    ],
  },
]);

const itemsSimple = ref([
  {
    label: "Sign In",
    icon: "pi pi-user",
    show: computed(() => !authStore.userId || !authStore.familyName),
    command: () => {
      router.push("/auth");
    },
  },
  {
    label: "Purchases",
    icon: "pi pi-shopping-bag",
    show: computed(() => !!authStore.userId && !!authStore.familyName),
    command: () => {
      router.push("/");
    },
  },

  {
    label: "Item's catalog",
    icon: "pi pi-equals",
    show: computed(() => !!authStore.userId && !!authStore.familyName),
    command: () => {
      router.push("/items");
    },
  },
  {
    label: "Group's catalog",
    icon: "pi pi-book",
    show: computed(() => !!authStore.userId && !!authStore.familyName),
    command: () => {
      router.push("/groups");
    },
  },

  {
    label: "Setings",
    icon: "pi pi-cog",
    show: computed(() => !!authStore.userId && !!authStore.familyName),
    command: () => {
      router.push("/fsettings");
    },
  },
]);
//

// S I G N  O U T
const onSignOut = async () => {
  try {
    await signOut(getAuth());
    authStore.userId = "";
    authStore.familyName = "";
    localStorage.removeItem("familyName");
    router.push("/auth");
  } catch (error) {
    console.log("error:", error.message);
  }
};

// const itemsShow = () => {
//   if (authStore.subMenu) {
//     console.log("items", authStore.subMenu);
//     return items.value;
//   }
//   console.log("itemsSimple");
//   return itemsSimple.value;
// };
</script>

<template>
  <div class="card">
    <Menubar :model="authStore.subMenu ? items : itemsSimple" class="menu">
      <template #start>
        <img
          alt="Home logo"
          class="logo"
          src="@/assets/sweethome.svg"
          width="70"
          height="60"
        />
      </template>
      <template #item="{ item, props, hasSubmenu }">
        <template v-if="item.show">
          <a v-bind="props.action">
            <span :class="item.icon" />
            <span class="ml-2">{{ item.label }}</span>
          </a>
        </template>
      </template>
      <template #end>
        <div
          class="flex align-items-center"
          v-if="!!authStore.userId && !!authStore.familyName"
        >
          <span class="mr-3 font-italic text-sm text-primary"
            >{{ authStore.userEmail }} ({{ authStore.familyName }})</span
          >
          <span class="flex align-items-center menu-exit" @click="onSignOut()">
            <span class="pi pi-sign-out p-menuitem-icon" />
            <span class="ml-2">SignOut</span>
          </span>
        </div>
      </template>
    </Menubar>
  </div>
</template>

<style scoped>
.menu {
  margin: 20px 0;
}
.menu-exit {
  cursor: pointer;
}
</style>
