<script setup>
import { v4 as uuidv4 } from "uuid";
import { useAuthStore } from "@/stores/authStore";
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
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
const itemName = ref("");
const itemNameEdit = ref("");

const checked = ref(false);
const isLoading = ref(true);
const isLoadingButton = ref(false);
const isLoadingButtonEdit = ref(false);
const isLoadingPurchase = ref("");

const items = ref([]);
const groups = ref([]);

const selectedGroup = ref();
const selectedGroupEdit = ref();
const filteredGroups = ref();

const expandedRows = ref({});
const sortOrder = ref(1);
const sortField = ref("gname");
const filters = ref({
  global: {
    value: null,
    matchMode: FilterMatchMode.CONTAINS,
  },
});

//
const getAllGroups = async () => {
  //isLoading.value = true;
  try {
    const userId = getAuth().currentUser?.uid;
    if (userId) {
      const getData = query(
        collection(db, `fusers/${userId}/catalogGroups`),
        orderBy("gname", "asc")
      );

      const res = await getDocs(getData);
      //console.log(res, userId);
      groups.value = res.docs.map((el) => el.data());
    }
  } catch (error) {
    console.log(error);
  }
  //isLoading.value = false;
};
//
const getAllItems = async () => {
  //isLoading.value = true;
  try {
    const userId = getAuth().currentUser?.uid;
    if (userId) {
      const getData = query(
        collection(db, `fusers/${userId}/catalogItems`),
        orderBy("iname", "asc")
      );

      const res = await getDocs(getData);
      //console.log(res, userId);
      const allPromises = Promise.all(
        res.docs.map(async (el) => {
          const gRef = el.data().groupRef;
          const groupSnap = await getDoc(gRef);
          //console.log(groupSnap.data());
          const { id, gname } = groupSnap.data();
          //console.log({ ...el.data(), groupId: id, gname });
          return {
            groupId: id,
            gname,
            itemId: el.data().id,
            iname: el.data().iname,
          };
        })
      ).then((values) => {
        //console.log(typeof values);
        items.value = [...values];
        isLoading.value = false;
      });

      //console.log(items.value);
    }
  } catch (error) {
    console.log(error);
  }
  //isLoading.value = false;
};
//
const myLabel = (group) => {
  return `${group.gname}`;
};
//
const onSelectGroup = (event) => {
  console.log("Select:", event.value);
  console.log("selectedGroup", selectedGroup.value);
};
//
const onSelectGroupEdit = (event) => {
  console.log("Select:", event.value);
  console.log("selectedGroupEdit", selectedGroupEdit.value);
};
//
const disabledButton = computed(() => {
  return !(itemName.value && selectedGroup.value);
});
//
const disabledButtonEdit = computed(() => {
  return !(itemNameEdit.value && selectedGroupEdit.value);
});
//
const search = (event) => {
  if (!event.query.trim().length) {
    filteredGroups.value = [...groups.value];
  } else {
    filteredGroups.value = groups.value.filter((group) => {
      return group.gname.toLowerCase().includes(event.query.toLowerCase());
    });
  }
};
//
const onClear = () => {
  console.log("Clear!");
};
//
const onClearEdit = () => {
  console.log("Clear edit!");
};
// A D D   N E W   I T E M
const addNewItem = async () => {
  const userId = getAuth().currentUser?.uid;
  if (userId) {
    const payload = {
      id: uuidv4(),
      iname: itemName.value,
      groupRef: doc(
        db,
        `fusers/${userId}/catalogGroups/`,
        selectedGroup.value.id
      ),
    };
    try {
      isLoadingButton.value = true;
      await setDoc(
        doc(db, `fusers/${userId}/catalogItems/`, payload.id),
        payload
      );
      //
      //await getAllItems();
      //
      items.value.push({
        groupId: selectedGroup.value.id,
        gname: selectedGroup.value.gname,
        itemId: payload.id,
        iname: itemName.value,
      });
      //
      toast.add({
        severity: "success",
        summary: "Success",
        detail: `New item "${itemName.value}" is successfully added`,
        life: 6000,
      });
      isLoadingButton.value = false;
      itemName.value = "";
      //
    } catch (error) {
      console.log(error);
    }
  }
};
//-------------------
// E D I T   I T E M
//-------------------
const editItem = async (groupId, gname, itemId, iname) => {
  // Without reloading all data from Firebase
  // ----------------------------------------
  const userId = getAuth().currentUser?.uid;
  if (userId) {
    const payload = {
      id: itemId,
      iname,
      groupRef: doc(db, `fusers/${userId}/catalogGroups/`, groupId),
    };
    console.log(payload);
    //
    const docref = doc(db, `fusers/${authStore.userId}/catalogItems`, itemId);
    try {
      isLoadingButtonEdit.value = true;
      await updateDoc(docref, payload);
      //replace with new value into items array
      items.value = items.value.map((item) =>
        item.itemId === itemId ? { ...item, groupId, gname, iname } : item
      );
      //
      toast.add({
        severity: "success",
        summary: "Success",
        detail: `Item "${iname}" is successfully edited`,
        life: 6000,
      });
      isLoadingButtonEdit.value = false;
    } catch (error) {
      console.log(error);
    }
  }
};
//
//-----------------------
// D E L E T E    I T E M
//-----------------------
const onRemoveItem = (itemId, iname) => {
  console.log(itemId);
  // Here to check id item is present into purchase
  //
  confirm.require({
    message: `Do you want to delete ${iname} from catalog?`,
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
          await deleteDoc(
            doc(db, `fusers/${authStore.userId}/catalogItems`, itemId)
          );
          items.value = items.value.filter((el) => el.itemId != itemId);
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
};
//
//
const addToPurchases = async (item) => {
  //console.log(item);
  const userId = getAuth().currentUser?.uid;
  if (userId) {
    const payload = {
      groupId: item.groupId,
      gname: item.gname,
      itemId: item.itemId,
      iname: item.iname,
      desc: "",
      isReady: false,
    };
    try {
      isLoadingPurchase.value = item.itemId;
      //
      const docref = doc(
        db,
        `fusers/${authStore.userId}/family/${authStore.familyName}/tasks`,
        payload.itemId
      );
      // check for existing item into purchases
      const docSnap = await getDoc(docref);
      if (docSnap.exists()) {
        toast.add({
          severity: "warn",
          summary: "Warning",
          detail: `Item "${payload.iname}" is exist into purchases`,
          life: 6000,
        });
      } else {
        await setDoc(docref, payload);
        toast.add({
          severity: "success",
          summary: "Success",
          detail: `Item "${payload.iname}" is successfully added to purchases`,
          life: 6000,
        });
      }
      //

      isLoadingPurchase.value = "";
    } catch (error) {
      console.log(error);
    }
  }
};
//
onMounted(async () => {
  isLoading.value = true;
  await getAllGroups();
  await getAllItems();
  isLoading.value = false;
  //console.log(items.value);
});
onBeforeUnmount(() => {
  console.log("Unmounted");
});
const onRowExpand = (event) => {
  selectedGroupEdit.value = {
    id: event.data.groupId,
    gname: event.data.gname,
  };
  itemNameEdit.value = event.data.iname;
  const prop = event.data.itemId;
  expandedRows.value = { [prop]: true };
};
const showItems = () => {
  console.log(items.value);
};
</script>
<template>
  <ConfirmDialog />
  <Toast position="top-right" />
  <div v-if="!isLoading">
    <div class="content-items">
      <Card class="p-0" v-if="checked">
        <template #title>
          <div class="text-primary flex justify-content-between">
            <span class="text-2xl">New items</span>
            <!-- <InputSwitch v-model="checked" /> -->
          </div>
        </template>
        <template #content>
          <AutoComplete
            v-model="selectedGroup"
            dropdown
            forceSelection
            :optionLabel="myLabel"
            :suggestions="filteredGroups"
            @complete="search"
            @item-select="onSelectGroup"
            @clear="onClear"
            placeholder="type for select group"
            style="width: 100%"
          />
          <FloatLabel class="mb-5 mt-5">
            <InputText id="itemName" class="input" v-model="itemName" />
            <label for="itemName">Item name</label>
          </FloatLabel>

          <Button
            @click="addNewItem"
            label="Add to catalog"
            :loading="isLoadingButton"
            :disabled="disabledButton"
          />
          <!-- <Button @click="showItems" label="Show Items" /> -->
        </template>
      </Card>
    </div>
    <!-- Group table -->
    <div class="mt-2">
      <DataTable
        :value="items"
        v-model:expandedRows="expandedRows"
        v-model:filters="filters"
        :globalFilterFields="['gname', 'iname']"
        dataKey="itemId"
        :sort-field="sortField"
        :sort-order="sortOrder"
        @rowExpand="onRowExpand"
      >
        <template #header>
          <div class="flex align-items-center justify-content-between">
            <div class="flex flex-column gap-1 align-items-left">
              <p class="font-medium mb-1">Show add new</p>
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
        <Column field="iname" header="Item name" :sortable="true"></Column>
        <Column header="+" class="text-yellow-400">
          <template #body="slotProps">
            <i
              class="pi pi-cart-plus text-yellow-500 basket-table text-2xl"
              @click="addToPurchases(slotProps.data)"
              v-if="slotProps.data.itemId != isLoadingPurchase"
            ></i>
            <div v-else>
              <ProgressSpinner
                style="width: 30px; height: 30px"
                strokeWidth="5"
                fill="transparent"
                animationDuration=".5s"
                aria-label="Custom ProgressSpinner"
              />
            </div>
          </template>
        </Column>
        <Column expander header="Edit" style="width: 5rem" />
        <template #expansion="slotProps">
          <div class="content-items">
            <h4>Edit item:</h4>
            <!-- <p>{{ slotProps.data.gname }}</p> -->
            <AutoComplete
              v-model="selectedGroupEdit"
              dropdown
              forceSelection
              :optionLabel="myLabel"
              :suggestions="filteredGroups"
              @complete="search"
              @item-select="onSelectGroupEdit"
              @clear="onClearEdit"
              placeholder="type for select group"
              style="width: 100%"
            />
            <FloatLabel class="mb-5 mt-5">
              <InputText
                id="itemNameEdit"
                class="input"
                v-model="itemNameEdit"
              />
              <label for="itemNameEdit">Item name</label>
            </FloatLabel>
            <Button
              class="mr-3"
              @click="
                editItem(
                  selectedGroupEdit.id,
                  selectedGroupEdit.gname,
                  slotProps.data.itemId,
                  itemNameEdit
                )
              "
              label="Edit Item"
              :loading="isLoadingButtonEdit"
              :disabled="disabledButtonEdit"
            />
            <Button
              @click="onRemoveItem(slotProps.data.itemId, slotProps.data.iname)"
              label="Remove Item"
              severity="danger"
            />
          </div>
        </template>
        <!-- <Column>
          <template #body="slotProps">
            <div class="flex gap-2">
              <RouterLink :to="`/interview/${slotProps.data.id}`">
                <Button
                  icon="pi pi-pencil"
                  severity="info"
                  style="width: 40px; height: 40px"
                />
              </RouterLink>
              <Button
                icon="pi pi-trash"
                severity="danger"
                style="width: 40px; height: 40px"
                @click="
                  onRemoveInterview(slotProps.data.id, slotProps.data.company)
                "
              />
            </div>
          </template>
        </Column> -->
      </DataTable>
    </div>
  </div>
  <div v-else>
    <Loader />
  </div>
</template>
<style scoped>
.content-items {
  max-width: 600px;
  margin: auto;
}
.input {
  width: 100%;
}
.basket-table {
  cursor: pointer;
}
</style>
