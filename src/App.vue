<script setup>
import { initializeApp } from "firebase/app";
import { getFirestore, getDocs, collection, getDoc, doc } from "firebase/firestore";

import { onMounted, ref } from "vue";
import TabSelector from "./components/TabSelector.vue";
import TabInfo from "./components/TabInfo.vue";

let firebaseConfig = null;
let firebaseDB = null;

const authorized = ref(false);
const password = ref("");
const docs = ref([]);
const connections = ref([]);
const selectedTab = ref(null);

onMounted(() => {
  authorized.value = Boolean(localStorage.getItem("auth")) || false;
  firebaseConfig = JSON.parse(import.meta.env.VITE_FIREBASE_CONFIG);
  const app = initializeApp(firebaseConfig);
  firebaseDB = getFirestore(app);
  if (authorized.value) {
    getDocsFromFirebase();
  }
});

const verifyPassword = async (typedPassword) => {
  const currentPassword = await getDoc(doc(firebaseDB, "auth", "password"));
  return currentPassword.data().value === typedPassword;
};

const getDocsFromFirebase = async () => {
  const connections_ids = await getDocs(collection(firebaseDB, "connections_list"));
  connections_ids.docs.forEach(async (doc) => {
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
  });
};

const selectComplete = (data) => {
  selectedTab.value = data;
};

const selectorsChanges = () => {
  if (selectedTab.value) {
    selectedTab.value = null;
  }
};

const login = async () => {
  if (password.value.length) {
    const res = await verifyPassword(password.value);
    if (res) {
      password.value = "";
      authorized.value = true;
      localStorage.setItem("auth", Number(authorized.value));
      getDocsFromFirebase();
    }
  }
};

const logout = async () => {
  authorized.value = false;
  localStorage.removeItem("auth");
};
</script>

<template>
  <template v-if="!authorized">
    <form @submit.prevent="login" class="login">
      <v-text-field clearable type="password" label="Password" v-model="password" />
      <v-btn @click="login" color="success" variant="outlined" block>Login</v-btn>
    </form>
  </template>
  <template v-else>
    <div class="title">
      <h3>Tabs Manager - Remote Access</h3>
      <v-btn @click="logout" color="success" variant="outlined" size="small">Logout</v-btn>
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
