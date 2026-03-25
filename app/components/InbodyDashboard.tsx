'use client'

import { useState } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import type { InbodyRecord } from '@/lib/supabase'

type Props = {
  records: InbodyRecord[]
}

type MetricKey = 'weight' | 'muscle' | 'fat' | 'fat_rate' | 'visceral_fat'

const METRICS: { key: MetricKey; label: string; unit: string; color: string }[] = [
  { key: 'weight', label: '체중', unit: 'kg', color: '#60a5fa' },
  { key: 'muscle', label: '골격근량', unit: 'kg', color: '#34d399' },
  { key: 'fat', label: '체지방량', unit: 'kg', color: '#f87171' },
  { key: 'fat_rate', label: '체지방률', unit: '%', color: '#fb923c' },
  { key: 'visceral_fat', label: '내장지방', unit: 'cm²', color: '#c084fc' },
]

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return `${d.getMonth() + 1}/${d.getDate()}`
}

function diffArrow(current: number | null, prev: number | null, lowerIsBetter = false) {
  if (current == null || prev == null) return null
  const diff = current - prev
  if (Math.abs(diff) < 0.05) return <span className="text-zinc-500 text-sm">—</span>
  const positive = diff > 0
  const good = lowerIsBetter ? !positive : positive
  const sign = positive ? '+' : ''
  return (
    <span className={`text-sm font-medium ${good ? 'text-emerald-400' : 'text-red-400'}`}>
      {positive ? '▲' : '▼'} {sign}{diff.toFixed(1)}
    </span>
  )
}

