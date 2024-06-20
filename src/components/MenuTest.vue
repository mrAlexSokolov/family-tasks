<template>
  <div class="card">
    <Menubar :model="items">
      <template #start>
        <img
          alt="Home logo"
          class="logo"
          src="@/assets/sweethome.svg"
          width="70"
          height="60"
        />
      </template>
      <template #item="{ item, props }">
        <a v-bind="props.action" @click="navigate">
          <span :class="item.icon" />
          <span class="ml-2">{{ item.label }}</span>
        </a>
      </template>
    </Menubar>
    <Toast />
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useToast } from "primevue/usetoast";
import { useRouter } from "vue-router";

const toast = useToast();
const router = useRouter();

const items = ref([
  {
    label: "File",
    icon: "pi pi-file",
    items: [
      {
        label: "New",
        icon: "pi pi-plus",
        command: () => {
          router.push("/");
        },
      },
      {
        label: "Print",
        icon: "pi pi-print",
        command: () => {
          router.push("/settings");
        },
      },
    ],
  },
  {
    separator: true,
  },
  {
    label: "Sync",
    icon: "pi pi-cloud",
    items: [
      {
        label: "Import",
        icon: "pi pi-cloud-download",
        command: () => {
          toast.add({
            severity: "info",
            summary: "Downloads",
            detail: "Downloaded from cloud",
            life: 3000,
          });
        },
      },
      {
        label: "Export",
        icon: "pi pi-cloud-upload",
        command: () => {
          toast.add({
            severity: "info",
            summary: "Shared",
            detail: "Exported to cloud",
            life: 3000,
          });
        },
      },
    ],
  },
]);
</script>
