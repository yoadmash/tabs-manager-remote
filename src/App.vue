<script setup>
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  getDocs,
  collection,
  getDoc,
  doc,
  setDoc,
} from "firebase/firestore";
import SimpleCrypto from "simple-crypto-js";

import { onMounted, ref } from "vue";
import TabSelector from "./components/TabSelector.vue";
import TabInfo from "./components/TabInfo.vue";

let firebaseConfig = null;
let firebaseDB = null;

const authorized = ref(false);
const auth_level = ref("");
const password = ref("");
const show_password = ref(false);
const docs = ref([]);
const connections = ref([]);
const selectedTab = ref(null);
const reverse_sort = ref({
  tabs: false,
  windows: true,
});

onMounted(() => {
  authorized.value = Boolean(localStorage.getItem("auth")) || false;
  auth_level.value = localStorage.getItem("auth_level") || null;
  firebaseConfig = JSON.parse(import.meta.env.VITE_FIREBASE_CONFIG);
  const app = initializeApp(firebaseConfig);
  firebaseDB = getFirestore(app);
  if (authorized.value) {
    getDocsFromFirebase();
  }
});

// const verifyPassword = async (typedPassword) => {
//   const res = await fetch("http://192.168.1.178:4000/auth");
//   const data = await res.json();
//   const password = data.password.value;
//   return password === typedPassword;
// };

// const getDocsFromFirebase = async () => {
//   let res = await fetch("http://192.168.1.178:4000/connections");
//   const connections_ids = await res.json();
//   connections_ids.docs.forEach(async (doc) => {
//     connections.value.push({
//       title: `${doc.id} - [${doc.saved_windows_count} saved windows]`,
//       value: doc.id,
//     });
//     res = await fetch(`http://192.168.1.178:4000/${doc.id}`);
//     const collection_data = await res.json();
//     const collection_data_obj = {
//       id: doc.id,
//       data: collection_data.docs,
//     };
//     docs.value.push(collection_data_obj);
//   });
// };

const verifyPassword = async (typedPassword) => {
  const currentPasswords = await getDoc(doc(firebaseDB, "auth", "passwords"));
  const auth_level =
    typedPassword === currentPasswords.data().admin
      ? "admin"
      : typedPassword === currentPasswords.data().user
      ? "user"
      : null;
  return auth_level;
};

const getDocsFromFirebase = async () => {
  const connections_ids = await getDocs(collection(firebaseDB, "connections_list"));
  reverse_sort.value = (await getDoc(doc(firebaseDB, "remote_settings", "reverse_sort"))).data();
  connections_ids.docs.forEach(async (doc) => {
    if (getRoleLevel() === "admin" || !doc.data().hidden) {
      connections.value.push({
        title: `${doc.data().name} - [${doc.data().saved_windows_count} saved windows]`,
        value: doc.id,
      });
      const collection_data = await getDocs(collection(firebaseDB, doc.id));
      const collection_data_obj = {
        id: doc.id,
        data: collection_data.docs.map((doc) => doc.data()),
      };
      docs.value.push(collection_data_obj);
    }
  });
};

const selectComplete = (data) => {
  selectedTab.value = data;
};

const selectorsChanges = () => {
  selectedTab.value = null;
};

const setRoleLevel = (auth_level) => {
  const secretKey = import.meta.env.VITE_ENCR_SECRET_KEY;
  const simpleCrypto = new SimpleCrypto(secretKey);
  const cipherText = simpleCrypto.encrypt(auth_level);
  localStorage.setItem("auth_level", cipherText);
};

const getRoleLevel = () => {
  const secretKey = import.meta.env.VITE_ENCR_SECRET_KEY;
  const simpleCrypto = new SimpleCrypto(secretKey);
  const decipherText = simpleCrypto.decrypt(localStorage.getItem("auth_level"));
  return decipherText;
};

const login = async () => {
  if (password.value.length) {
    const res = await verifyPassword(password.value);
    if (res) {
      password.value = "";

      auth_level.value = res;
      setRoleLevel(auth_level.value);

      authorized.value = true;
      localStorage.setItem("auth", Number(authorized.value));

      show_password.value = false;
      getDocsFromFirebase();
    }
  }
};

const sort = async (type, setting) => {
  reverse_sort.value[type] = setting;
  await setDoc(doc(firebaseDB, "remote_settings", "reverse_sort"), reverse_sort.value, { merge: true });
};

const logout = async () => {
  authorized.value = false;
  auth_level.value = null;
  selectedTab.value = null;
  connections.value = [];
  localStorage.removeItem("auth");
  localStorage.removeItem("auth_level");
};
</script>

<template>
  <template v-if="!authorized && !auth_level">
    <form @submit.prevent="login" class="login">
      <v-text-field
        :type="!show_password ? 'password' : 'text'"
        label="Password"
        v-model="password"
        :append-inner-icon="!show_password ? 'mdi-eye' : 'mdi-eye-off'"
        @click:append-inner="show_password = !show_password"
      />
      <v-btn @click="login" color="success" variant="outlined" block>Login</v-btn>
    </form>
  </template>
  <template v-else>
    <div class="title">
      <h3>Tabs Manager - Remote Access</h3>
      <v-menu transition="slide-y-transition" :close-on-content-click="false">
        <template v-slot:activator="{ props }">
          <v-btn color="success" variant="outlined" size="small" v-bind="props"
            >Options</v-btn
          >
        </template>
        <v-list style="padding: 0">
          <v-list-item>
            <v-btn
              color="black"
              variant="plain"
              size="small"
              slim
              prepend-icon="mdi-sort-reverse-variant"
              :text="reverse_sort.tabs ? 'Normal sort tabs' : 'Reverse sort tabs'"
              @click="sort('tabs', !reverse_sort.tabs)"
            />
          </v-list-item>
          <v-list-item>
            <v-btn
              color="black"
              variant="plain"
              size="small"
              slim
              prepend-icon="mdi-sort-reverse-variant"
              :text="reverse_sort.windows ? 'Normal sort windows' : 'Reverse sort windows'"
              @click="sort('windows', !reverse_sort.windows)"
            />
          </v-list-item>
          <v-list-item>
            <v-btn
              color="black"
              variant="plain"
              size="small"
              slim
              prepend-icon="mdi-logout"
              @click="logout"
              text="Logout"
            />
          </v-list-item>
        </v-list>
      </v-menu>
    </div>
    <TabSelector
      :connections="connections"
      :docs="docs"
      :reverse_sort="reverse_sort"
      @onSelectComplete="selectComplete"
      @onSelectorsChanges="selectorsChanges"
    />

    <TabInfo :tab="selectedTab" v-if="selectedTab" />
  </template>
</template>

<style lang="scss">
body {
  margin: 10px;
  height: 95vh;
  display: flex;
  justify-content: center;

  #app {
    width: 75vw;

    @media only screen and (max-width: 1264px) {
      width: 95vw;
    }

    .title {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
    }
  }
}
</style>
