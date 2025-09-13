"use client"

import * as React from "react"
import OrchidMonitoringDashboard, { OrchidMonitoringDashboardProps } from "@/components/OrchidMonitoringDashboard"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Leaf, Settings, Bell, Menu, Building2 } from "lucide-react"

type GreenhouseKey = "A" | "B" | "C"

const greenhousePresets: Record<
  GreenhouseKey,
  Required<Pick<
    OrchidMonitoringDashboardProps,
    "metrics" | "orchids" | "analyticsAlerts" | "controls"
  >>
> = {
  A: {
    metrics: [
      { key: "temperature", title: "Temperature", unit: "°C", value: 23.2, target: "22-26", status: "ok", trend: [44, 46, 47, 49, 50, 52, 51, 50, 49, 50, 51, 52] },
      { key: "humidity", title: "Humidity", unit: "%RH", value: 61, target: "55-70", status: "ok", trend: [60, 59, 60, 61, 62, 63, 64, 63, 62, 61, 61, 62] },
      { key: "moisture", title: "Soil Moisture", unit: "%VWC", value: 33, target: "30-40", status: "warn", trend: [40, 39, 38, 37, 36, 35, 34, 33, 33, 34, 34, 33] },
      { key: "light", title: "Light", unit: "µmol/m²·s", value: 205, target: "150-250", status: "ok", trend: [140, 160, 170, 190, 205, 215, 225, 230, 220, 210, 205, 205] },
    ],
    orchids: [
      {
        id: "a1",
        name: "Aurora",
        species: "Phalaenopsis sp.",
        stage: "bloom",
        health: "excellent",
        imageUrl: "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?q=80&w=1200&auto=format&fit=crop",
        recommendations: ["Maintain humidity near 60%.", "Bright, indirect light; avoid midday sun.", "Fertilize at 1/4 strength weekly."],
      },
      {
        id: "a2",
        name: "Saffron",
        species: "Cattleya maxima",
        stage: "vegetative",
        health: "good",
        imageUrl: "https://images.unsplash.com/photo-1520975682031-ae5b43b5f03b?q=80&w=1200&auto=format&fit=crop",
        recommendations: ["Increase airflow around pseudobulbs.", "Allow medium to dry slightly between waterings."],
      },
    ],
    analyticsAlerts: [
      {
        id: "ga1",
        type: "growth",
        title: "Light slightly below optimal for flowering",
        confidence: 72,
        recommendation: "Increase PPFD by ~10% during photoperiod.",
        severity: "medium",
      },
      {
        id: "ga2",
        type: "pest",
        title: "Low risk of mealybugs",
        confidence: 28,
        recommendation: "Continue weekly inspections on leaf nodes.",
        severity: "low",
      },
    ],
    controls: [
      { name: "watering", auto: true, status: "idle", lastRun: "Today 07:10" },
      { name: "climate", auto: true, status: "active", lastRun: "—" },
      { name: "lighting", auto: false, status: "paused", lastRun: "Yesterday 19:30" },
    ],
  },
  B: {
    metrics: [
      { key: "temperature", title: "Temperature", unit: "°C", value: 24.5, target: "22-26", status: "ok", trend: [46, 47, 48, 49, 50, 51, 52, 53, 52, 51, 50, 49] },
      { key: "humidity", title: "Humidity", unit: "%RH", value: 58, target: "55-70", status: "ok", trend: [57, 58, 59, 60, 60, 59, 58, 58, 59, 60, 60, 59] },
      { key: "moisture", title: "Soil Moisture", unit: "%VWC", value: 28, target: "30-40", status: "warn", trend: [36, 35, 33, 31, 30, 29, 28, 28, 29, 30, 30, 28] },
      { key: "light", title: "Light", unit: "µmol/m²·s", value: 190, target: "150-250", status: "ok", trend: [130, 150, 170, 185, 195, 200, 205, 210, 205, 195, 190, 190] },
    ],
    orchids: [
      {
        id: "b1",
        name: "Zephyr",
        species: "Dendrobium nobile",
        stage: "spike",
        health: "fair",
        imageUrl: "https://images.unsplash.com/photo-1582582621959-4eb51a2be2b2?q=80&w=1200&auto=format&fit=crop",
        recommendations: ["Boost light to encourage spikes.", "Monitor for mites on undersides of leaves."],
      },
    ],
    analyticsAlerts: [
      {
        id: "gb1",
        type: "disease",
        title: "Black rot risk uptrend",
        confidence: 76,
        recommendation: "Improve drainage; reduce leaf wetness.",
        severity: "medium",
      },
    ],
    controls: [
      { name: "watering", auto: false, status: "paused", lastRun: "Today 06:40" },
      { name: "climate", auto: true, status: "active", lastRun: "—" },
      { name: "lighting", auto: true, status: "idle", lastRun: "Today 08:00" },
    ],
  },
  C: {
    metrics: [
      { key: "temperature", title: "Temperature", unit: "°C", value: 21.9, target: "22-26", status: "warn", trend: [40, 41, 41, 42, 43, 44, 43, 42, 42, 41, 41, 40] },
      { key: "humidity", title: "Humidity", unit: "%RH", value: 66, target: "55-70", status: "ok", trend: [64, 65, 65, 66, 67, 67, 66, 66, 65, 65, 66, 66] },
      { key: "moisture", title: "Soil Moisture", unit: "%VWC", value: 37, target: "30-40", status: "ok", trend: [35, 35, 36, 36, 37, 38, 38, 38, 37, 37, 37, 37] },
      { key: "light", title: "Light", unit: "µmol/m²·s", value: 235, target: "150-250", status: "ok", trend: [160, 180, 200, 220, 235, 240, 245, 240, 238, 236, 235, 235] },
    ],
    orchids: [
      {
        id: "c1",
        name: "Glacier",
        species: "Paphiopedilum sp.",
        stage: "rest",
        health: "good",
        imageUrl: "https://images.unsplash.com/photo-1520975682031-ae5b43b5f03b?q=80&w=1200&auto=format&fit=crop",
        recommendations: ["Reduce watering frequency.", "Cooler nights to maintain rest period."],
      },
    ],
    analyticsAlerts: [
      {
        id: "gc1",
        type: "growth",
        title: "Optimal PPFD for vegetative growth",
        confidence: 83,
        recommendation: "Maintain intensity; monitor leaf temperature.",
        severity: "low",
      },
    ],
    controls: [
      { name: "watering", auto: true, status: "idle", lastRun: "Today 05:55" },
      { name: "climate", auto: false, status: "paused", lastRun: "Yesterday 22:00" },
      { name: "lighting", auto: true, status: "active", lastRun: "—" },
    ],
  },
}

