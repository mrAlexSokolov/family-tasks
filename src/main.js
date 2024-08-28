//import './assets/main.css'

import "primeflex/primeflex.css";
import "primevue/resources/themes/lara-light-blue/theme.css";
import "primeicons/primeicons.css";

import { createApp } from "vue";
import { createPinia } from "pinia";

import App from "./App.vue";
import router from "./router";

import PrimeVue from "primevue/config";

import ToastService from "primevue/toastservice";
import ConfirmationService from "primevue/confirmationservice";

import Menubar from "primevue/menubar";
import Button from "primevue/button";
import InputText from "primevue/inputtext";
import ProgressBar from "primevue/progressbar";
import Toast from "primevue/toast";
import Card from "primevue/card";
import FloatLabel from "primevue/floatlabel";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import ConfirmDialog from "primevue/confirmdialog";
import InlineMessage from "primevue/inlinemessage";
import InputMask from "primevue/inputmask";
import InputNumber from "primevue/inputnumber";
import Textarea from "primevue/textarea";
import Calendar from "primevue/calendar";
import RadioButton from "primevue/radiobutton";
import Badge from "primevue/badge";
import Tooltip from "primevue/tooltip";
import IconField from "primevue/iconfield";
import InputIcon from "primevue/inputicon";
import Chart from "primevue/chart";
import InputSwitch from "primevue/inputswitch";
import AutoComplete from "primevue/autocomplete";
import ProgressSpinner from "primevue/progressspinner";
import FileUpload from "primevue/fileupload";
import Image from "primevue/image";
import Checkbox from "primevue/checkbox";

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "my-test-project-8d2c4.firebaseapp.com",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE,
  projectId: "my-test-project-8d2c4",
  storageBucket: "my-test-project-8d2c4.appspot.com",
  messagingSenderId: "92867297324",
  appId: "1:92867297324:web:265179405d44c3ffc39189",
};

// Initialize Firebase
initializeApp(firebaseConfig);

const app = createApp(App);

app.use(router);
app.use(createPinia());
app.use(PrimeVue);
app.use(ToastService);
app.use(ConfirmationService);

// PrimeVue directives
app.directive("tooltip", Tooltip);

// PrimeVue components
app.component("Menubar", Menubar);
app.component("Button", Button);
app.component("InputText", InputText);
app.component("Toast", Toast);
app.component("ProgressBar", ProgressBar);
app.component("Card", Card);
app.component("FloatLabel", FloatLabel);
app.component("DataTable", DataTable);
app.component("Column", Column);
app.component("ConfirmDialog", ConfirmDialog);
app.component("InlineMessage", InlineMessage);
app.component("InputMask", InputMask);
app.component("InputNumber", InputNumber);
app.component("Textarea", Textarea);
app.component("Calendar", Calendar);
app.component("RadioButton", RadioButton);
app.component("Badge", Badge);
app.component("IconField", IconField);
app.component("InputIcon", InputIcon);
app.component("Chart", Chart);
app.component("InputSwitch", InputSwitch);
app.component("AutoComplete", AutoComplete);
app.component("ProgressSpinner", ProgressSpinner);
app.component("FileUpload", FileUpload);
app.component("Image", Image);
app.component("Checkbox", Checkbox);

app.mount("#app");
