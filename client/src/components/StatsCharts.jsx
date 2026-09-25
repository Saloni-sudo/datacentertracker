import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { concernLabel, sourceTypeLabel } from '../config'

const SOURCE_COLORS = { documented_facility: '#1b6b52', resident_submission: '#3d7bb8' }

function StatsCharts({ stats }) {
  const concernData = stats.by_concern_type.map((row) => ({
    name: concernLabel(row.concern_type),
    count: row.count,
  }))

  const sourceData = stats.by_source.map((row) => ({
    name: sourceTypeLabel(row.source),
    value: row.count,
    color: SOURCE_COLORS[row.source] ?? '#7a5c00',
  }))

  const regionData = stats.by_region.map((row) => ({ name: row.region, count: row.count }))

  return (
    <div className="charts">
      <section className="chart-card">
        <h2 className="chart-card__title">Reports by concern</h2>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={concernData} margin={{ top: 8, right: 8, bottom: 8, left: -16 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 11 }}
              interval={0}
              angle={-20}
              textAnchor="end"
              height={56}
            />
            <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
            <Tooltip />
            <Bar dataKey="count" fill="#1b6b52" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </section>

      <section className="chart-card">
        <h2 className="chart-card__title">Reports by source</h2>
        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie data={sourceData} dataKey="value" nameKey="name" outerRadius="70%" label>
              {sourceData.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </section>

      <section className="chart-card chart-card--wide">
        <h2 className="chart-card__title">Top regions</h2>
        <ResponsiveContainer width="100%" height={Math.max(220, regionData.length * 34)}>
          <BarChart
            data={regionData}
            layout="vertical"
            margin={{ top: 8, right: 16, bottom: 8, left: 8 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} />
            <YAxis type="category" dataKey="name" width={150} tick={{ fontSize: 12 }} />
            <Tooltip />
            <Bar dataKey="count" fill="#3d7bb8" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </section>
    </div>
  )
}

export default StatsCharts
