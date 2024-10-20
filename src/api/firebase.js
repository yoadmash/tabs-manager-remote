import { initializeApp } from "firebase/app";
import { collection, doc, getDoc, getDocs, setDoc, getFirestore } from "firebase/firestore";
import SimpleCrypto from "simple-crypto-js";

let firebaseDB = null;

const ENCR_SECRET_KEY = import.meta.env.VITE_ENCR_SECRET_KEY;
const DEV_MODE = import.meta.env?.VITE_APP_DEV_MODE === 'true';
const DEV_MODE_SERVER_IP = import.meta.env?.VITE_APP_DEV_MODE_SERVER_IP;

const simpleCrypto = new SimpleCrypto(ENCR_SECRET_KEY);

export const connectToFirebase = () => {
    const firebaseConfig = JSON.parse(import.meta.env.VITE_FIREBASE_CONFIG);
    if (firebaseConfig) {
        const app = initializeApp(firebaseConfig);
        firebaseDB = getFirestore(app);
    }
}

export const getDataFromFirebase = async () => {
    const connections_ids =
        DEV_MODE
            ? (await (await fetch(`${DEV_MODE_SERVER_IP}`)).json()).connections
            : await getDocs(collection(firebaseDB, "connections_list"));

    const remote_settings =
        DEV_MODE
            ? null
            : await getDocs(collection(firebaseDB, "remote_settings"));

    const connections = [];
    const connections_ids_docs = [];
    const remote_settings_docs = {};
    
    connections_ids.docs.forEach((doc) => {
        if (DEV_MODE || getRoleLevel() === "admin" || !doc.data().hidden) {
            connections_ids_docs.push(new Promise(async (resolve, reject) => {
                const doc_name = DEV_MODE ? doc.name : doc.data().name;
                const saved_windows_count = DEV_MODE ? doc.saved_windows_count : doc.data().saved_windows_count;

                connections.push({
                    title: `${doc_name} - [${saved_windows_count} saved windows]`,
                    value: doc.id,
                });

                const collection_data =
                    DEV_MODE
                        ? (await (await fetch(`${DEV_MODE_SERVER_IP}`)).json())[`${doc.id}`]
                        : await getDocs(collection(firebaseDB, doc.id));

                const collection_data_obj = {
                    id: doc.id,
                    data: collection_data.docs.map((doc) => DEV_MODE ? doc : doc.data()),
                };
                resolve(collection_data_obj)
            }))
        }
    });

    remote_settings?.docs.forEach(async (doc) => {
        remote_settings_docs[doc.id] = doc.data()
    })

    return Promise.all(connections_ids_docs).then(docs => {
        return {
            docs,
            connections,
            remote_settings: remote_settings_docs
        }
    })
};

export const sort = async (reverse_sort_obj, sort_type, new_setting) => {
    reverse_sort_obj[sort_type] = new_setting;
    try {
        await setDoc(doc(firebaseDB, "remote_settings", "reverse_sort"), reverse_sort_obj, {
            merge: true,
        });
    } catch (err) {
        console.log(err);
    }
};

export const editTab = async (connection, data) => {
    return new Promise(async (resolve, reject) => {
        try {
            const windowDocRef = doc(firebaseDB, connection, String(data.windowId));
            const window = (await getDoc(windowDocRef)).data();
            const tabToEditIndex = window?.tabs?.findIndex(tab => tab.id === data.id);
            let tabToEdit = window?.tabs?.find(tab => tab.id === data.id);
            tabToEdit = { ...data }

            window.tabs[tabToEditIndex] = tabToEdit;

            await setDoc(windowDocRef, window);
            resolve(true);

        } catch (err) {
            console.log(err);
            reject(err.message);
        }
    })
}

export const authenticate = async (typedPassword) => {
    if (!DEV_MODE) {
        const currentPasswords = await getDoc(doc(firebaseDB, "auth", "passwords"));
        const auth_level =
            typedPassword === currentPasswords.data().admin
                ? "admin"
                : typedPassword === currentPasswords.data().user
                    ? "user"
                    : null;
        setRoleLevel(auth_level);
        return auth_level !== null;
    } else {
        const res = await fetch(`${DEV_MODE_SERVER_IP}`);
        const data = await res.json();
        const password = data.auth.password.value;
        return password === typedPassword;
    }
}

const setRoleLevel = (auth_level) => {
    const cipherText = simpleCrypto.encrypt(auth_level);
    localStorage.setItem("auth_level", cipherText);
};

const getRoleLevel = () => {
    const decipherText = simpleCrypto.decrypt(localStorage.getItem("auth_level"));
    return decipherText;
};