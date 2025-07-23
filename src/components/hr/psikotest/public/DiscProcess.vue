<script setup >
import { onMounted, ref } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useRouter } from 'vue-router';

import {axiosHr} from '@/service/axios';

const router = useRouter();
const publicAccount = ref({
    public_token: localStorage.getItem('public_token'),
    candidate_code: localStorage.getItem('candidate_code'),
});

onMounted( () => {
    fetch();
});

const fetch = async () =>{
    const response = await axiosHr.get('/psikotest/public/process/disc',{
        params:{
            candidate_code: publicAccount.value.candidate_code,
        }
    });
    products.value = response.data;
}

// data
const products = ref();

// editing
const payload = ref({});
const onCellEditComplete = async (event) => {
    let { data, newValue, field } = event;

    payload.value = data;
    payload.value[field] = newValue.toUpperCase();
    
    const newData = payload.value;
    await axiosHr.put('/psikotest/public/process/disc', newData, {
        params:{
            public_token: publicAccount.value.public_token,
            candidate_code: publicAccount.value.candidate_code,
        }
    });

    fetch();
};

const validateKeyPress = (event) => {
  const allowedKeys = ['P', 'K', 'p', 'k'];
  if (!allowedKeys.includes(event.key)) {
    event.preventDefault(); // Mencegah karakter lain masuk
  }
};

const rowClass = (data) => {
    return [{ '!bg-blue-200': data.representative.number%2 == 0 }];
};

</script>

<template>
    <div class="text-center">
        <h1>Selamat mengerjakan</h1>
        <h5 class="mb-3 font-bold">Silahkan kerjakan sesuai dengan instruksi!</h5>
        
    </div>
    
    <DataTable
        :value="products" 
        dataKey="code"
        rowGroupMode="rowspan" 
        groupRowsBy="representative.number"
        tableStyle="min-width: 50rem"
        scrollable scrollHeight="550px"
        showGridlines
        :paginator="true"
        :rows="products?.length"
        paginatorTemplate="CurrentPageReport"
        currentPageReportTemplate="Showing {totalRecords} Items"
        editMode="cell" @cell-edit-complete="onCellEditComplete"
        :rowClass="rowClass"
    >
        <template #paginatorstart>
        </template>
        <template #paginatorend>
        </template>

        <Column field="representative.number" header="Number" style="width: 1%">
            <template #body="slotProps">
                <div class="item-center text-center gap-2" >
                    <span>{{ slotProps.data.representative.number }}</span>
                </div>
            </template>
        </Column>
        <Column field="question_value" header="Answer" style="width: 1%" >
            <template #body="slotProps">
                <div class="item-center text-center gap-2" >
                    <span>{{ slotProps.data.question_value }}</span>
                </div>
            </template>
            <template #editor="{ data, field }">
                <InputText v-model="data[field]" maxlength="1" autofocus fluid @keypress="validateKeyPress" />
            </template>
        </Column>
        <Column field="question" header="Statement" style="width: 20%"></Column>
        
    </DataTable>
</template>