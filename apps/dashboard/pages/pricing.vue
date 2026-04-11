<template>
    <div class="min-h-screen bg-fuse-black relative overflow-hidden">
        <div class="absolute inset-0 pointer-events-none">
            <div
                class="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-fuse-red/[0.04] rounded-full blur-3xl" />
            <div class="absolute bottom-0 right-0 w-64 h-64 bg-fuse-purple/[0.03] rounded-full blur-3xl" />
        </div>

        <nav class="border-b border-white/[0.07] px-6 py-3 flex items-center justify-between sticky top-0 z-10"
            style="background: rgba(10,10,10,0.8); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);">
            <div class="flex items-center gap-3">
                <button @click="navigateTo('/projects')"
                    class="text-fuse-dim hover:text-fuse-text transition-colors text-xs flex items-center gap-1.5 font-mono">
                    ← Projects
                </button>
                <span class="text-white/10">/</span>
                <span class="text-fuse-text text-xs font-mono">Pricing</span>
            </div>
        </nav>

        <main class="max-w-4xl mx-auto px-6 py-16 relative z-10 animate-slide-up">
            <div class="text-center mb-12">
                <div class="inline-flex items-center gap-2 border border-fuse-red/20 bg-fuse-red/[0.06] text-fuse-red text-[10px] font-mono uppercase tracking-widest px-3 py-1 rounded-full mb-4"
                    style="backdrop-filter: blur(8px);">
                    Upgrade plan
                </div>
                <h1 class="text-3xl font-bold text-fuse-text mb-2">Simple, predictable pricing</h1>
                <p class="text-fuse-dim text-sm max-w-sm mx-auto">One tool, clear tiers. No seats, no per-client fees —
                    just projects.</p>
            </div>

            <!-- Billing toggle -->
            <div class="flex items-center justify-center gap-3 mb-10">
                <span class="text-xs font-mono"
                    :class="billing === 'monthly' ? 'text-fuse-text' : 'text-fuse-dim'">Monthly</span>
                <button @click="billing = billing === 'monthly' ? 'yearly' : 'monthly'"
                    class="relative w-9 h-5 rounded-full border border-white/[0.12] transition-colors duration-200"
                    :class="billing === 'yearly' ? 'bg-fuse-red/30' : 'bg-white/[0.06]'"
                    style="backdrop-filter: blur(8px);">
                    <span class="absolute top-0.5 w-4 h-4 rounded-full transition-all duration-200"
                        :class="billing === 'yearly' ? 'left-4 bg-fuse-red' : 'left-0.5 bg-fuse-dim'" />
                </button>
                <span class="text-xs font-mono" :class="billing === 'yearly' ? 'text-fuse-text' : 'text-fuse-dim'">
                    Yearly
                    <span class="ml-1 text-fuse-green text-[9px]">–20%</span>
                </span>
            </div>

            <!-- Plans -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div v-for="plan in plans" :key="plan.id" class="plan-card relative"
                    :class="plan.featured ? 'plan-card--featured' : ''">
                    <div v-if="plan.featured" class="absolute -top-px left-1/2 -translate-x-1/2">
                        <span
                            class="text-[9px] font-mono font-bold uppercase tracking-widest bg-fuse-red text-white px-3 py-0.5 rounded-b-md">
                            Most popular
                        </span>
                    </div>

                    <div class="mb-4">
                        <div class="flex items-center gap-2 mb-1">
                            <span class="text-sm font-bold text-fuse-text">{{ plan.name }}</span>
                            <span v-if="plan.badge"
                                class="text-[9px] font-mono border border-fuse-purple/30 text-fuse-purple bg-fuse-purple/[0.06] px-1.5 py-0.5 rounded">
                                {{ plan.badge }}
                            </span>
                        </div>
                        <p class="text-fuse-dim text-xs">{{ plan.desc }}</p>
                    </div>

                    <div class="mb-5">
                        <div class="flex items-end gap-1">
                            <span class="text-2xl font-bold text-fuse-text font-mono">${{ billing === 'yearly' ?
                                plan.yearlyPrice : plan.monthlyPrice }}</span>
                            <span class="text-fuse-dim text-xs mb-1 font-mono">/mo</span>
                        </div>
                        <p v-if="billing === 'yearly'" class="text-fuse-dim text-[10px] font-mono">billed ${{
                            plan.yearlyPrice * 12 }}/yr</p>
                    </div>

                    <div class="space-y-2 mb-6">
                        <div v-for="feature in plan.features" :key="feature.text" class="flex items-start gap-2 text-xs"
                            :class="feature.included ? 'text-fuse-dim' : 'text-fuse-muted line-through'">
                            <span class="mt-0.5 flex-shrink-0 text-[10px]"
                                :class="feature.included ? 'text-fuse-green' : 'text-fuse-muted'">
                                {{ feature.included ? '✓' : '×' }}
                            </span>
                            {{ feature.text }}
                        </div>
                    </div>

                    <button @click="handleUpgrade(plan)"
                        class="w-full py-2 rounded-lg text-xs font-bold font-mono uppercase tracking-widest transition-all duration-150"
                        :class="plan.featured
                            ? 'bg-fuse-red hover:bg-red-500 text-white shadow-lg shadow-fuse-red/10'
                            : plan.id === 'free'
                                ? 'border border-white/[0.1] text-fuse-dim hover:text-fuse-text hover:border-white/[0.2]'
                                : 'border border-fuse-red/30 text-fuse-red hover:bg-fuse-red/[0.08]'">
                        {{ plan.cta }}
                    </button>
                </div>
            </div>

            <!-- Feature comparison -->
            <div class="mt-14">
                <h2 class="text-xs font-mono text-fuse-dim uppercase tracking-widest mb-5 text-center">Full comparison
                </h2>
                <div class="glass-table">
                    <div class="comparison-header">
                        <span class="text-xs font-mono text-fuse-dim">Feature</span>
                        <span v-for="plan in plans" :key="plan.id" class="text-xs font-mono text-center"
                            :class="plan.featured ? 'text-fuse-red' : 'text-fuse-dim'">{{ plan.name }}</span>
                    </div>
                    <div v-for="row in comparison" :key="row.feature" class="comparison-row">
                        <span class="text-xs text-fuse-dim">{{ row.feature }}</span>
                        <span v-for="(val, i) in row.values" :key="i" class="text-xs font-mono text-center"
                            :class="val === '✓' ? 'text-fuse-green' : val === '—' ? 'text-fuse-muted' : 'text-fuse-text'">
                            {{ val }}
                        </span>
                    </div>
                </div>
            </div>

            <!-- FAQ -->
            <div class="mt-14 max-w-2xl mx-auto">
                <h2 class="text-xs font-mono text-fuse-dim uppercase tracking-widest mb-6 text-center">Questions</h2>
                <div class="space-y-2">
                    <div v-for="faq in faqs" :key="faq.q" class="faq-item" :class="faq.open ? 'faq-item--open' : ''"
                        @click="faq.open = !faq.open">
                        <div class="flex items-center justify-between gap-3">
                            <span class="text-sm text-fuse-text">{{ faq.q }}</span>
                            <span class="text-fuse-dim text-xs flex-shrink-0 transition-transform duration-150"
                                :class="faq.open ? 'rotate-180' : ''">▾</span>
                        </div>
                        <p v-if="faq.open" class="text-xs text-fuse-dim mt-2.5 leading-relaxed">{{ faq.a }}</p>
                    </div>
                </div>
            </div>

            <p class="text-center text-fuse-muted text-[10px] font-mono mt-12">
                Questions? <a href="mailto:hi@deadfuse.dev"
                    class="text-fuse-dim hover:text-fuse-text transition-colors">hi@deadfuse.dev</a>
            </p>
        </main>
    </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })

