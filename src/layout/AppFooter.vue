<script setup>
    const getYear = () =>{
        const d = new Date();
        let year = d.getFullYear();

        return year;
    }
</script>

<template>
    <div class="layout-footer">
        © {{ getYear() }} <a href="https://www.twurefinery.com/" target="_blank" rel="noopener noreferrer" class="text-primary font-bold hover:underline">Tri Wahana Universal</a> Inc.
        
    </div>
</template>