export default function Page() {
  const [sidebarOpen, setSidebarOpen] = React.useState(false)
  const [selectedHouse, setSelectedHouse] = React.useState<GreenhouseKey>("A")

  const handleSelectHouse = React.useCallback((key: GreenhouseKey) => {
    setSelectedHouse(key)
    setSidebarOpen(false)
  }, [])

  const handleAddOrchid = React.useCallback(() => {
    // In a full app, open a dialog/wizard here
    console.log("Add orchid flow")
  }, [])

  const handleConfigureSensors = React.useCallback(() => {
    console.log("Open sensor configuration")
  }, [])

  const handleExportData = React.useCallback(() => {
    console.log("Export data")
  }, [])

  const data = greenhousePresets[selectedHouse]

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <div className="flex h-dvh">
        {/* Sidebar */}
        <aside
          className={`${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-40 w-64 border-r border-border bg-card transition-transform`}
        >
          <div className="h-14 px-4 flex items-center gap-2 border-b border-border">
            <div className="size-8 rounded-lg bg-accent flex items-center justify-center">
              <Leaf className="size-4 text-accent-foreground" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate">Digital Twin Orchid</p>
              <p className="text-xs text-muted-foreground truncate">Management System</p>
            </div>
          </div>

          <nav className="p-3 space-y-3">
            <div>
              <p className="px-2 text-xs font-medium text-muted-foreground mb-2">Greenhouses</p>
              <div className="space-y-2">
                {(["A", "B", "C"] as GreenhouseKey[]).map((k) => {
                  const active = selectedHouse === k
                  return (
                    <button
                      key={k}
                      onClick={() => handleSelectHouse(k)}
                      className={`w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                        active ? "bg-secondary text-foreground" : "hover:bg-muted text-muted-foreground"
                      }`}
                    >
                      <Building2 className="size-4" aria-hidden="true" />
                      <span>Greenhouse {k}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <button
                className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-muted text-muted-foreground"
                onClick={() => console.log("Notifications center")}
              >
                <Bell className="size-4" aria-hidden="true" />
                <span>Notifications</span>
              </button>
              <button
                className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-muted text-muted-foreground"
                onClick={() => console.log("System settings")}
              >
                <Settings className="size-4" aria-hidden="true" />
                <span>Settings</span>
              </button>
            </div>
          </nav>
        </aside>

        {/* Main */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top bar */}
          <header className="h-14 border-b border-border bg-background/60 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-30">
            <div className="h-full px-3 lg:px-6 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="lg:hidden"
                  onClick={() => setSidebarOpen((s) => !s)}
                >
                  <Menu className="size-4" />
                </Button>
                <div className="hidden lg:flex items-center gap-2">
                  <Leaf className="size-4 text-muted-foreground" aria-hidden="true" />
                  <span className="text-sm font-semibold">Orchid Twin</span>
                  <span className="text-muted-foreground">/</span>
                  <span className="text-sm text-muted-foreground">Greenhouse {selectedHouse}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleConfigureSensors}>
                  Configure sensors
                </Button>
                <Button size="sm" onClick={handleAddOrchid}>
                  Add orchid
                </Button>
              </div>
            </div>
          </header>

          {/* Content */}
          <main className="flex-1 overflow-y-auto">
            <div className="max-w-[1400px] mx-auto p-3 sm:p-6">
              <OrchidMonitoringDashboard
                className="w-full"
                metrics={data.metrics}
                orchids={data.orchids}
                analyticsAlerts={data.analyticsAlerts}
                controls={data.controls}
                onAddOrchid={handleAddOrchid}
                onConfigureSensors={handleConfigureSensors}
                onExportData={handleExportData}
              />
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}