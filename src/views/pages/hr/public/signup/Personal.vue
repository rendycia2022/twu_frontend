<script setup >
import { onMounted, ref, watch, defineEmits, defineProps } from 'vue';
import { useToast } from 'primevue/usetoast';
import axios from 'axios'

const toast = useToast();

// initialize data
const props = defineProps(['submit', 'initial']);

watch(() => props.initial, async (newValue, oldValue) => {
    product.value = newValue;
}, { deep: true });

// autosave callback
onMounted(() => {
    const saved = localStorage.getItem('profile')
    if (saved) {
        let data = JSON.parse(saved)
        product.value = data.profile?.personal;
    }
});

const submitted = ref(false);
onMounted(() => {
    submitted.value = false;
});

// submittedHandler
watch(() => props.submit, async (newValue, oldValue) => {
    submitted.value = newValue;
});

const product = ref({
    idCard: {},
    domicili: {},
    birth: {},
    bpjs: {},
    bank: {},
    body: {},
    sim: null
});

// send back data in product
const emit = defineEmits(['payload']);
watch(product, (newVal) => {
    if(newVal.birth.date){
        newVal.birth.date = formatDate(newVal.birth.date);
    }
    emit('payload', newVal);
}, { deep: true });

// formating
const formatDate = (date) => {
    if(date === null){
        return null;
    }

    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) 
        month = '0' + month;
    if (day.length < 2) 
        day = '0' + day;

    return [year, month, day].join('-');
}

// options
const option_house = ref([
    { label: 'Milik Sendiri'},
    { label: 'Keluarga'},
    { label: 'Kontrak'},
    { label: 'Kost'}
]);

const option_marital = ref([
    { label: 'Belum Menikah'},
    { label: 'Menikah'},
    { label: 'Janda/Duda'}
]);
const option_child = ref([
    { label: 'K/0'},
    { label: 'K/1'},
    { label: 'K/2'},
    { label: 'K/3'}
]);

// option address
onMounted( async () => {
    optionsProvinsi.value = await getProvinsi();
});

const optionsProvinsi = ref([]);
const getProvinsi = async () => {
    try {
        const response = await axios.get(`https://ibnux.github.io/data-indonesia/provinsi.json`)
        return response.data;
    } catch (error) {
        console.error('Gagal mengambil data lokasi:', error);
        return []; // atau null, tergantung kebutuhan
    }
}

const optionsKota = ref([]);
const optionsKecamatan = ref([]);
const optionsKelurahan = ref([]);

watch(()=> product.value.idCard, async (newVal) => {
    if(newVal.provinsi){
        optionsKota.value = await getLocation('kabupaten',newVal.provinsi.id);
    }
    if(newVal.kota){
        optionsKecamatan.value = await getLocation('kecamatan',newVal.kota.id);
    }
    if(newVal.kecamatan){
        optionsKelurahan.value = await getLocation('kelurahan',newVal.kecamatan.id);
    }
    if(newVal.kelurahan){
        let zip = await getZip(newVal.kelurahan);
        product.value.idCard.kodepos = zip.data.code;
    }
}, { deep: true });

const optionsKotaDomicili = ref([]);
const optionsKecamatanDomicili = ref([]);
const optionsKelurahanDomicili = ref([]);
watch(()=> product.value.domicili, async (newVal) => {
    if(newVal.provinsi){
        optionsKotaDomicili.value = await getLocation('kabupaten',newVal.provinsi.id);
    }
    if(newVal.kota){
        optionsKecamatanDomicili.value = await getLocation('kecamatan',newVal.kota.id);
    }
    if(newVal.kecamatan){
        optionsKelurahanDomicili.value = await getLocation('kelurahan',newVal.kecamatan.id);
    }
    if(newVal.kelurahan){
        let zip = await getZip(newVal.kelurahan);
        product.value.domicili.kodepos = zip.data.code;
    }
}, { deep: true });

const getLocation = async (location, id) => {
    try {
        const response = await axios.get(`https://ibnux.github.io/data-indonesia/${location}/${id}.json`)
        return response.data;
    } catch (error) {
        console.error('Gagal mengambil data lokasi:', error);
        return []; // atau null, tergantung kebutuhan
    }
}

const getZip = async (data) => {
    // get from kelurahan nama
    try {
        const response = await axios.get(`https://kodepos.vercel.app/detect/?latitude=${data.latitude}&longitude=${data.longitude}`)
        return response.data;
    } catch (error) {
        console.error('Gagal mengambil data lokasi:', error);
        return []; // atau null, tergantung kebutuhan
    }
}

