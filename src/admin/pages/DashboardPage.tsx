import { useEffect, useState } from "react"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js"
import { Line } from "react-chartjs-2"
import { Building2, ShoppingCart, Home, PauseCircle } from "lucide-react"
import { api } from "../api/client"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../components/ui/Table"
import { Spinner } from "../components/ui/Spinner"

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

/** Dashboard statistics from the API. */
interface StatsResponse {
  properties: {
    total: number
    active: number
    paused: number
    emprendimientos: number
    propiedades: number
  }
  analytics: {
    total_visits: number
    total_clicks: number
  }
}

/** Property visit/click entry from the API. */
interface TopPropertyEntry {
  uuid: string
  title: string
  slug: string
  location: string
  is_emprendimiento: number
  visit_count?: number
  click_count?: number
}

/** Daily visit data point. */
interface DailyDataPoint {
  date: string
  count: number
}

/**
 * Admin dashboard page displaying statistics, visit charts,
 * and top visited/clicked property lists.
 */
export default function DashboardPage() {
  const [stats, setStats] = useState<StatsResponse | null>(null)
  const [dailyVisits, setDailyVisits] = useState<DailyDataPoint[]>([])
  const [topVisited, setTopVisited] = useState<TopPropertyEntry[]>([])
  const [topClicked, setTopClicked] = useState<TopPropertyEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const [s, dv, tv, tc] = await Promise.all([
          api.get<StatsResponse>("/dashboard/stats"),
          api.get<{ visits: DailyDataPoint[]; clicks: DailyDataPoint[] }>("/dashboard/daily-visits"),
          api.get<{ properties: TopPropertyEntry[] }>("/dashboard/top-visited"),
          api.get<{ properties: TopPropertyEntry[] }>("/dashboard/top-clicked"),
        ])
        setStats(s)
        setDailyVisits(dv.visits || [])
        setTopVisited(tv.properties || [])
        setTopClicked(tc.properties || [])
      } catch (err) {
        console.error("Error fetching dashboard data:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  const statCards = [
    { label: "Total propiedades", value: stats?.properties.total ?? 0, icon: Building2, color: "text-[#3D6B7E]", bg: "bg-[#3D6B7E]/10" },
    { label: "Emprendimientos", value: stats?.properties.emprendimientos ?? 0, icon: ShoppingCart, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Propiedades", value: stats?.properties.propiedades ?? 0, icon: Home, color: "text-green-600", bg: "bg-green-50" },
    { label: "Pausadas", value: stats?.properties.paused ?? 0, icon: PauseCircle, color: "text-yellow-600", bg: "bg-yellow-50" },
  ]

  const chartData = {
    labels: dailyVisits.map((d) => {
      const date = new Date(d.date)
      return `${date.getDate()}/${date.getMonth() + 1}`
    }),
    datasets: [
      {
        label: "Visitas",
        data: dailyVisits.map((d) => d.count),
        borderColor: "#3D6B7E",
        backgroundColor: "rgba(61, 107, 126, 0.1)",
        fill: true,
        tension: 0.3,
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: false },
    },
    scales: {
      y: { beginAtZero: true, ticks: { precision: 0 } },
    },
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <Card key={card.label}>
            <CardContent className="flex items-center gap-4 p-6">
              <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${card.bg}`}>
                <card.icon className={`h-6 w-6 ${card.color}`} />
              </div>
              <div>
                <p className="text-sm text-gray-500">{card.label}</p>
                <p className="text-2xl font-bold text-gray-900">{card.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Daily visits chart */}
      <Card>
        <CardHeader>
          <CardTitle>Visitas diarias - Últimos 30 días</CardTitle>
        </CardHeader>
        <CardContent>
          {dailyVisits.length > 0 ? (
            <Line data={chartData} options={chartOptions} />
          ) : (
            <p className="py-8 text-center text-sm text-gray-500">Sin datos de visitas todavía</p>
          )}
        </CardContent>
      </Card>

      {/* Top tables */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Top visited */}
        <Card>
          <CardHeader>
            <CardTitle>Top 10 - Más visitadas</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Propiedad</TableHead>
                  <TableHead className="text-right">Visitas</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topVisited.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-gray-500">
                      Sin datos todavía
                    </TableCell>
                  </TableRow>
                ) : (
                  topVisited.map((item, i) => (
                    <TableRow key={item.uuid}>
                      <TableCell className="font-medium text-gray-500">{i + 1}</TableCell>
                      <TableCell className="font-medium">{item.title}</TableCell>
                      <TableCell className="text-right">{item.visit_count}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Top clicked */}
        <Card>
          <CardHeader>
            <CardTitle>Top 10 - Más clickeadas</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Propiedad</TableHead>
                  <TableHead className="text-right">Clicks</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topClicked.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-gray-500">
                      Sin datos todavía
                    </TableCell>
                  </TableRow>
                ) : (
                  topClicked.map((item, i) => (
                    <TableRow key={item.uuid}>
                      <TableCell className="font-medium text-gray-500">{i + 1}</TableCell>
                      <TableCell className="font-medium">{item.title}</TableCell>
                      <TableCell className="text-right">{item.click_count}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
