<script setup>
import { ref, onMounted, watch, defineEmits, } from "vue";
import { v4 as uuidv4 } from 'uuid';

const products = ref([]);

// initialize data
const props = defineProps(['initial']);

watch(() => props.initial, async (newValue, oldValue) => {
    products.value = newValue;
}, { deep: true });

// autosave callback
onMounted(() => {
    const saved = localStorage.getItem('profile')
    if (saved) {
        let data = JSON.parse(saved)
        if(data.profile?.experience){
            products.value = data.profile?.experience;
        }
        
    }
});

const product = ref({});
const productDialog = ref(false);
const submitted = ref(false);

function saveProduct() {
    submitted.value = true;
    if (product?.value.company?.trim() && product?.value.position?.trim()) {
        if (product.value.id) {
            products.value[findIndexById(product.value.id)] = product.value;
        } else {
            product.value.id = uuidv4();
            products.value.push(product.value);
        }

        productDialog.value = false;
        product.value = {};
    }
}

// send back data in product
const emit = defineEmits(['payload']);
watch(products, (newVal) => {
    emit('payload', newVal);
}, { deep: true });

function openNew() {
    product.value = {};
    submitted.value = false;
    productDialog.value = true;
}

// edit
function editProduct(prod) {
    product.value = { ...prod };
    productDialog.value = true;
}

// delete
const deleteProductDialog = ref(false);

function confirmDeleteProduct(prod) {
    product.value = prod;
    deleteProductDialog.value = true;
}

function deleteProduct() {
    products.value = products.value.filter((val) => val.id !== product.value.id);
    deleteProductDialog.value = false;
    product.value = {};
}

// searching
function findIndexById(id) {
    let index = -1;
    for (let i = 0; i < products.value.length; i++) {
        if (products.value[i].id === id) {
            index = i;
            break;
        }
    }

    return index;
}

