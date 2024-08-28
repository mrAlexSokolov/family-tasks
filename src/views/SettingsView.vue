<script setup>
import { v4 as uuidv4 } from "uuid";
import { useAuthStore } from "@/stores/authStore";
import { onMounted, ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useConfirm } from "primevue/useconfirm";

import { getAuth } from "firebase/auth";
import {
  getFirestore,
  setDoc,
  doc,
  getDocs,
  getDoc,
  query,
  collection,
  deleteDoc,
} from "firebase/firestore";

import { useToast } from "primevue/usetoast";
const toast = useToast();

const db = getFirestore();
const authStore = useAuthStore();
const router = useRouter();
const confirm = useConfirm();

const familyUsers = ref([]);
const selectedFamily = ref(authStore.familyName);
const newUserFamily = ref("");

const isLoadingClear = ref(false);

//
const disabledButtonNewUserFamily = computed(() => {
  return !newUserFamily.value.trim();
});
//
const checked = ref(authStore.subMenu);
//
const getFamilyUsers = async () => {
  const userId = getAuth().currentUser?.uid;
  if (userId) {
    const getData = query(collection(db, `fusers/${userId}/family`));
    try {
      const res = await getDocs(getData);
      res.forEach((el) => {
        familyUsers.value.push(el.data().name);
      });
      console.log(familyUsers.value);
    } catch (error) {
      console.log(error);
    }
  }
};
//
const onFamilyChange = () => {
  authStore.familyName = selectedFamily.value;
  localStorage.setItem("familyName", selectedFamily.value);
};
//
const onClearPurchase = () => {
  confirm.require({
    message: `Do you want to clear purchases of <${selectedFamily.value}> ?`,
    header: "Danger Zone",
    icon: "pi pi-info-circle",
    rejectLabel: "Cancel",
    acceptLabel: "Clear",
    rejectClass: "p-button-secondary p-button-outlined",
    acceptClass: "p-button-danger",
    accept: async () => {
      const userId = getAuth().currentUser?.uid;
      if (userId) {
        const getData = query(
          collection(
            db,
            `fusers/${authStore.userId}/family/${selectedFamily.value}/tasks`
          )
        );
        try {
          isLoadingClear.value = true;
          const res = await getDocs(getData);
          //
          res.forEach(async (element) => {
            //console.log(element.data());
            const docref = doc(
              db,
              `fusers/${authStore.userId}/family/${selectedFamily.value}/tasks`,
              element.data().itemId
            );
            try {
              await deleteDoc(docref);
            } catch (error) {
              console.log(error);
            }
          });
          //
          toast.add({
            severity: "success",
            summary: "Success",
            detail: "List of purchases is blank now",
            life: 3000,
          });
          isLoadingClear.value = false;
          //
        } catch (error) {
          console.log(error);
        }
      }
    },
    reject: () => {
      console.log("reject");
    },
  });
};
//
const onCreateNewUserFamily = async () => {
  const userId = getAuth().currentUser?.uid;
  if (userId) {
    // checking for existing name
    const docref = doc(
      db,
      `fusers/${userId}/family`,
      newUserFamily.value.trim()
    );
    try {
      const docSnap = await getDoc(docref);
      if (docSnap.exists()) {
        //
        toast.add({
          severity: "warn",
          summary: "Warning",
          detail: `Family user ${newUserFamily.value.trim()} is exist yet`,
          life: 3000,
        });
      } else {
        const payload = {
          name: newUserFamily.value.trim(),
          status: true,
          subMenu: true,
        };
        await setDoc(
          doc(db, `fusers/${userId}/family/`, newUserFamily.value.trim()),
          payload
        );
        //
        familyUsers.value.push(newUserFamily.value.trim());
        //
        toast.add({
          severity: "success",
          summary: "Success",
          detail: `Family user ${newUserFamily.value.trim()} successfuly added`,
          life: 3000,
        });
        //
      }
    } catch (error) {}
  }
};
//
const onChangeMenu = async () => {
  const userId = getAuth().currentUser?.uid;
  if (userId) {
    const docref = doc(db, `fusers/${userId}/family`, selectedFamily.value);
    const payload = {
      name: selectedFamily.value,
      status: true,
      subMenu: checked.value,
    };
    try {
      await setDoc(docref, payload);
      authStore.subMenu = checked.value;
      localStorage.setItem(
        "subMenu",
        JSON.stringify({ subMenu: checked.value })
      );
    } catch (error) {
      console.log(error);
    }
  }
};
//
onMounted(() => {
  getFamilyUsers();
});
</script>

<template>
  <ConfirmDialog />
  <Toast position="top-right" />
  <div class="content-settings">
    <Card>
      <template #title>Settings</template>
      <template #content>
        <label>Select current family user:</label>
        <div class="flex flex-row gap-3 mt-2">
          <div
            v-for="family in familyUsers"
            :key="family"
            class="flex align-items-center"
          >
            <RadioButton
              v-model="selectedFamily"
              :inputId="family"
              name="dynamic"
              :value="family"
              @change="onFamilyChange"
            />
            <label :for="family" class="ml-2">{{ family }}</label>
          </div>
        </div>
        <div class="flex flex-row align-items-center gap-2 mt-5">
          <label
            >Clear purchases for selected family user <{{
              selectedFamily
            }}>:</label
          >
          <Button
            class="mb-2 ml-1"
            severity="danger"
            @click="onClearPurchase"
            label="Clear"
            :loading="isLoadingClear"
            :disabled="false"
          />
        </div>
        <div class="flex flex-row align-items-center gap-2 mt-5">
          <FloatLabel class="">
            <InputText
              id="newUserFamily"
              class="input"
              v-model="newUserFamily"
            />
            <label for="newUserFamily">New user family</label>
          </FloatLabel>
          <Button
            class="ml-1"
            severity="info"
            @click="onCreateNewUserFamily"
            label="Create"
            :loading="false"
            :disabled="disabledButtonNewUserFamily"
          />
        </div>
        <div class="flex flex-row align-items-center gap-2 mt-5">
          <Checkbox
            v-model="checked"
            :binary="true"
            @change="onChangeMenu"
            inputId="useSubMenu"
          />
          <label for="useSubMenu" class="ml-2">
            Use submenu in main menu
          </label>
        </div>
      </template>
    </Card>
  </div>
</template>
<style scoped>
.content-settings {
  max-width: 800px;
  margin: auto;
}
.input {
  width: 100%;
}
</style>