export default function InbodyDashboard({ records }: Props) {
  const [activeMetrics, setActiveMetrics] = useState<Set<MetricKey>>(
    new Set(['weight', 'muscle', 'fat_rate'])
  )

  const sorted = [...records].sort((a, b) => a.date.localeCompare(b.date))
  const latest = sorted[sorted.length - 1] ?? null
  const prev = sorted[sorted.length - 2] ?? null

  const chartData = sorted.map((r) => ({
    date: formatDate(r.date),
    weight: r.weight,
    muscle: r.muscle,
    fat: r.fat,
    fat_rate: r.fat_rate,
    visceral_fat: r.visceral_fat,
  }))

  const yDomain = (() => {
    const activeKeys = [...activeMetrics]
    const vals = chartData.flatMap((d) =>
      activeKeys.map((k) => d[k as MetricKey]).filter((v): v is number => v != null)
    )
    if (vals.length === 0) return ['auto', 'auto'] as const
    const min = Math.min(...vals)
    const max = Math.max(...vals)
    const pad = Math.max((max - min) * 0.3, 0.5)
    return [
      parseFloat((min - pad).toFixed(1)),
      parseFloat((max + pad).toFixed(1)),
    ] as const
  })()

  function toggleMetric(key: MetricKey) {
    setActiveMetrics((prev) => {
      const next = new Set(prev)
      if (next.has(key)) {
        if (next.size === 1) return next
        next.delete(key)
      } else {
        next.add(key)
      }
      return next
    })
  }

  return (
    <div className="min-h-screen bg-zinc-900 text-zinc-100">
      <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">💪 오성 몸짱 프로젝트</h1>

      {/* 요약 카드 */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {/* 체중 */}
        <div className="bg-zinc-800 rounded-xl p-5">
          <p className="text-zinc-400 text-sm mb-1">체중</p>
          <p className="text-3xl font-bold text-blue-400">
            {latest?.weight ?? '—'}<span className="text-base text-zinc-400 ml-1">kg</span>
          </p>
          <div className="mt-1">{diffArrow(latest?.weight ?? null, prev?.weight ?? null, false)}</div>
        </div>
        {/* 골격근량 */}
        <div className="bg-zinc-800 rounded-xl p-5">
          <p className="text-zinc-400 text-sm mb-1">골격근량</p>
          <p className="text-3xl font-bold text-emerald-400">
            {latest?.muscle ?? '—'}<span className="text-base text-zinc-400 ml-1">kg</span>
          </p>
          <div className="mt-1">{diffArrow(latest?.muscle ?? null, prev?.muscle ?? null, false)}</div>
        </div>
        {/* 체지방률 */}
        <div className="bg-zinc-800 rounded-xl p-5">
          <p className="text-zinc-400 text-sm mb-1">체지방률</p>
          <p className="text-3xl font-bold text-orange-400">
            {latest?.fat_rate ?? '—'}<span className="text-base text-zinc-400 ml-1">%</span>
          </p>
          <div className="mt-1">{diffArrow(latest?.fat_rate ?? null, prev?.fat_rate ?? null, true)}</div>
        </div>
      </div>

      {/* 차트 */}
      <div className="bg-zinc-800 rounded-xl p-5 mb-8">
        <div className="flex flex-wrap gap-2 mb-4">
          {METRICS.map((m) => (
            <button
              key={m.key}
              onClick={() => toggleMetric(m.key)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                activeMetrics.has(m.key)
                  ? 'text-zinc-900'
                  : 'bg-zinc-700 text-zinc-400 hover:bg-zinc-600'
              }`}
              style={activeMetrics.has(m.key) ? { backgroundColor: m.color } : {}}
            >
              {m.label}
            </button>
          ))}
        </div>

        {sorted.length === 0 ? (
          <p className="text-zinc-500 text-center py-12">아직 기록이 없어요</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
              <XAxis dataKey="date" stroke="#71717a" tick={{ fontSize: 12 }} />
              <YAxis stroke="#71717a" tick={{ fontSize: 12 }} domain={yDomain} />
              <Tooltip
                contentStyle={{ backgroundColor: '#27272a', border: 'none', borderRadius: '8px' }}
                labelStyle={{ color: '#a1a1aa' }}
                itemStyle={{ color: '#e4e4e7' }}
              />
              <Legend wrapperStyle={{ paddingTop: '12px', fontSize: '13px' }} />
              {METRICS.filter((m) => activeMetrics.has(m.key)).map((m) => (
                <Line
                  key={m.key}
                  type="monotone"
                  dataKey={m.key}
                  name={`${m.label} (${m.unit})`}
                  stroke={m.color}
                  strokeWidth={2}
                  dot={{ r: 4, fill: m.color }}
                  activeDot={{ r: 6 }}
                  connectNulls
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* 전체 기록 테이블 */}
      <div className="bg-zinc-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-700 text-zinc-400">
              <th className="text-left px-4 py-3">날짜</th>
              <th className="text-right px-4 py-3">체중</th>
              <th className="text-right px-4 py-3">골격근량</th>
              <th className="text-right px-4 py-3">체지방량</th>
              <th className="text-right px-4 py-3">체지방률</th>
              <th className="text-right px-4 py-3">내장지방</th>
              <th className="text-right px-4 py-3">기초대사량</th>
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-8 text-zinc-500">
                  아직 기록이 없어요
                </td>
              </tr>
            )}
            {[...sorted].reverse().map((r, i) => (
              <tr key={r.id} className={i % 2 === 0 ? 'bg-zinc-800' : 'bg-zinc-750'}>
                <td className="px-4 py-3 font-medium">{r.date}</td>
                <td className="px-4 py-3 text-right text-blue-400">{r.weight ?? '—'} kg</td>
                <td className="px-4 py-3 text-right text-emerald-400">{r.muscle ?? '—'} kg</td>
                <td className="px-4 py-3 text-right text-red-400">{r.fat ?? '—'} kg</td>
                <td className="px-4 py-3 text-right text-orange-400">{r.fat_rate ?? '—'} %</td>
                <td className="px-4 py-3 text-right text-purple-400">{r.visceral_fat ?? '—'} cm²</td>
                <td className="px-4 py-3 text-right text-zinc-300">{r.bmr ? r.bmr.toLocaleString() : '—'} kcal</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      </div>
    </div>
  )
}
