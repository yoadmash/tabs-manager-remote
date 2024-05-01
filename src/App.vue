<script setup>
import { initializeApp } from "firebase/app";
import { getFirestore, getDocs, collection } from "firebase/firestore";

import { onMounted, ref } from 'vue';
import TabSelector from './components/TabSelector.vue';
import TabInfo from './components/TabInfo.vue';

let firebaseConfig = null;
let firebaseDB = null;


const docs = ref([]);
const connections = ref([]);
const selectedTab = ref(null);

onMounted(() => {
    conosole.log(import.meta.env.VITE_FIREBASE_CONFIG);
    firebaseConfig = JSON.parse(import.meta.env.VITE_FIREBASE_CONFIG);
    const app = initializeApp(firebaseConfig);
    firebaseDB = getFirestore(app);
    getDocsFromFirebase();
});

const getDocsFromFirebase = async () => {
    const connections_ids = await getDocs(collection(firebaseDB, 'connections_list'));
    connections_ids.docs.forEach(async doc => {
        connections.value.push({
            title: `${doc.id} - [${doc.data().saved_windows_count} saved windows]`,
            value: doc.id
        });
        const collection_data = await getDocs(collection(firebaseDB, doc.id));
        const collection_data_obj = {
            id: doc.id,
            data: collection_data.docs.map(doc => doc.data())
        }
        docs.value.push(collection_data_obj);
    });
}

const selectComplete = (data) => {
    selectedTab.value = data;
}

const selectorsChanges = () => {
    if(selectedTab.value) {
        selectedTab.value = null;
    }
} 

</script>

<template>
    <h2>Tabs Manager - Remote Access</h2>
    <TabSelector :connections="connections" :docs="docs" @onSelectComplete="selectComplete" @onSelectorsChanges="selectorsChanges"/>
    <TabInfo :tab="selectedTab" v-if="selectedTab" />
</template>

<style>
body {
    height: 95vh;
    display: flex;
    justify-content: center;
    /* align-items: center; */
}

#app {
    width: 95vw;
}
</style>