// rules
watch(()=> product.value.marital, (newVal) => {
    if(newVal === 'Menikah'){
        delete product.value.child;
    }
});

</script>

<template>
    <Toast/>
    <div>
        <div class="mb-3" >
            <label for="ktp" class="block font-bold mb-1">No. KTP</label>
            <InputText id="ktp" v-model.trim="product.ktp" required="true" autofocus :invalid="submitted && !product.ktp" fluid />
            <small v-if="submitted && !product.ktp" class="text-red-500">required.</small>
        </div>
        <div class="mb-3" >
            <label for="email" class="block font-bold mb-1">Alamat Email</label>
            <InputText type="email" id="email" v-model.trim="product.email" required="true" autofocus :invalid="submitted && !product.email" fluid />
            <small v-if="submitted && !product.email" class="text-red-500">Email is required.</small>
        </div>
        <div class="mb-3" >
            <label for="name" class="block font-bold mb-1">Nama Lengkap</label>
            <InputText id="name" v-model.trim="product.name" required="true" autofocus :invalid="submitted && !product.name" fluid />
            <small v-if="submitted && !product.name" class="text-red-500">required.</small>
        </div>
        
        <!-- Alamat ID Card start -->
        <div class="mb-1" >
            <div>
                <label class="block font-bold mb-1">Alamat sesuai KTP</label>
            </div>
        </div>
        <div class="mb-2 grid grid-cols-1 md:grid-cols-3 gap-2" >
            <div>
                <Select id="provinsi" v-model="product.idCard.provinsi" :options="optionsProvinsi" optionLabel="nama" filter placeholder="Pilih Provinsi" autofocus :invalid="submitted && !product.idCard.provinsi" fluid />
                <small v-if="submitted && !product.idCard.provinsi" class="text-red-500">required.</small>
            </div>
            <div>
                <Select id="kota" v-model="product.idCard.kota" :options="optionsKota" optionLabel="nama" filter placeholder="Pilih Kota" autofocus :invalid="submitted && !product.idCard.kota" fluid />
                <small v-if="submitted && !product.idCard.kota" class="text-red-500">required.</small>
            </div>
            <div>
                <Select id="kecamatan" v-model="product.idCard.kecamatan" :options="optionsKecamatan" optionLabel="nama" filter placeholder="Pilih Kecamatan" autofocus :invalid="submitted && !product.idCard.kecamatan" fluid />
                <small v-if="submitted && !product.idCard.kecamatan" class="text-red-500">required.</small>
            </div>
            <div>
                <Select id="kelurahan" v-model="product.idCard.kelurahan" :options="optionsKelurahan" optionLabel="nama" filter placeholder="Pilih Kelurahan" autofocus :invalid="submitted && !product.idCard.kelurahan" fluid />
                <small v-if="submitted && !product.idCard.kelurahan" class="text-red-500">required.</small>
            </div>
            <div>
                <InputText id="kodepos" v-model.trim="product.idCard.kodepos" required="true" placeholder="Kode Pos" autofocus :invalid="submitted && !product.idCard.kodepos" fluid readonly />
                <small v-if="submitted && !product.idCard.kodepos" class="text-red-500">required.</small>
            </div>
        </div>
        <div class="mb-3 grid grid-cols-1 md:grid-cols-4 gap-2" >
            <div class="col-span-3">
                <InputText id="alamat" v-model.trim="product.idCard.alamat" required="true" placeholder="Alamat" autofocus :invalid="submitted && !product.idCard.alamat" fluid />
                <small v-if="submitted && !product.idCard.alamat" class="text-red-500">required.</small>
            </div>
            <div>
                <Select id="house" v-model="product.idCard.house" :options="option_house" optionLabel="label" required="true" placeholder="Pilih Status Rumah" autofocus :invalid="submitted && !product.idCard.house" fluid />
                <small v-if="submitted && !product.idCard.house" class="text-red-500">required.</small>
            </div>
        </div>
        <!-- Alamat ID Card end -->

        <!-- Alamat domicili start -->
        <div class="mb-1" >
            <div>
                <label class="block font-bold mb-1">Alamat Sekarang</label>
            </div>
        </div>
        <div class="mb-2 grid grid-cols-1 md:grid-cols-3 gap-2" >
            <div>
                <Select id="domiciliProvinsi" v-model="product.domicili.provinsi" :options="optionsProvinsi" optionLabel="nama" filter placeholder="Pilih Provinsi" autofocus :invalid="submitted && !product.domicili.provinsi" fluid />
                <small v-if="submitted && !product.domicili.provinsi" class="text-red-500">required.</small>
            </div>
            <div>
                <Select id="domiciliKota" v-model="product.domicili.kota" :options="optionsKotaDomicili" optionLabel="nama" filter placeholder="Pilih Kota" autofocus :invalid="submitted && !product.domicili.kota" fluid />
                <small v-if="submitted && !product.domicili.kota" class="text-red-500">required.</small>
            </div>
            <div>
                <Select id="domiciliKecamatan" v-model="product.domicili.kecamatan" :options="optionsKecamatanDomicili" optionLabel="nama" filter placeholder="Pilih Kecamatan" autofocus :invalid="submitted && !product.domicili.kecamatan" fluid />
                <small v-if="submitted && !product.domicili.kecamatan" class="text-red-500">required.</small>
            </div>
            <div>
                <Select id="domiciliKelurahan" v-model="product.domicili.kelurahan" :options="optionsKelurahanDomicili" optionLabel="nama" filter placeholder="Pilih Kelurahan" autofocus :invalid="submitted && !product.domicili.kelurahan" fluid />
                <small v-if="submitted && !product.domicili.kelurahan" class="text-red-500">required.</small>
            </div>
            <div>
                <InputText id="domiciliKodepos" v-model.trim="product.domicili.kodepos" required="true" placeholder="Kode Pos" autofocus :invalid="submitted && !product.domicili.kodepos" fluid readonly />
                <small v-if="submitted && !product.domicili.kodepos" class="text-red-500">required.</small>
            </div>
        </div>
        <div class="mb-3 grid grid-cols-1 md:grid-cols-4 gap-2" >
            <div class="col-span-3">
                <InputText id="domiciliAlamat" v-model.trim="product.domicili.alamat" required="true" placeholder="Alamat" autofocus :invalid="submitted && !product.domicili.alamat" fluid />
                <small v-if="submitted && !product.domicili.alamat" class="text-red-500">required.</small>
            </div>
            <div>
                <Select id="domiciliHouse" v-model="product.domicili.house" :options="option_house" optionLabel="label" required="true" placeholder="Pilih Status Rumah" autofocus :invalid="submitted && !product.domicili.house" fluid />
                <small v-if="submitted && !product.domicili.house" class="text-red-500">required.</small>
            </div>
        </div>
        <!-- Alamat domicili end -->
        
        <div class="mb-3 grid grid-cols-1 md:grid-cols-2 gap-4" >
            <div>
                <label for="birth_place" class="block font-bold mb-1">Tempat Lahir</label>
                <InputText id="birth_place" v-model.trim="product.birth.place" required="true" autofocus :invalid="submitted && !product.birth.place" fluid />
                <small v-if="submitted && !product.birth.place" class="text-red-500">required.</small>
            </div>
            <div>
                <label for="birth_date" class="block font-bold mb-1">Tanggal Lahir</label>
                <DatePicker 
                    id="birth_date"
                    v-model="product.birth.date" 
                    dateFormat="yy-mm-dd" 
                    class="w-full" 
                    :selectOtherMonths="true" :showIcon="true" :showButtonBar="true" 
                    :invalid="submitted && !product.birth.date"
                />
                <small v-if="submitted && !product.birth.date" class="text-red-500">required.</small>
            </div>
        </div>
        <div class="mb-3" >
            <label for="gender" class="block font-bold mb-1">Jenis Kelamin</label>
            <div class="flex flex-wrap gap-4">
                <div class="flex items-center gap-2">
                    <RadioButton v-model="product.gender" inputId="pria" name="pria" value="Pria" />
                    <label for="pria">Pria</label>
                </div>
                <div class="flex items-center gap-2">
                    <RadioButton v-model="product.gender" inputId="wanita" name="wanita" value="Wanita" />
                    <label for="wanita">Wanita</label>
                </div>
            </div>
            <small v-if="submitted && !product.gender" class="text-red-500">required.</small>
        </div>
        <div class="mb-3 grid grid-cols-1 md:grid-cols-3 gap-2">
            <div>
                <label for="citizenship" class="block font-bold mb-1">Kewarganegaraan</label>
                <InputText id="citizenship" v-model.trim="product.citizenship" required="true" autofocus :invalid="submitted && !product.citizenship" fluid />
                <small v-if="submitted && !product.citizenship" class="text-red-500">required.</small>
            </div>
            <div>
                <label for="religion" class="block font-bold mb-1">Agama</label>
                <InputText id="religion" v-model.trim="product.religion" required="true" autofocus :invalid="submitted && !product.religion" fluid />
                <small v-if="submitted && !product.religion" class="text-red-500">required.</small>
            </div>
            <div>
                <label for="ethnic" class="block font-bold mb-1">Suku</label>
                <InputText id="ethnic" v-model.trim="product.ethnic" required="true" autofocus :invalid="submitted && !product.ethnic" fluid />
                <small v-if="submitted && !product.ethnic" class="text-red-500">required.</small>
            </div>
        </div>
        <div class="mb-3 grid grid-cols-1 md:grid-cols-3 gap-2">
            <div>
                <label for="marital" class="block font-bold mb-1">Status Perkawinan</label>
                <Select id="marital" v-model="product.marital" :options="option_marital" optionLabel="label" placeholder="Pilih Status Perkawinan" autofocus :invalid="submitted && !product.marital" fluid />
                <small v-if="submitted && !product.marital" class="text-red-500">required.</small>
            </div>
            <div v-if="product.marital?.label === 'Menikah'">
                <label for="child" class="block font-bold mb-1">*Bagi yang sudah menikah</label>
                <Select id="child" v-model="product.child" :options="option_child" optionLabel="label" placeholder="Pilih Jumlah Anak" autofocus fluid />
            </div>
        </div>
        <div class="mb-3">
            <label for="sim" class="block font-bold mb-1">SIM</label>
            <div class="flex flex-wrap gap-5">
                <div class="flex items-center gap-2">
                    <Checkbox v-model="product.sim" inputId="simA" name="sim" value="SIM A" />
                    <label for="simA">SIM A</label>
                </div>
                <div class="flex items-center gap-2">
                    <Checkbox v-model="product.sim" inputId="simB" name="sim" value="SIM B"/>
                    <label for="simB">SIM B</label>
                </div>
                <div class="flex items-center gap-2">
                    <Checkbox v-model="product.sim" inputId="simC" name="sim" value="SIM C" />
                    <label for="simC">SIM C</label>
                </div>
            </div>
        </div>
        <div class="mb-3" >
            <label for="phone" class="block font-bold mb-1">Nomor Telepon</label>
            <InputText type="number" id="phone" v-model.trim="product.phone" required="true" :invalid="submitted && !product.phone" fluid />
            <small v-if="submitted && !product.phone" class="text-red-500">required.</small>
        </div>
        <div class="mb-1">
            <label for="bpjsKetenagakerjaan" class="block font-bold mb-1">BPJS</label>
        </div>
        <div class="mb-3 grid grid-cols-1 md:grid-cols-2 gap-2" >
            <div>
                <InputText id="bpjsKetenagakerjaan" v-model.trim="product.bpjs.ketenagakerjaan" placeholder="Ketenagakerjaan" autofocus fluid />
            </div>
            <div>
                <InputText id="bpjsKesehatan" v-model.trim="product.bpjs.Kesehatan" placeholder="Kesehatan" autofocus fluid />
            </div>
        </div>
        <div>
            <div class="mb-1">
                <label for="bpjsKetenagakerjaan" class="block font-bold mb-1">Tinggi dan Berat Badan</label>
            </div>
            <div class="mb-3 grid grid-cols-1 md:grid-cols-2 gap-2" >
                <InputText type="number" id="bodyHeight" v-model.trim="product.body.height" placeholder="Tinggi (Cm)" autofocus fluid />
                <InputText type="number" id="bodyWeight" v-model.trim="product.body.weight" placeholder="Berat (Kg)" autofocus fluid />
            </div>
        </div>
        <div class="mb-3" >
            <label for="npwp" class="block font-bold mb-1">Nomor NPWP</label>
            <InputText type="number" id="npwp" v-model.trim="product.npwp" autofocus fluid />
        </div>
        <div>
            <div class="mb-1">
                <label for="bpjsKetenagakerjaan" class="block font-bold mb-1">Bank Info</label>
            </div>
            <div class="mb-3 grid grid-cols-1 md:grid-cols-3 gap-2" >
                <div>
                    <InputText id="bankName" v-model.trim="product.bank.name" placeholder="Nama Bank" autofocus fluid />
                </div>
                <div class="col-span-2">
                    <InputText type="number" id="bankAccount" v-model.trim="product.bank.account" placeholder="Nomor Rekening" autofocus fluid />
                </div>
            </div>
        </div>
    </div>
</template>