const billing = ref<'monthly' | 'yearly'>('monthly')

const plans = [
    {
        id: 'free',
        name: 'Free',
        badge: null,
        desc: 'For solo freelancers getting started.',
        monthlyPrice: 0,
        yearlyPrice: 0,
        featured: false,
        cta: 'Current plan',
        features: [
            { text: '2 projects', included: true },
            { text: 'All 8 states', included: true },
            { text: 'Supabase Realtime', included: true },
            { text: 'GitHub login', included: true },
            { text: 'Priority support', included: false },
            { text: 'Custom domain', included: false },
            { text: 'Team members', included: false },
        ],
    },
    {
        id: 'pro',
        name: 'Pro',
        badge: null,
        desc: 'For active freelancers with multiple clients.',
        monthlyPrice: 12,
        yearlyPrice: 10,
        featured: true,
        cta: 'Upgrade to Pro',
        features: [
            { text: '25 projects', included: true },
            { text: 'All 8 states', included: true },
            { text: 'Supabase Realtime', included: true },
            { text: 'GitHub login', included: true },
            { text: 'Priority support', included: true },
            { text: 'Custom domain', included: true },
            { text: 'Team members', included: false },
        ],
    },
    {
        id: 'agency',
        name: 'Agency',
        badge: 'New',
        desc: 'For studios managing clients at scale.',
        monthlyPrice: 39,
        yearlyPrice: 32,
        featured: false,
        cta: 'Upgrade to Agency',
        features: [
            { text: 'Unlimited projects', included: true },
            { text: 'All 8 states', included: true },
            { text: 'Supabase Realtime', included: true },
            { text: 'GitHub login', included: true },
            { text: 'Priority support', included: true },
            { text: 'Custom domain', included: true },
            { text: 'Up to 5 team members', included: true },
        ],
    },
]

