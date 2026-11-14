<template>
  <div class="relative h-72 w-full">
    <Bar :data="chartData" :options="chartOptions" />
  </div>
</template>

<script setup lang="ts">
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
} from 'chart.js'
import { Bar } from 'vue-chartjs'

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

const props = defineProps<{
  labels: string[]
  values: number[]
}>()

const chartData = computed(() => ({
  labels: props.labels,
  datasets: [
    {
      label: 'Jumlah Arsip',
      data: props.values,
      backgroundColor: 'rgba(59, 130, 246, 0.35)',
      borderColor: '#3B82F6',
      borderWidth: 2,
      borderRadius: 12,
      borderSkipped: false,
      hoverBackgroundColor: 'rgba(37, 99, 235, 0.55)',
      hoverBorderColor: '#1D4ED8',
      maxBarThickness: 42
    }
  ]
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  layout: {
    padding: { top: 16, right: 16, bottom: 16, left: 12 }
  },
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: '#0F172A',
      titleColor: '#F8FAFC',
      bodyColor: '#E2E8F0',
      padding: 12,
      cornerRadius: 8,
      displayColors: false
    }
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { color: '#475569', font: { size: 12, weight: 500 }, maxRotation: 0 }
    },
    y: {
      beginAtZero: true,
      grid: { color: 'rgba(148, 163, 184, 0.25)' },
      ticks: { color: '#475569', padding: 8, precision: 0, font: { size: 12 } }
    }
  }
}
</script>

