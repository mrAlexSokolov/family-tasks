import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/stores/authStore";
import { getAuth, onAuthStateChanged } from "firebase/auth";

const checkAuth = (to, from, next) => {
  //
  let isAuth = false;
  //
  onAuthStateChanged(getAuth(), (user) => {
    const authStore = useAuthStore();
    if (user && !isAuth) {
      isAuth = true;
      authStore.userId = user.uid;
      next();
    } else if (!user && !isAuth) {
      authStore.userId = "";
      isAuth = true;
      next("/auth");
    }
  });
};

const routes = [
  {
    path: "/",
    name: "Home",
    component: () => import("@/views/HomeView.vue"),
    beforeEnter: checkAuth,
  },
  {
    path: "/fsettings",
    name: "Settings",
    component: () => import("@/views/SettingsView.vue"),
    beforeEnter: checkAuth,
  },
  {
    path: "/groups",
    name: "Groups",
    component: () => import("@/views/GroupsView.vue"),
    beforeEnter: checkAuth,
  },
  {
    path: "/items",
    name: "Items",
    component: () => import("@/views/CatalogItemsView.vue"),
    beforeEnter: checkAuth,
  },
  {
    path: "/auth",
    name: "Auth",
    component: () => import("@/views/AuthView.vue"),
  },
  {
    path: "/upload",
    name: "Upload",
    component: () => import("@/views/FileUploadView.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: routes,
});

export default router;
