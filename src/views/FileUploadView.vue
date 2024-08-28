<script setup>
import {
  getStorage,
  ref as refStorage,
  uploadBytes,
  listAll,
  getDownloadURL,
} from "firebase/storage";

import { ref, onMounted } from "vue";

const storage = getStorage();
const images = ref([]);

const fileTypeAccept = ref("image/*");
// const fileTypeAccept = ref("application/pdf");

const customBase64Uploader = async (event) => {
  const file = event.files[0];
  console.log(file);
  const storageRef = refStorage(storage, `images/${file.name}`);
  // 'file' comes from the Blob or File API
  const snapShot = await uploadBytes(storageRef, file);
  console.log(snapShot);
};
//
onMounted(async () => {
  const listRef = refStorage(storage, "images");
  try {
    const res = await listAll(listRef);
    res.items.forEach(async (itemRef) => {
      try {
        const url = await getDownloadURL(itemRef);
        images.value.push(url);
        // console.log(url);
      } catch (error) {
        console.log(error);
      }
    });
  } catch (error) {
    console.log(error);
  }
});
//
</script>
<template>
  <div class="card flex justify-content-center">
    <FileUpload
      mode="basic"
      name="demo[]"
      url="/api/upload"
      :accept="fileTypeAccept"
      customUpload
      @uploader="customBase64Uploader"
    />
  </div>
  <div v-for="(image, index) in images" :key="index">
    <Image :src="image" alt="Image" width="250" />
  </div>
</template>
