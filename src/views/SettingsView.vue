<script setup>
import { v4 as uuidv4 } from "uuid";
import { useAuthStore } from "@/stores/authStore";
import { onMounted, ref, computed } from "vue";
import { useRouter } from "vue-router";

import { getAuth } from "firebase/auth";
import {
  getFirestore,
  setDoc,
  doc,
  getDocs,
  query,
  collection,
} from "firebase/firestore";

import { useToast } from "primevue/usetoast";
const toast = useToast();

const db = getFirestore();
const authStore = useAuthStore();
const router = useRouter();

const familyUsers = ref([]);
const selectedFamily = ref(authStore.familyName);
const newUserFamily = ref("");
//
const disabledButtonNewUserFamily = computed(() => {
  return !newUserFamily.value;
});
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
const onClearPurchase = () => {};
//
onMounted(() => {
  getFamilyUsers();
});
</script>

<template>
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
            :loading="false"
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
            @click="onClearPurchase"
            label="Create"
            :loading="false"
            :disabled="disabledButtonNewUserFamily"
          />
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
