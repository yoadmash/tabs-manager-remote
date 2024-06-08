<script setup>
import { initializeApp } from "firebase/app";
import { getFirestore, getDocs, collection, getDoc, doc } from "firebase/firestore";
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

const logout = async () => {
  authorized.value = false;
  auth_level.value = null;
  selectedTab.value = null;
  connections.value = [];
  localStorage.removeItem("auth");
  localStorage.removeItem("auth_level");
};

const show_hide_password = () => {
  show_password.value = !show_password.value;
};
</script>

<template>
  <template v-if="!authorized && !auth_level">
    <form @submit.prevent="login" class="login">
      <v-text-field
        :type="!show_password ? 'password' : 'text'"
        label="Password"
        v-model="password"
        :appendIcon="!show_password ? 'mdi-eye' : 'mdi-eye-off'"
        @click:append="show_hide_password"
      />
      <v-btn @click="login" color="success" variant="outlined" block>Login</v-btn>
    </form>
  </template>
  <template v-else>
    <div class="title">
      <h3>Tabs Manager - Remote Access</h3>
      <v-btn @click="logout" color="success" variant="outlined" size="small"
        >Logout</v-btn
      >
    </div>
    <TabSelector
      :connections="connections"
      :docs="docs"
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
