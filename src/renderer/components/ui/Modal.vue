<template>
    <div :id="id" class="modal fade" id="exampleModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header" v-if="slots.header">
                    <slot name="header"></slot>
                </div>
                <div class="modal-body">
                    <slot></slot>
                </div>
                <div class="modal-footer" v-if="slots.footer">
                    <slot name="footer"></slot>  
                </div>
            </div>
        </div>
    </div>
</template>
<script setup>
    import { getCurrentInstance } from 'vue';
    const { slots } = getCurrentInstance();
    const props = defineProps({
        id: {
            type: String,
            default: 'modal'
        }
    });
</script>
