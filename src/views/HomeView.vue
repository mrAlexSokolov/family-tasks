<script setup>
import { v4 as uuidv4 } from "uuid";
import { useAuthStore } from "@/stores/authStore";
import { onMounted, ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useConfirm } from "primevue/useconfirm";

import Loader from "@/components/Loader.vue";

import { getAuth } from "firebase/auth";
import {
  getFirestore,
  setDoc,
  doc,
  getDocs,
  getDoc,
  query,
  collection,
  orderBy,
  deleteDoc,
} from "firebase/firestore";

import { useToast } from "primevue/usetoast";
const toast = useToast();

const db = getFirestore();
const authStore = useAuthStore();
const router = useRouter();
const confirm = useConfirm();
//

const isLoading = ref(false);
const purchases = ref([]);
const selectedCount = ref([]);
const expendedNode = ref(null);
const newDesc = ref("");

const buildTree = async () => {
  const userId = getAuth().currentUser?.uid;
  if (userId) {
    const getData = query(
      collection(
        db,
        `fusers/${authStore.userId}/family/${authStore.familyName}/tasks`
      ),
      orderBy("groupId", "asc")
    );
    try {
      isLoading.value = true;
      const res = await getDocs(getData);
      //res.forEach((el) => console.log(el.data()));
      let groupId = "";
      let ind = -1;
      res.forEach((el) => {
        //
        if (el.data().groupId !== groupId) {
          purchases.value.push({
            groupId: el.data().groupId,
            gname: el.data().gname,
            nodes: [],
          });
          ind++;
          groupId = el.data().groupId;
          selectedCount.value[ind] = 0;
        }
        //
        purchases.value[ind].nodes.push({
          itemId: el.data().itemId,
          iname: el.data().iname,
          desc: el.data().desc,
          isReady: el.data().isReady,
          ind,
        });
        if (el.data().isReady) {
          selectedCount.value[ind]++;
        }
      });
      console.log(purchases);
      console.log(selectedCount);
      isLoading.value = false;
    } catch (error) {
      console.log(error);
    }
  }
};
//
const onChangeStatus = async (node) => {
  // Without reloading all data from Firebase
  // ----------------------------------------
  const userId = getAuth().currentUser?.uid;
  if (userId) {
    const payload = {
      ...node,
      groupId: purchases.value[node.ind].groupId,
      gname: purchases.value[node.ind].gname,
      isReady: !node.isReady,
    };
    delete payload.ind;
    //console.log(payload);
    const docref = doc(
      db,
      `fusers/${authStore.userId}/family/${authStore.familyName}/tasks`,
      node.itemId
    );
    try {
      await setDoc(docref, payload);
      const newNodes = purchases.value[node.ind].nodes.map((el) =>
        el.itemId === node.itemId ? { ...el, isReady: !el.isReady } : el
      );
      // console.log(newNodes);
      purchases.value[node.ind].nodes = newNodes;
      if (!node.isReady) {
        selectedCount.value[node.ind]++;
      } else {
        selectedCount.value[node.ind]--;
      }
    } catch (error) {
      console.log(error);
    }
  }
};
//
const onExpendItem = (ind, itemId, desc) => {
  console.log("Edit item:", ind, itemId);
  if (itemId !== expendedNode.value) {
    expendedNode.value = itemId;
    newDesc.value = desc;
  } else {
    expendedNode.value = null;
  }
};
//
const onEditButton = async (node) => {
  const ind = node.ind;
  delete node.ind;
  console.log(node);
  const userId = getAuth().currentUser?.uid;
  if (userId) {
    const payload = { ...node, desc: newDesc.value };
    const docref = doc(
      db,
      `fusers/${authStore.userId}/family/${authStore.familyName}/tasks`,
      node.itemId
    );
    try {
      await setDoc(docref, payload);
      const arrayItems = purchases.value[ind].nodes.map((el) =>
        el.itemId === node.itemId ? { ...el, desc: newDesc.value } : el
      );
      purchases.value[ind].nodes = arrayItems;
      expendedNode.value = null;
      //
      toast.add({
        severity: "success",
        summary: "Success",
        detail: "Item is successfully edited",
        life: 3000,
      });
      //
    } catch (error) {
      console.log(error);
    }
  }
};
const onRemoveButton = async (node) => {
  confirm.require({
    message: `Do you want to delete ${node.iname} from purchases?`,
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
            doc(
              db,
              `fusers/${authStore.userId}/family/${authStore.familyName}/tasks`,
              node.itemId
            )
          );
          const arrayItems = purchases.value[node.ind].nodes.filter(
            (el) => el.itemId !== node.itemId
          );
          if (arrayItems.length) {
            purchases.value[node.ind].nodes = arrayItems;
            if (node.isReady) {
              selectedCount.value[node.ind]--;
            }
          } else {
            purchases.value.splice(node.ind, 1);
          }
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
onMounted(() => {
  if (authStore.justRegistered) {
    toast.add({
      severity: "success",
      summary: "Success",
      detail: "you are successfully registered",
      life: 6000,
    });
    authStore.justRegistered = false;
  }
  buildTree();
});
//
</script>

<template>
  <ConfirmDialog />
  <Toast position="top-right" />
  <div class="content-purchases">
    <Loader v-if="isLoading" />
    <div v-for="(purchase, index) in purchases" :key="purchase.groupId">
      <div class="flex align-items-center justify-content-between">
        <div class="flex align-items-center justify-content-left gap-1">
          <div class="text-lg font-semibold">{{ purchase.gname }}</div>
          <Badge :value="selectedCount[index]" severity="success"></Badge>
        </div>
        <Badge :value="purchase.nodes.length" severity="contrast"></Badge>
      </div>
      <div>
        <div
          v-for="node in purchase.nodes"
          :key="node.itemId"
          @dblclick="onChangeStatus(node)"
        >
          <div
            :class="[
              'task flex align-items-center justify-content-between',
              node.isReady ? 'is-confirmed' : '',
            ]"
          >
            <div class="flex flex-column gap-1">
              <div>
                {{ node.iname }}
              </div>
              <div class="text-xs">
                {{ node.desc }}
              </div>
            </div>

            <i
              @click="onExpendItem(node.ind, node.itemId, node.desc)"
              class="pi pi-pen-to-square text-2xl text-blue-500"
            ></i>
          </div>
          <div v-if="node.itemId === expendedNode" class="ml-5">
            <FloatLabel class="mb-2 mt-4">
              <InputText id="itemName" class="input" v-model="newDesc" />
              <label for="itemName">Item Description </label>
            </FloatLabel>
            <Button
              class="mb-2"
              @click="
                onEditButton({
                  ...node,
                  groupId: purchase.groupId,
                  gname: purchase.gname,
                })
              "
              label="Edit"
              :loading="false"
              :disabled="false"
            />
            <Button
              class="mb-2 ml-3"
              severity="danger"
              @click="onRemoveButton(node)"
              label="Remove"
              :loading="false"
              :disabled="false"
            />
          </div>
        </div>
      </div>
    </div>
    <InlineMessage severity="warn" v-if="!isLoading && !purchases.length"
      >List of purchases is empty</InlineMessage
    >
  </div>
</template>

<style scoped>
.content-purchases {
  max-width: 800px;
  margin: auto;
}
.input {
  width: 100%;
}
.h4 {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.task {
  background: #f4f4f4;
  margin: 5px;
  padding: 10px 20px;
  cursor: pointer;
}
.is-confirmed {
  border-left: 5px solid green;
}
</style>
