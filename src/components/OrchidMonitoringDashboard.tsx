"use client"

import * as React from "react"
import {
  LayoutDashboard,
  MonitorCheck,
  ChartSpline,
  Gauge,
  SquareActivity,
  PanelRight,
  Webhook,
} from "lucide-react"
import { toast } from "sonner"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

type MetricKey = "temperature" | "humidity" | "moisture" | "light"

type Metric = {
  key: MetricKey
  title: string
  unit: string
  value: number | null
  target?: string
  status: "ok" | "warn" | "crit" | "idle"
  trend: number[] // 0..100 scaled sparkline
}

type OrchidCard = {
  id: string
  name: string
  species: string
  stage: "seedling" | "vegetative" | "spike" | "bloom" | "rest"
  health: "excellent" | "good" | "fair" | "poor"
  imageUrl: string // Unsplash only
  recommendations: string[]
}

type AnalyticsAlert = {
  id: string
  type: "disease" | "pest" | "growth"
  title: string
  confidence: number // 0..100
  recommendation: string
  severity: "low" | "medium" | "high" | "critical"
}

type ControlSubsystem = {
  name: "watering" | "climate" | "lighting"
  auto: boolean
  status: "idle" | "active" | "paused" | "error"
  lastRun?: string
}

type NotificationItem = {
  id: string
  title: string
  description: string
  time: string
  level: "info" | "warning" | "critical"
  read?: boolean
}

export interface OrchidMonitoringDashboardProps {
  className?: string
  style?: React.CSSProperties
  loading?: boolean
  error?: string | null
  metrics?: Metric[]
  orchids?: OrchidCard[]
  analyticsAlerts?: AnalyticsAlert[]
  controls?: ControlSubsystem[]
  notifications?: NotificationItem[]
  onAddOrchid?: () => void
  onConfigureSensors?: () => void
  onExportData?: () => void
}

function StatusDot({ tone }: { tone: "ok" | "warn" | "crit" | "idle" }) {
  const toneClass =
    tone === "ok"
      ? "bg-emerald-500"
      : tone === "warn"
      ? "bg-amber-500"
      : tone === "crit"
      ? "bg-destructive"
      : "bg-muted-foreground"
  const ringClass =
    tone === "ok"
      ? "ring-emerald-200"
      : tone === "warn"
      ? "ring-amber-200"
      : tone === "crit"
      ? "ring-destructive/30"
      : "ring-muted"
  return (
    <span
      aria-hidden="true"
      className={"inline-block size-2.5 rounded-full ring-4 " + ringClass + " " + toneClass}
    />
  )
}

