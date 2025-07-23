<script setup>
import { ref, onMounted, watch, defineEmits } from 'vue';
import { v4 as uuidv4 } from 'uuid';

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
        if(data.profile?.social){
            products.value = data.profile?.social;
        }
        
    }
});

const products = ref([]);
const product = ref({});
const columns = ref([
    { field: 'platform', header: 'Platform' },
    { field: 'account', header: 'Account' }
]);

const platforms = ref([
    {label: "Instagram"},
    {label: "Twitter"},
    {label: "Facebook"},
    {label: "Linkedin"},
]);

const onCellEditComplete = (event) => {
    let { data, newValue, field } = event;

    data[field] = newValue;
};

const add = () => {
    const newItem = { 
        id: uuidv4(),
        platform: "", 
        account: "" 
    }
    products.value.push(newItem)
}

// delete
function deleteProduct(prod) {
    product.value = { ...prod };
    products.value = products.value.filter((val) => val.id !== product.value.id);
    product.value = {};
}

// send back data in product
const emit = defineEmits(['payload']);
watch(products, (newVal) => {
    emit('payload', newVal);
}, { deep: true });

</script>

<template>
    <div class="mt-4 flex flex-wrap gap-2">
        <Button label="Social Media" icon="pi pi-plus" iconPos="right" size="small" @click="add" />
    </div>
    <DataTable 
        :value="products" 
        editMode="cell" 
        @cell-edit-complete="onCellEditComplete"
        :pt="{
            table: { style: 'width: 50%' },
            column: {
                bodycell: ({ state }) => ({
                    class: [{ '!py-0': state['d_editing'] }]
                })
            }
        }"
    >
        <Column header="#" style="width: 1%" >
            <template #body="slotProps">
                {{ slotProps.index + 1 }}
            </template>
        </Column>
        <Column v-for="col of columns" :key="col.field" :field="col.field" :header="col.header" style="width: 50%">
            <template #body="{ data, field }">
                {{ field === 'platform' ? data[field].label : data[field] }}
            </template>
            <template #editor="{ data, field }">
                <template v-if="field !== 'platform'">
                    <InputText v-model.trim="data[field]" autofocus fluid />
                </template>
                <template v-else>
                    <Select v-model="data[field]" :options="platforms" optionLabel="label" placeholder="Select a Platform" class="w-full md:w-56" />
                </template>
            </template>
        </Column>
        <Column :exportable="false" style="width: 2%">
            <template #body="slotProps">
                <Button icon="pi pi-times" outlined rounded severity="danger" @click="deleteProduct(slotProps.data)" />
            </template>
        </Column>
    </DataTable>
</template>