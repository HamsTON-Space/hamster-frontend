<template>
    <a-breadcrumb :routes="routes">
        <template #itemRender="{ route }">
            <span v-if="routes.indexOf(route) === routes.length - 1">
                {{ route.breadcrumbName }}
            </span>
            <router-link v-else :to="route.path">
                {{ route.breadcrumbName }}
            </router-link>
        </template>
    </a-breadcrumb>
</template>
<script setup lang="ts" name="BreadCrumb">
    defineProps({
        routes: {
            type: Array,
            default: () => [],
        },
    });
</script>
<style scoped lang="less">
</style>