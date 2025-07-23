<script setup>
import { ref, onMounted, watch, defineEmits } from 'vue';

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
        if(data.profile?.education){
            products.value = data.profile?.education;
        }
        
    }
});

const products = ref([
    {level: "SD"},
    {level: "SMP"},
    {level: "SMA"},
    {level: "Akademi/ Diploma"},
    {level: "Universitas (S1)"},
    {level: "Universitas (S2)"},
]);
const columns = ref([
    { field: 'school', header: 'Nama Sekolah / Kota', headerStyle: "width: 20%" },
    { field: 'major', header: 'Jurusan', headerStyle: "width: 20%" },
    { field: 'from', header: 'Dari (Tahun)', headerStyle: "width: 15%", inputStyle: "year" },
    { field: 'to', header: 'Sampai (Tahun)', headerStyle: "width: 15%", inputStyle: "year" },
    { field: 'value', header: 'Rata-rata Nilai / IPK', headerStyle: "width: 10%", inputStyle: "number" },
    { field: 'graduate', header: 'Lulus', headerStyle: "width: 15%", },
]);

const graduates = ref([
    "Lulus",
    "Tidak Lulus",
]);

const onCellEditComplete = (event) => {
    let { data, newValue, field } = event;

    data[field] = newValue;
};

// send back data in product
const emit = defineEmits(['payload']);
watch(products, (newVal) => {
    emit('payload', newVal);
}, { deep: true });

// formating
function formatNumber(data) {
    // Hanya izinkan angka dan titik
    const cleaned = data.replace(/[^0-9.]/g, '')

    // Konversi ke float jika valid
    const parsed = parseFloat(cleaned)
    let number = isNaN(parsed) ? null : parsed

    return number;
}

</script>

<template>
    <DataTable 
        :value="products" 
        editMode="cell" 
        @cell-edit-complete="onCellEditComplete"
        showGridlines
        :pt="{
            table: { style: 'width: 100%' },
            column: {
                bodycell: ({ state }) => ({
                    class: [{ '!py-0': state['d_editing'] }]
                })
            }
        }"
    >
        <Column header="#" headerStyle="width: 1%" >
            <template #body="slotProps">
                {{ slotProps.index + 1 }}
            </template>
        </Column>
        <Column field="level" header="Tingkat" headerStyle="width: 15%" ></Column>
        <Column v-for="col of columns" :key="col.field" :field="col.field" :header="col.header" :headerStyle="col.headerStyle" >
            <template #body="{ data, field }">
                {{ data[field] }}
            </template>
            <template #editor="{ data, field }">
                <template v-if="field === 'graduate'">
                    <Select v-model="data[field]" :options="graduates" placeholder="Select a Platform" class="w-full md:w-56" />
                </template>
                <template v-else-if="col.inputStyle === 'year'">
                    <InputNumber v-model="data[field]" inputId="minmax" :min="0" fluid placeholder="yyyy" :useGrouping="false" />
                </template>
                <template v-else-if="col.inputStyle === 'number'">
                    <InputText type="number" v-model="data[field]" autofocus fluid @value-change="formatNumber(data[field])" />
                </template>
                <template v-else>
                    <InputText v-model.trim="data[field]" autofocus fluid />
                </template>
            </template>
        </Column>
    </DataTable>
</template>