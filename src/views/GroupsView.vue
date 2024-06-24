<script setup>
import { v4 as uuidv4 } from "uuid";
import { useAuthStore } from "@/stores/authStore";
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";

import { useConfirm } from "primevue/useconfirm";

import Loader from "@/components/Loader.vue";

import { getAuth } from "firebase/auth";
import {
  getFirestore,
  setDoc,
  doc,
  query,
  collection,
  orderBy,
  getDocs,
  getDoc,
  updateDoc,
  onSnapshot,
  where,
  deleteDoc,
} from "firebase/firestore";

import { useToast } from "primevue/usetoast";
import { FilterMatchMode } from "primevue/api";
const toast = useToast();

const db = getFirestore();
const authStore = useAuthStore();
const router = useRouter();
const confirm = useConfirm();

const groupName = ref("");
const checked = ref(true);
const isLoading = ref(false);
const isLoadingButton = ref(false);

const freshSnapshot = ref(null);

const groups = ref([]);
const groupEdit = ref("");

const expandedRows = ref({});
const sortOrder = ref(1);
const sortField = ref("gname");
const filters = ref({
  global: {
    value: null,
    matchMode: FilterMatchMode.CONTAINS,
  },
});

const disabledButton = computed(() => {
  return !groupName.value;
});
// A D D  N E W  GROUP
const addNewGroup = async () => {
  const payload = {
    id: uuidv4(),
    gname: groupName.value,
  };
  const userId = getAuth().currentUser?.uid;
  if (userId) {
    try {
      // isLoading.value = true;
      isLoadingButton.value = true;
      await setDoc(
        doc(db, `fusers/${userId}/catalogGroups/`, payload.id),
        payload
      );

      //
      await getAllGroups();
      //
      toast.add({
        severity: "success",
        summary: "Success",
        detail: `New group "${groupName.value}" is successfully created`,
        life: 6000,
      });
      isLoadingButton.value = false;
      groupName.value = "";
      //
      //router.push("/interviews");
    } catch (error) {
      console.log(error);
    }
  }
};
//
const getAllGroups = async () => {
  isLoading.value = true;
  try {
    const userId = getAuth().currentUser?.uid;
    if (userId) {
      const getData = query(
        collection(db, `fusers/${userId}/catalogGroups`),
        orderBy("gname", "desc")
      );
      let res;
      if (!freshSnapshot.value) {
        res = await getDocs(getData);
      } else {
        res = freshSnapshot.value;
      }
      //console.log(res, userId);
      groups.value = res.docs.map((el) => el.data());
    }
  } catch (error) {
    console.log(error);
  }
  isLoading.value = false;
};
//
const onRowExpand = (event) => {
  groupEdit.value = event.data.gname;
  const prop = event.data.id;
  expandedRows.value = { [prop]: true };
};
//
const onEditGroup = async (id) => {
  const userId = getAuth().currentUser?.uid;
  if (userId) {
    const payload = {
      id,
      gname: groupEdit.value,
    };
    const docref = doc(db, `fusers/${authStore.userId}/catalogGroups`, id);
    try {
      await updateDoc(docref, payload);
      //
      groups.value = groups.value.map((el) =>
        el.id === id ? { ...el, gname: groupEdit.value } : el
      );
      //
      toast.add({
        severity: "success",
        summary: "Success",
        detail: `Group "${groupEdit.value}" is successfully edited`,
        life: 3000,
      });
    } catch (error) {
      console.log(error);
    }
  }
};
//
//
// E V E N T   L I S T E N E R
//
const queryOnline = query(
  collection(db, `fusers/${authStore.userId}/catalogGroups`)
);
const unsub = onSnapshot(queryOnline, async (querySnapshot) => {
  try {
    freshSnapshot.value = querySnapshot;
    await getAllGroups();
  } catch (error) {
    console.log(error);
  }
  // querySnapshot.forEach((el) => console.log(el.data()));
});
//
const onRemoveGroup = async (id, gname) => {
  //console.log(id);
  // const docRef = (db, `fusers/${authStore.userId}/catalogGroups/${id}`);
  // Не получился поиск в items по полю groupRef (ссылка на группу)
  // поэтому пришлось добавить поле groupId в документах каталога items
  const queryForGroupExist = query(
    collection(db, `fusers/${authStore.userId}/catalogItems`),
    where("groupId", "==", id)
  );
  try {
    const res = await getDocs(queryForGroupExist);
    //console.log(res.docs.length);
    if (res.docs.length) {
      toast.add({
        severity: "warn",
        summary: "Warning",
        detail: `${res.docs.length} item(s) exist. Remove them before`,
        life: 3000,
      });
    } else {
      // Remove group
      confirm.require({
        message: `Do you want to delete ${gname} ?`,
        header: "Danger Zone",
        icon: "pi pi-info-circle",
        rejectLabel: "Cancel",
        acceptLabel: "Remove",
        rejectClass: "p-button-secondary p-button-outlined",
        acceptClass: "p-button-danger",
        accept: async () => {
          // isLoading.value = true;
          const userId = getAuth().currentUser?.uid;
          if (userId) {
            try {
              await deleteDoc(doc(db, `fusers/${userId}/catalogGroups`, id));
              // items.value = items.value.filter((el) => el.itemId != itemId);
            } catch (error) {
              console.log(error);
            }
          }
          // isLoading.value = false;
        },
        reject: () => {
          console.log("reject");
        },
      });
    }
  } catch (error) {
    console.log(error);
  }
};
//
onMounted(async () => {
  await getAllGroups();
  // console.log(groups.value[2].cityRef);
  // const docRef = groups.value[2].cityRef;
  // const docSnap = await getDoc(docRef);
  // const docSnapData = docSnap.data();
  // groups.value[2] = { ...groups.value[2], ...docSnapData };
  // console.log(groups.value[2]);
});
//
</script>
<template>
  <ConfirmDialog />
  <Toast position="top-right" />
  <div class="content-groups">
    <Card class="p-0" v-if="checked">
      <template #title>
        <div class="text-primary flex justify-content-between">
          <span class="text-2xl">New group of items</span>
          <!-- <InputSwitch v-model="checked" /> -->
        </div>
      </template>
      <template #content v-if="checked">
        <FloatLabel class="mb-5">
          <InputText id="groupName" class="input" v-model="groupName" />
          <label for="company">Group name</label>
        </FloatLabel>

        <Button
          @click="addNewGroup"
          label="Create new group"
          :loading="isLoadingButton"
          :disabled="disabledButton"
        />
      </template>
    </Card>
  </div>
  <!-- Group table -->
  <div class="mt-2">
    <DataTable
      :value="groups"
      v-model:expandedRows="expandedRows"
      v-model:filters="filters"
      :globalFilterFields="['gname']"
      dataKey="id"
      :sort-field="sortField"
      :sort-order="sortOrder"
      @rowExpand="onRowExpand"
    >
      <template #header>
        <div class="flex align-items-center justify-content-between">
          <div class="flex gap-1 align-items-center">
            <h5>Show add new</h5>
            <InputSwitch v-model="checked" class="mr-1" />
          </div>
          <div class="flex gap-3">
            <IconField iconPosition="left">
              <InputIcon>
                <i class="pi pi-search" />
              </InputIcon>
              <InputText
                v-model="filters['global'].value"
                placeholder="Keyword Search"
              />
            </IconField>
          </div>
        </div>
      </template>
      <Column field="gname" header="Groups name" :sortable="true"></Column>
      <Column expander header="Edit" style="width: 5rem" />
      <template #expansion="slotProps">
        <div class="content-groups">
          <h4>Edit item:</h4>

          <FloatLabel class="mb-5 mt-5">
            <InputText id="groupEdit" class="input" v-model="groupEdit" />
            <label for="groupEdit">Item name</label>
          </FloatLabel>
          <Button
            class="mr-3"
            @click="onEditGroup(slotProps.data.id)"
            label="Edit Group"
            :loading="false"
            :disabled="false"
          />
          <Button
            @click="onRemoveGroup(slotProps.data.id, slotProps.data.gname)"
            label="Remove Group"
            severity="danger"
          />
        </div>
      </template>
    </DataTable>
  </div>
</template>
<style scoped>
.content-groups {
  max-width: 600px;
  margin: auto;
}
.input {
  width: 100%;
}
</style>