const comparison = [
    { feature: 'Projects', values: ['2', '25', 'Unlimited'] },
    { feature: 'States', values: ['8', '8', '8'] },
    { feature: 'Realtime sync', values: ['✓', '✓', '✓'] },
    { feature: 'Client SDK', values: ['✓', '✓', '✓'] },
    { feature: 'Analytics', values: ['—', '✓', '✓'] },
    { feature: 'Custom domain', values: ['—', '✓', '✓'] },
    { feature: 'Team members', values: ['—', '—', '5'] },
    { feature: 'Priority support', values: ['—', '✓', '✓'] },
    { feature: 'SLA', values: ['—', '—', '99.9%'] },
]

const faqs = reactive([
    {
        q: 'Can I switch plans anytime?',
        a: 'Yes. Upgrades apply immediately. Downgrades take effect at the end of your billing period — you keep your current plan until then.',
        open: false,
    },
    {
        q: 'What counts as a "project"?',
        a: 'Each deployed client application you connect to the SDK is one project. You can soft-delete projects to free up slots.',
        open: false,
    },
    {
        q: 'Is client data safe?',
        a: 'DeadFuse never touches your client\'s data. It only sends control signals. Your client\'s database is never accessed or modified.',
        open: false,
    },
    {
        q: 'Do you offer refunds?',
        a: 'Yes — if you\'re unsatisfied within 14 days of your first payment, email us and we\'ll refund you in full.',
        open: false,
    },
])

function handleUpgrade(plan: any) {
    if (plan.id === 'free') {
        navigateTo('/projects')
        return
    }
    alert(`Stripe checkout for ${plan.name} (${billing.value}) coming soon.`)
}
</script>

<style scoped>
.plan-card {
    @apply rounded-xl border border-white/[0.07] p-5 flex flex-col pt-7;
    background: rgba(255, 255, 255, 0.025);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    transition: border-color 0.15s;
}

.plan-card:hover {
    border-color: rgba(255, 255, 255, 0.1);
}

.plan-card--featured {
    border-color: rgba(255, 51, 51, 0.2);
    background: rgba(255, 51, 51, 0.03);
}

.plan-card--featured:hover {
    border-color: rgba(255, 51, 51, 0.3);
}

.glass-table {
    @apply rounded-xl border border-white/[0.07] overflow-hidden;
    background: rgba(255, 255, 255, 0.02);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
}

.comparison-header {
    @apply grid grid-cols-4 gap-4 px-4 py-2.5 border-b border-white/[0.06] text-[10px] font-mono uppercase tracking-widest;
    background: rgba(255, 255, 255, 0.03);
}

.comparison-row {
    @apply grid grid-cols-4 gap-4 px-4 py-2.5 border-b border-white/[0.04] last:border-0 items-center;
}

.faq-item {
    @apply rounded-xl border border-white/[0.06] px-4 py-3 cursor-pointer transition-all duration-150;
    background: rgba(255, 255, 255, 0.02);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
}

.faq-item:hover {
    border-color: rgba(255, 255, 255, 0.1);
}

.faq-item--open {
    border-color: rgba(255, 255, 255, 0.09);
    background: rgba(255, 255, 255, 0.035);
}
</style>