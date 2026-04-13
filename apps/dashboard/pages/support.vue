<template>
  <div class="min-h-screen bg-fuse-black">
    <main class="max-w-3xl mx-auto px-6 py-10 animate-slide-up">
      <div class="panel p-6">
        <div class="mb-6">
          <p class="text-[10px] uppercase tracking-[0.35em] text-fuse-dim mb-2">Support</p>
          <h1 class="text-3xl font-bold text-fuse-text mb-2">Support & limit requests</h1>
          <p class="text-fuse-dim text-sm">Submit account help, general questions, or limit increase requests here. We’ll reply as soon as possible.</p>
        </div>

        <div v-if="pendingLimitRequest" class="mb-4 rounded-2xl border border-fuse-yellow/25 bg-fuse-yellow/[0.05] p-4 text-sm text-fuse-yellow">
          A limit increase request is already pending. You can still submit a general question, but additional slot requests will be reviewed before a new one is accepted.
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          <div class="field-group">
            <label class="field-label">Subject</label>
            <select v-model="support.subject" class="field-input text-xs" :disabled="supportLoading">
              <option v-for="subject in supportSubjects" :key="subject" :value="subject">{{ subject }}</option>
            </select>
          </div>
          <div class="field-group">
            <label class="field-label">Priority</label>
            <input disabled value="Standard" type="text" class="field-input text-xs" />
          </div>
        </div>

        <div class="field-group mb-4">
          <label class="field-label">Message</label>
          <textarea
            v-model="support.message"
            rows="6"
            class="field-input text-xs font-mono resize-none"
            placeholder="Describe your request in detail..."
          ></textarea>
        </div>

        <div class="flex flex-col gap-3">
          <div v-if="supportStatus" :class="supportStatus.type === 'success' ? 'text-fuse-green' : 'text-fuse-red'" class="text-sm font-mono">
            {{ supportStatus.message }}
          </div>

          <button
            @click="submitSupportTicket"
            :disabled="supportLoading || !support.message.trim() || (pendingLimitRequest && support.subject === 'Limit Increase Request')"
            class="btn-primary w-full sm:w-auto"
          >
            {{ supportLoading ? 'Sending request…' : 'Submit ticket' }}
          </button>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useFetch } from '#imports'

definePageMeta({ middleware: 'auth' })

const supportSubjects = ['Limit Increase Request', 'General Query']
const support = reactive({ subject: supportSubjects[0], message: '' })
const supportStatus = ref<{ type: 'success' | 'error'; message: string } | null>(null)
const supportLoading = ref(false)
const pendingLimitRequest = ref(false)

async function loadPendingSupportStatus() {
  try {
    const result = await $fetch<{ pending: boolean }>('/api/support/pending')
    pendingLimitRequest.value = result.pending
  } catch {
    pendingLimitRequest.value = false
  }
}

async function submitSupportTicket() {
  supportStatus.value = null
  supportLoading.value = true

  try {
    await $fetch('/api/support', {
      method: 'POST',
      body: {
        subject: support.subject,
        message: support.message,
      },
    })

    supportStatus.value = { type: 'success', message: 'Support ticket submitted successfully.' }
    support.message = ''
    if (support.subject === 'Limit Increase Request') {
      pendingLimitRequest.value = true
    }
  } catch (err: any) {
    supportStatus.value = { type: 'error', message: err?.data?.message || err?.message || 'Failed to submit ticket.' }
  } finally {
    supportLoading.value = false
  }
}

onMounted(() => {
  loadPendingSupportStatus()
})
</script>
