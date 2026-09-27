import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { concernLabel, sourceTypeLabel } from '../config'

// Chart colours come from the same tokens as the rest of the site, read once at
// render time so the palette stays in one place.
function token(name, fallback) {
  if (typeof window === 'undefined') {
    return fallback
  }

  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback
}

function StatsCharts({ stats }) {
  const accent = token('--accent', '#b5402f')
  const slate = token('--slate', '#4a5561')
  const ink = token('--ink', '#1c1b19')
  const inkMuted = token('--ink-muted', '#5c574f')
  const sunk = token('--paper-sunk', '#efece4')

  const axisNumber = {
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: 12,
    fontVariantNumeric: 'tabular-nums',
    fill: inkMuted,
  }

  const axisLabel = { fontFamily: "'Public Sans', sans-serif", fontSize: 12, fill: ink }

  const tooltipStyle = {
    fontFamily: "'Public Sans', sans-serif",
    fontSize: 13,
    background: token('--paper', '#f7f5f0'),
    border: `1px solid ${token('--rule-strong', '#b9b2a3')}`,
    borderRadius: 0,
  }

  const concernData = stats.by_concern_type.map((row) => ({
    name: concernLabel(row.concern_type),
    count: row.count,
  }))

  const sourceData = stats.by_source.map((row) => ({
    name: sourceTypeLabel(row.source),
    count: row.count,
    color: row.source === 'documented_facility' ? slate : accent,
  }))

  const regionData = stats.by_region.map((row) => ({ name: row.region, count: row.count }))

  return (
    <div className="charts">
      <section className="chart">
        <h2 className="chart__title">Reports by concern</h2>
        <ResponsiveContainer width="100%" height={40 + concernData.length * 34}>
          <BarChart data={concernData} layout="vertical" margin={{ left: 0, right: 24 }}>
            <XAxis type="number" allowDecimals={false} tick={axisNumber} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey="name" width={110} tick={axisLabel} axisLine={false} tickLine={false} />
            <Tooltip cursor={{ fill: sunk }} contentStyle={tooltipStyle} />
            <Bar dataKey="count" fill={accent} barSize={14} />
          </BarChart>
        </ResponsiveContainer>
      </section>

      <section className="chart">
        <h2 className="chart__title">Reports by source</h2>
        <ResponsiveContainer width="100%" height={40 + sourceData.length * 40}>
          <BarChart data={sourceData} layout="vertical" margin={{ left: 0, right: 24 }}>
            <XAxis type="number" allowDecimals={false} tick={axisNumber} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey="name" width={150} tick={axisLabel} axisLine={false} tickLine={false} />
            <Tooltip cursor={{ fill: sunk }} contentStyle={tooltipStyle} />
            <Bar dataKey="count" barSize={14}>
              {sourceData.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </section>

      <section className="chart chart--wide">
        <h2 className="chart__title">Top regions</h2>
        <ResponsiveContainer width="100%" height={40 + regionData.length * 34}>
          <BarChart data={regionData} layout="vertical" margin={{ left: 0, right: 24 }}>
            <XAxis type="number" allowDecimals={false} tick={axisNumber} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey="name" width={150} tick={axisLabel} axisLine={false} tickLine={false} />
            <Tooltip cursor={{ fill: sunk }} contentStyle={tooltipStyle} />
            <Bar dataKey="count" fill={slate} barSize={14} />
          </BarChart>
        </ResponsiveContainer>
      </section>
    </div>
  )
}

export default StatsCharts
