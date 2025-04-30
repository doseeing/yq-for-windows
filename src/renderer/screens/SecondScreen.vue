<script setup lang="tsx">
import { ref } from 'vue'
import { openExternal } from '@/renderer/utils'

const json = ref('{"key": "value"}')
const yaml = ref('')
const handleConvert = async () => {
  const result = await openExternal(json.value)

  if (result) {
    yaml.value = result
  }
}
</script>

<template>
  <v-container>
    <v-row no-gutters class="text-center">
      <v-col cols="12">
        <v-textarea label="JSON" v-model="json"></v-textarea>
      </v-col>
      <v-col cols="12" class="my-4">
        <v-btn color="primary" @click="handleConvert"> convert </v-btn>
      </v-col>
      <v-col cols="12">
        <v-textarea label="YAML" v-model="yaml"></v-textarea>
      </v-col>
    </v-row>
  </v-container>
</template>