function Sparkline({
  data,
  colorClass = "stroke-[var(--chart-3)]",
  label,
}: {
  data: number[]
  colorClass?: string
  label?: string
}) {
  const points = React.useMemo(() => {
    if (!data || data.length === 0) return ""
    const maxX = data.length - 1
    return data
      .map((y, i) => {
        const px = (i / Math.max(1, maxX)) * 100
        const py = 100 - Math.min(100, Math.max(0, y))
        return `${px},${py}`
      })
      .join(" ")
  }, [data])
  return (
    <svg
      role="img"
      aria-label={label || "trend"}
      viewBox="0 0 100 100"
      className="w-full h-14"
      preserveAspectRatio="none"
    >
      <polyline
        points={points}
        className={colorClass + " fill-none"}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function HealthBadge({ health }: { health: OrchidCard["health"] }) {
  const map = {
    excellent: { label: "Excellent", class: "bg-emerald-100 text-emerald-700" },
    good: { label: "Good", class: "bg-teal-100 text-teal-700" },
    fair: { label: "Fair", class: "bg-amber-100 text-amber-700" },
    poor: { label: "Poor", class: "bg-destructive/10 text-destructive" },
  }
  const cfg = map[health]
  return <span className={"px-2 py-0.5 rounded-md text-xs font-semibold " + cfg.class}>{cfg.label}</span>
}

const defaultMetrics: Metric[] = [
  {
    key: "temperature",
    title: "Temperature",
    unit: "°C",
    value: 23.6,
    target: "22-26",
    status: "ok",
    trend: [45, 48, 46, 50, 53, 52, 49, 47, 48, 50, 51, 52],
  },
  {
    key: "humidity",
    title: "Humidity",
    unit: "%RH",
    value: 62,
    target: "55-70",
    status: "ok",
    trend: [60, 58, 59, 61, 63, 65, 64, 62, 61, 60, 62, 63],
  },
  {
    key: "moisture",
    title: "Soil Moisture",
    unit: "%VWC",
    value: 34,
    target: "30-40",
    status: "warn",
    trend: [42, 40, 39, 37, 36, 35, 34, 33, 32, 34, 35, 34],
  },
  {
    key: "light",
    title: "Light",
    unit: "µmol/m²·s",
    value: 210,
    target: "150-250",
    status: "ok",
    trend: [120, 140, 160, 180, 200, 220, 230, 240, 220, 210, 205, 210],
  },
]

const defaultOrchids: OrchidCard[] = [
  {
    id: "o1",
    name: "Aurora",
    species: "Phalaenopsis sp.",
    stage: "bloom",
    health: "excellent",
    imageUrl:
      "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?q=80&w=1200&auto=format&fit=crop",
    recommendations: [
      "Maintain humidity near 60%.",
      "Bright, indirect light; avoid midday sun.",
      "Fertilize at 1/4 strength weekly.",
    ],
  },
  {
    id: "o2",
    name: "Saffron",
    species: "Cattleya maxima",
    stage: "vegetative",
    health: "good",
    imageUrl:
      "https://images.unsplash.com/photo-1520975682031-ae5b43b5f03b?q=80&w=1200&auto=format&fit=crop",
    recommendations: ["Increase airflow around pseudobulbs.", "Allow medium to dry slightly between waterings."],
  },
  {
    id: "o3",
    name: "Zephyr",
    species: "Dendrobium nobile",
    stage: "spike",
    health: "fair",
    imageUrl:
      "https://images.unsplash.com/photo-1582582621959-4eb51a2be2b2?q=80&w=1200&auto=format&fit=crop",
    recommendations: ["Boost light to encourage spikes.", "Monitor for mites on undersides of leaves."],
  },
]

const defaultAnalytics: AnalyticsAlert[] = [
  {
    id: "a1",
    type: "disease",
    title: "Black rot risk uptrend",
    confidence: 78,
    recommendation: "Improve drainage; reduce leaf wetness; apply systemic fungicide if lesions appear.",
    severity: "medium",
  },
  {
    id: "a2",
    type: "pest",
    title: "Mealybug infestation likely",
    confidence: 64,
    recommendation: "Inspect nodes; isolate affected plants; apply alcohol swab or horticultural oil.",
    severity: "low",
  },
  {
    id: "a3",
    type: "growth",
    title: "Insufficient light for flowering (Phalaenopsis)",
    confidence: 86,
    recommendation: "Increase PPFD by 10–15% during photoperiod; extend light cycle by 30 minutes.",
    severity: "high",
  },
]

const defaultControls: ControlSubsystem[] = [
  { name: "watering", auto: true, status: "idle", lastRun: "Today 07:10" },
  { name: "climate", auto: true, status: "active", lastRun: "—" },
  { name: "lighting", auto: false, status: "paused", lastRun: "Yesterday 19:30" },
]

const defaultNotifications: NotificationItem[] = [
  {
    id: "n1",
    title: "Fertilizer schedule due",
    description: "Apply 1/4 strength balanced fertilizer to mature orchids.",
    time: "in 2h",
    level: "info",
  },
  {
    id: "n2",
    title: "Low substrate moisture",
    description: "Moisture at 28% in Zone B benches; consider watering.",
    time: "just now",
    level: "warning",
  },
  {
    id: "n3",
    title: "Sensor maintenance",
    description: "Replace humidity probe (H-12) nearing end-of-life.",
    time: "tomorrow",
    level: "info",
  },
]

function MetricCard({ metric }: { metric: Metric }) {
  const badge =
    metric.status === "ok"
      ? { label: "Stable", class: "bg-emerald-50 text-emerald-700" }
      : metric.status === "warn"
      ? { label: "Watch", class: "bg-amber-50 text-amber-700" }
      : metric.status === "crit"
      ? { label: "Critical", class: "bg-destructive/10 text-destructive" }
      : { label: "Idle", class: "bg-muted text-muted-foreground" }

  return (
    <Card className="bg-card border border-border rounded-xl shadow-sm">
      <CardHeader className="space-y-1 pb-2">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="text-base sm:text-lg font-semibold">{metric.title}</CardTitle>
          <span className={"px-2 py-0.5 rounded-md text-xs font-semibold " + badge.class}>{badge.label}</span>
        </div>
        <CardDescription className="text-muted-foreground">
          Target {metric.target ? metric.target : "—"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-baseline gap-2">
          <Gauge className="size-4 text-muted-foreground" aria-hidden="true" />
          <div className="text-2xl font-bold">
            {metric.value === null ? "—" : metric.value}
            <span className="text-sm text-muted-foreground ml-1">{metric.unit}</span>
          </div>
        </div>
        <div className="rounded-lg bg-secondary p-2">
          <Sparkline
            data={metric.trend}
            colorClass={
              metric.status === "ok"
                ? "stroke-[var(--chart-2)]"
                : metric.status === "warn"
                ? "stroke-[var(--chart-4)]"
                : metric.status === "crit"
                ? "stroke-destructive"
                : "stroke-[var(--chart-3)]"
            }
            label={metric.title + " trend"}
          />
        </div>
      </CardContent>
    </Card>
  )
}

function OrchidCardItem({ orchid }: { orchid: OrchidCard }) {
  return (
    <Card className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="relative w-full aspect-[16/9] overflow-hidden">
        <img
          src={orchid.imageUrl}
          alt={orchid.name + " — " + orchid.species}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-background/10 to-transparent" />
        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate">{orchid.name}</p>
            <p className="text-xs text-muted-foreground truncate">{orchid.species}</p>
          </div>
          <HealthBadge health={orchid.health} />
        </div>
      </div>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">Stage</div>
          <Badge variant="secondary" className="bg-accent text-accent-foreground">
            {orchid.stage}
          </Badge>
        </div>
        <Separator />
        <div className="space-y-1">
          <p className="text-sm font-semibold">Care recommendations</p>
          <ul className="list-disc pl-4 space-y-1">
            {orchid.recommendations.slice(0, 3).map((rec, idx) => (
              <li key={orchid.id + "-rec-" + idx} className="text-sm text-muted-foreground break-words">
                {rec}
              </li>
            ))}
          </ul>
        </div>
        <div className="flex items-center justify-end">
          <Button variant="outline" size="sm" className="border-border">
            View details
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function AnalyticsAlertItem({ alert }: { alert: AnalyticsAlert }) {
  const level =
    alert.severity === "critical"
      ? { bar: "bg-destructive", chip: "bg-destructive/10 text-destructive" }
      : alert.severity === "high"
      ? { bar: "bg-amber-500", chip: "bg-amber-50 text-amber-700" }
      : alert.severity === "medium"
      ? { bar: "bg-[var(--chart-4)]", chip: "bg-[var(--chart-4)]/10 text-amber-700" }
      : { bar: "bg-[var(--chart-2)]", chip: "bg-[var(--chart-2)]/10 text-teal-700" }

  return (
    <div className="rounded-lg border border-border bg-secondary p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <div className="flex items-center gap-2">
            <SquareActivity className="size-4 text-muted-foreground" aria-hidden="true" />
            <p className="text-sm font-semibold truncate">{alert.title}</p>
            <span className={"px-2 py-0.5 rounded-md text-[10px] font-semibold " + level.chip}>
              {alert.severity}
            </span>
          </div>
          <p className="text-sm text-muted-foreground break-words">{alert.recommendation}</p>
        </div>
        <div className="w-24">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
            <span>Confidence</span>
            <span>{alert.confidence}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-muted">
            <div
              className={"h-2 rounded-full " + level.bar}
              style={{ width: Math.max(0, Math.min(100, alert.confidence)) + "%" }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function SubsystemStatus({ subsystem, onToggleAuto }: { subsystem: ControlSubsystem; onToggleAuto: () => void }) {
  const label =
    subsystem.name === "watering" ? "Watering" : subsystem.name === "climate" ? "Climate" : "Lighting"
  const statusTone =
    subsystem.status === "active"
      ? "ok"
      : subsystem.status === "paused"
      ? "warn"
      : subsystem.status === "error"
      ? "crit"
      : "idle"
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-secondary p-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <StatusDot tone={statusTone as any} />
          <p className="text-sm font-semibold">{label}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Auto</span>
          <Switch
            checked={subsystem.auto}
            onCheckedChange={onToggleAuto}
            aria-label={label + " auto mode"}
          />
        </div>
      </div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Status</span>
        <span className="font-medium capitalize">{subsystem.status}</span>
      </div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Last run</span>
        <span className="font-medium">{subsystem.lastRun || "—"}</span>
      </div>
      <div className="flex items-center justify-end gap-2">
        <Button
          variant="outline"
          size="sm"
          className="border-border"
          onClick={() => toast.message(label + " override", { description: "Manual cycle started." })}
        >
          Manual override
        </Button>
      </div>
    </div>
  )
}

export default function OrchidMonitoringDashboard(props: OrchidMonitoringDashboardProps) {
  const [activeTab, setActiveTab] = React.useState("overview")
  const [metrics, setMetrics] = React.useState<Metric[]>(props.metrics || defaultMetrics)
  const [orchids, setOrchids] = React.useState<OrchidCard[]>(props.orchids || defaultOrchids)
  const [alerts, setAlerts] = React.useState<AnalyticsAlert[]>(props.analyticsAlerts || defaultAnalytics)
  const [controls, setControls] = React.useState<ControlSubsystem[]>(props.controls || defaultControls)
  const [notifications, setNotifications] = React.useState<NotificationItem[]>(
    props.notifications || defaultNotifications
  )

  const loading = !!props.loading
  const error = props.error

  React.useEffect(() => {
    if (!props.metrics) return
    setMetrics(props.metrics)
  }, [props.metrics])

  React.useEffect(() => {
    if (!props.orchids) return
    setOrchids(props.orchids)
  }, [props.orchids])

  React.useEffect(() => {
    if (!props.analyticsAlerts) return
    setAlerts(props.analyticsAlerts)
  }, [props.analyticsAlerts])

  React.useEffect(() => {
    if (!props.controls) return
    setControls(props.controls)
  }, [props.controls])

  React.useEffect(() => {
    if (!props.notifications) return
    setNotifications(props.notifications)
  }, [props.notifications])

  function handleAddOrchid() {
    if (props.onAddOrchid) props.onAddOrchid()
    else toast.success("Add Orchid", { description: "Launch the add-orchid flow." })
  }

  function handleConfigureSensors() {
    if (props.onConfigureSensors) props.onConfigureSensors()
    else toast.message("Sensor configuration", { description: "Open sensor setup panel." })
  }

  function handleExport() {
    if (props.onExportData) props.onExportData()
    else toast.success("Export started", { description: "Preparing data export..." })
  }

  return (
    <div className={props.className} style={props.style}>
      <section className="w-full max-w-full">
        <header className="mb-4 sm:mb-6">
          <Card className="bg-card border border-border rounded-2xl">
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="size-9 rounded-xl bg-accent flex items-center justify-center">
                      <LayoutDashboard className="size-5 text-accent-foreground" aria-hidden="true" />
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-lg sm:text-xl md:text-2xl font-bold truncate">
                        Orchid Monitoring Dashboard
                      </h2>
                      <p className="text-sm text-muted-foreground truncate">
                        Real-time digital twin for greenhouse orchids
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="hidden sm:flex items-center gap-2 rounded-full bg-secondary px-3 py-1.5">
                            <MonitorCheck className="size-4 text-emerald-600" aria-hidden="true" />
                            <span className="text-xs font-medium text-emerald-700">All systems nominal</span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>No critical issues detected across sensors</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="border-border">
                          Actions
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="min-w-56">
                        <DropdownMenuItem onClick={handleAddOrchid}>Add new orchid</DropdownMenuItem>
                        <DropdownMenuItem onClick={handleConfigureSensors}>
                          Configure sensors
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleExport}>Export data</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <Button onClick={handleAddOrchid}>Add orchid</Button>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2">
                    <StatusDot tone="ok" />
                    <span className="text-xs text-muted-foreground">Network</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusDot tone="ok" />
                    <span className="text-xs text-muted-foreground">Sensors</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusDot tone="warn" />
                    <span className="text-xs text-muted-foreground">Moisture low in Zone B</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </header>

        {error ? (
          <Card className="bg-card border border-destructive rounded-xl">
            <CardContent className="p-6">
              <p role="alert" className="text-destructive font-semibold">
                {error}
              </p>
              <p className="text-muted-foreground text-sm mt-1">Try reloading or check your connection.</p>
              <div className="mt-4">
                <Button variant="outline" onClick={() => toast.message("Retrying…")}>
                  Retry
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : null}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-2">
          <TabsList className="w-full justify-start overflow-x-auto">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Predictive analytics</TabsTrigger>
            <TabsTrigger value="controls">Controls</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              {metrics.map((m) => (
                <MetricCard key={m.key} metric={m} />
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <Card className="bg-card border border-border rounded-xl lg:col-span-2">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ChartSpline className="size-4 text-muted-foreground" aria-hidden="true" />
                      <CardTitle className="text-base sm:text-lg">Live environmental trends</CardTitle>
                    </div>
                    <Badge variant="secondary" className="bg-secondary text-foreground">
                      Real-time
                    </Badge>
                  </div>
                  <CardDescription className="text-muted-foreground">
                    Temperature, humidity, moisture, and light trends
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {metrics.map((m) => (
                      <div key={"spark-" + m.key} className="rounded-lg bg-secondary p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Gauge className="size-4 text-muted-foreground" aria-hidden="true" />
                            <span className="text-sm font-semibold">{m.title}</span>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {m.value === null ? "—" : m.value} {m.unit}
                          </span>
                        </div>
                        <Sparkline
                          data={m.trend}
                          colorClass={
                            m.key === "temperature"
                              ? "stroke-[var(--chart-4)]"
                              : m.key === "humidity"
                              ? "stroke-[var(--chart-3)]"
                              : m.key === "moisture"
                              ? "stroke-[var(--chart-2)]"
                              : "stroke-[var(--chart-5)]"
                          }
                          label={m.title + " sparkline"}
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border border-border rounded-xl">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <SquareActivity className="size-4 text-muted-foreground" aria-hidden="true" />
                    <CardTitle className="text-base sm:text-lg">ML Alerts</CardTitle>
                  </div>
                  <CardDescription className="text-muted-foreground">
                    Predicted risks and suggested interventions
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {alerts.slice(0, 3).map((a) => (
                    <AnalyticsAlertItem key={a.id} alert={a} />
                  ))}
                  <div className="pt-1">
                    <Button variant="outline" size="sm" className="w-full border-border">
                      View all analytics
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {orchids.map((o) => (
                <OrchidCardItem key={o.id} orchid={o} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4 sm:space-y-6">
            <Card className="bg-card border border-border rounded-xl">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <SquareActivity className="size-4 text-muted-foreground" aria-hidden="true" />
                    <CardTitle className="text-base sm:text-lg">Predictive insights</CardTitle>
                  </div>
                  <Badge variant="secondary" className="bg-secondary">Updated 1m ago</Badge>
                </div>
                <CardDescription className="text-muted-foreground">
                  Confidence levels and recommended actions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {alerts.map((a) => (
                  <AnalyticsAlertItem key={a.id} alert={a} />
                ))}
              </CardContent>
            </Card>

            <Card className="bg-card border border-border rounded-xl">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <PanelRight className="size-4 text-muted-foreground" aria-hidden="true" />
                  <CardTitle className="text-base sm:text-lg">Care scenario simulation</CardTitle>
                </div>
                <CardDescription className="text-muted-foreground">
                  Test parameter changes and preview expected impact
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Irrigation frequency</p>
                    <Progress value={40} className="h-2" aria-label="Irrigation frequency" />
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Lower</span>
                      <span>Higher</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Target humidity</p>
                    <Progress value={65} className="h-2" aria-label="Target humidity" />
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>40%</span>
                      <span>80%</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Lighting intensity</p>
                    <Progress value={55} className="h-2" aria-label="Lighting intensity" />
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Low</span>
                      <span>High</span>
                    </div>
                  </div>
                </div>
                <div className="rounded-lg bg-secondary p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold">Forecast impact</p>
                    <Badge variant="secondary" className="bg-accent text-accent-foreground">3-day</Badge>
                  </div>
                  <Sparkline
                    data={[40, 42, 45, 50, 58, 62, 68, 70, 73, 75, 78, 80]}
                    colorClass="stroke-[var(--chart-5)]"
                    label="Projected growth index"
                  />
                </div>
                <div className="flex items-center justify-end gap-2">
                  <Button variant="outline" className="border-border" onClick={() => toast.message("Simulation reset")}>
                    Reset
                  </Button>
                  <Button onClick={() => toast.success("Simulation applied")}>Apply scenario</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="controls" className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <Card className="bg-card border border-border rounded-xl lg:col-span-2">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <MonitorCheck className="size-4 text-muted-foreground" aria-hidden="true" />
                    <CardTitle className="text-base sm:text-lg">Greenhouse systems</CardTitle>
                  </div>
                  <CardDescription className="text-muted-foreground">
                    Real-time status and manual override
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {controls.map((s) => (
                    <SubsystemStatus
                      key={s.name}
                      subsystem={s}
                      onToggleAuto={() => {
                        setControls((prev) =>
                          prev.map((p) => (p.name === s.name ? { ...p, auto: !p.auto } : p))
                        )
                        toast.success("Mode updated", { description: "Auto mode toggled for " + s.name })
                      }}
                    />
                  ))}
                </CardContent>
              </Card>

              <Card className="bg-card border border-border rounded-xl">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <Webhook className="size-4 text-muted-foreground" aria-hidden="true" />
                    <CardTitle className="text-base sm:text-lg">Integrations</CardTitle>
                  </div>
                  <CardDescription className="text-muted-foreground">
                    Connect with horticultural platforms
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between rounded-lg bg-secondary p-3">
                    <div>
                      <p className="text-sm font-semibold">OpenAg API</p>
                      <p className="text-xs text-muted-foreground">Bidirectional control</p>
                    </div>
                    <Switch aria-label="OpenAg API" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-secondary p-3">
                    <div>
                      <p className="text-sm font-semibold">GrowCloud</p>
                      <p className="text-xs text-muted-foreground">Sensor sync</p>
                    </div>
                    <Switch aria-label="GrowCloud" />
                  </div>
                  <div className="pt-1">
                    <Button variant="outline" className="w-full border-border" onClick={handleExport}>
                      Export data
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-4 sm:space-y-6">
            <Card className="bg-card border border-border rounded-xl">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <ChartSpline className="size-4 text-muted-foreground" aria-hidden="true" />
                  <CardTitle className="text-base sm:text-lg">Historical analysis</CardTitle>
                </div>
                <CardDescription className="text-muted-foreground">
                  Timeline filters and condition correlations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="rounded-lg bg-secondary p-3">
                    <p className="text-sm font-semibold mb-2">Growth index</p>
                    <Sparkline
                      data={[30, 31, 33, 35, 40, 45, 47, 50, 54, 60, 62, 65]}
                      colorClass="stroke-[var(--chart-1)]"
                      label="Growth index history"
                    />
                  </div>
                  <div className="rounded-lg bg-secondary p-3">
                    <p className="text-sm font-semibold mb-2">Humidity correlation</p>
                    <Sparkline
                      data={[60, 58, 59, 61, 63, 65, 64, 63, 62, 64, 66, 67]}
                      colorClass="stroke-[var(--chart-3)]"
                      label="Humidity correlation"
                    />
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary" className="bg-secondary">Last 30 days</Badge>
                  <Badge variant="secondary" className="bg-secondary">Greenhouse A</Badge>
                  <Badge variant="secondary" className="bg-secondary">All species</Badge>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4 sm:space-y-6">
            <Card className="bg-card border border-border rounded-xl">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <PanelRight className="size-4 text-muted-foreground" aria-hidden="true" />
                  <CardTitle className="text-base sm:text-lg">Notification center</CardTitle>
                </div>
                <CardDescription className="text-muted-foreground">
                  Care reminders, critical alerts, and schedules
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className="rounded-lg border border-border bg-secondary p-3 flex items-start justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <StatusDot
                          tone={
                            n.level === "critical" ? "crit" : n.level === "warning" ? "warn" : "ok"
                          }
                        />
                        <p className="text-sm font-semibold truncate">{n.title}</p>
                        <span className="text-xs text-muted-foreground">{n.time}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1 break-words">{n.description}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => toast.message("Snoozed", { description: n.title })}
                      >
                        Snooze
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-border"
                        onClick={() =>
                          setNotifications((prev) => prev.filter((x) => x.id !== n.id))
                        }
                      >
                        Dismiss
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4 sm:space-y-6">
            <Card className="bg-card border border-border rounded-xl">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <PanelRight className="size-4 text-muted-foreground" aria-hidden="true" />
                  <CardTitle className="text-base sm:text-lg">System configuration</CardTitle>
                </div>
                <CardDescription className="text-muted-foreground">
                  Sensor management, data, and integrations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="rounded-lg bg-secondary p-3 space-y-2">
                    <p className="text-sm font-semibold">Sensors</p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Total</span>
                      <span className="font-medium">24</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Active</span>
                      <span className="font-medium">22</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Needs service</span>
                      <span className="font-medium">2</span>
                    </div>
                    <div className="pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full border-border"
                        onClick={handleConfigureSensors}
                      >
                        Manage sensors
                      </Button>
                    </div>
                  </div>
                  <div className="rounded-lg bg-secondary p-3 space-y-2">
                    <p className="text-sm font-semibold">Data</p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Retention</span>
                      <span className="font-medium">12 months</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Export format</span>
                      <span className="font-medium">CSV</span>
                    </div>
                    <div className="pt-2">
                      <Button variant="outline" size="sm" className="w-full border-border" onClick={handleExport}>
                        Export now
                      </Button>
                    </div>
                  </div>
                  <div className="rounded-lg bg-secondary p-3 space-y-2">
                    <p className="text-sm font-semibold">Integrations</p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">OpenAg API</span>
                      <Switch defaultChecked aria-label="OpenAg API" />
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">GrowCloud</span>
                      <Switch aria-label="GrowCloud" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {loading ? (
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="h-28 rounded-xl bg-muted animate-pulse" />
            <div className="h-28 rounded-xl bg-muted animate-pulse" />
            <div className="h-28 rounded-xl bg-muted animate-pulse" />
          </div>
        ) : null}
      </section>
    </div>
  )
}