</script>
<template>
    <DataView :value="products.sort((a, b) => b.to - a.to)" layout="grid">
        <template #header>
            
            <div class="flex justify-start">
                <Button label="New" icon="pi pi-plus" class="mr-2" @click="openNew" size="small" />
                <div class="mt-2">total {{ products ? products.length : 0 }} Pengalaman</div>
            </div>
        </template>

        <template #grid="slotProps">
            <div class="grid grid-cols-12 gap-1">
                <div v-for="(item, index) in slotProps.items" :key="index" class="col-span-12 sm:col-span-12 md:col-span-6 xl:col-span-6 p-2">
                    <div class="p-6 border border-surface-200 dark:border-surface-700 bg-surface-0 dark:bg-surface-900 rounded flex flex-col">
                        <div class="flex flex-row justify-between items-start gap-2">
                            <div>
                                <div class="text-md font-medium">Perusahaan:</div>
                                <div class="text-xl font-medium">{{ item.company }}</div>
                                <div class="text-surface-500 dark:text-surface-400 text-sm">Tipe Usaha: <span class="text-md font-medium">{{ item.type }}</span></div>
                                <div class="text-surface-400 dark:text-surface-400 text-sm">{{ item.address ? item.address : '-' }}</div>
                                <div class="text-surface-400 dark:text-surface-400 text-sm">{{ item.phone ? item.phone : '-'}}</div>
                            </div>
                        </div>
                        <div class="flex flex-col gap-6 mt-5">
                            <div>
                                <div class="text-md font-medium">Sebagai:</div>
                                <div class="text-2xl font-semibold">{{ item.position }}</div>
                                <div class="text-surface-500 dark:text-surface-400 text-md">{{ item.from }}-{{ item.to }}</div>
                                <div class="text-surface-500 dark:text-surface-400 text-sm">Nama Atasan: {{ item.head ? item.head : '-' }}</div>
                            </div>
                            <div>
                                <div class="text-sm font-semibold">Alasan Berhenti:</div>
                                <pre class="text-surface-500 dark:text-surface-400 text-sm one-line" :title="item.reason">{{ item.reason ? item.reason : '-' }}</pre>
                            </div>
                            <div>
                                <div class="text-sm font-semibold">Prestasi:</div>
                                <pre class="text-surface-500 dark:text-surface-400 text-sm one-line" :title="item.achievement">{{ item.achievement ? item.achievement : '-' }}</pre>
                            </div>
                            <div class="flex justify-end gap-2">
                                <Button icon="pi pi-pencil" outlined @click="editProduct(item)" title="edit" ></Button>
                                <Button icon="pi pi-times" severity="danger" outlined @click="confirmDeleteProduct(item)" title="remove"></Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </template>
    </DataView>

    <Dialog v-model:visible="productDialog" :style="{ width: '720px' }" header="Item's Details" :modal="true">
        <div class="flex flex-col gap-4">
            <div>
                <label for="company" class="block font-bold mb-1">Nama Perusahaan</label>
                <InputText id="company" v-model.trim="product.company" required="true" autofocus :invalid="submitted && !product.company" fluid />
                <small v-if="submitted && !product.company" class="text-red-500">required.</small>
            </div>
            <div>
                <label for="type" class="block font-bold mb-1">Jenis Usaha</label>
                <InputText id="type" v-model.trim="product.type" autofocus fluid />
            </div>
            <div>
                <label for="address" class="block font-bold mb-1">Alamat</label>
                <Textarea id="address" v-model="product.address" rows="3" cols="20" fluid />
            </div>
            <div>
                <label for="phone" class="block font-bold mb-1">Telphone</label>
                <InputText type="number" id="phone" v-model.trim="product.phone" autofocus fluid />
            </div>
            <div>
                <label for="position" class="block font-bold mb-1">Jabatan</label>
                <InputText id="position" v-model.trim="product.position" required="true" autofocus :invalid="submitted && !product.position" fluid />
                <small v-if="submitted && !product.position" class="text-red-500">required.</small>
            </div>
            <div>
                <label for="periode" class="block font-bold mb-1">Lama bekerja</label>
                <div class="mb-3 grid grid-cols-1 md:grid-cols-2 gap-2" >
                    <div>
                        <InputNumber v-model="product.from" inputId="minmax" :min="0" fluid required="true" :useGrouping="false" :invalid="submitted && !product.from" placeholder="Dari Tahun (format: yyyy)" />
                        <small v-if="submitted && !product.from" class="text-red-500">required.</small>
                    </div>
                    <div>
                        <InputNumber v-model="product.to" inputId="minmax" :min="0" :max="9999" fluid required="true" :useGrouping="false" :invalid="submitted && !product.to" placeholder="Sampai Tahun (format: yyyy)" />
                        <small v-if="submitted && !product.to" class="text-red-500">required.</small>
                    </div>
                </div>
            </div>
            <div>
                <label for="head" class="block font-bold mb-1">Nama Atasan</label>
                <InputText id="head" v-model.trim="product.head" autofocus fluid />
            </div>
            <div>
                <label for="reason" class="block font-bold mb-1">Alasan Berhenti</label>
                <Textarea id="reason" v-model="product.reason" rows="5" cols="20" fluid />
            </div>
            <div>
                <label for="achievement" class="block font-bold mb-1">Prestasi yang pernah diraih</label>
                <Textarea id="achievement" v-model="product.achievement" rows="5" cols="20" fluid />
            </div>
        </div>

        <template #footer>
            <Button label="Save" icon="pi pi-check" @click="saveProduct" />
        </template>
    </Dialog>

    <Dialog v-model:visible="deleteProductDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
        <div class="flex items-center gap-4">
            <i class="pi pi-exclamation-triangle !text-3xl" />
            <span v-if="product"
                >Are you sure you want to delete <b>nama Perusahaan, Jabatan Terakhir</b
                >?</span
            >
        </div>
        <template #footer>
            <Button label="Remove" icon="pi pi-check" severity="danger" @click="deleteProduct" />
        </template>
    </Dialog>
    
</template>
<style>

.one-line {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

</style>