import React from "react";
import { createRoot } from "react-dom/client";
import { CircleMarker, GeoJSON, MapContainer, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import {
  Bell,
  BookOpen,
  Box,
  ChevronDown,
  Compass,
  Database,
  Download,
  Eye,
  EyeOff,
  FileSearch,
  Flame,
  Globe2,
  Grid2X2,
  Home,
  Info,
  Layers,
  LockKeyhole,
  LogOut,
  Map,
  MapPinned,
  Menu,
  Minus,
  PencilRuler,
  Plus,
  Ruler,
  Search,
  Share2,
  ShieldCheck,
  Upload,
  UserCircle,
  Waves,
  Wind,
  X,
  ZoomIn
} from "lucide-react";
import "leaflet/dist/leaflet.css";
import "./styles.css";

const panelOptions = [
  { label: "Território", icon: Globe2, active: true },
  { label: "Alertas de Calor", icon: Flame },
  { label: "Hidrometria", icon: Waves },
  { label: "Observatório Rural", icon: MapPinned }
];

const leftActions = [
  { label: "Camadas", icon: Layers, panel: "layers" },
  { label: "Repositório", icon: Database, panel: "repository" },
  { label: "Atualizações", icon: Bell, panel: "updates" },
  { label: "Guia rápido", icon: BookOpen, panel: "guide" },
  { label: "Sobre", icon: Info, panel: "about" }
];

const topTools = [
  { id: "draw", label: "Desenhar", icon: PencilRuler },
  { id: "measure", label: "Medir", icon: Ruler },
  { id: "customLayers", label: "Camadas Personalizadas", icon: Grid2X2 },
  { id: "registry", label: "Buscar Registro", icon: FileSearch },
  { id: "wind", label: "Ventos", icon: Wind },
  { id: "import", label: "Importar Arquivo", icon: Upload },
  { id: "export", label: "Exportar Mapa", icon: Download }
];

const rightTools = [
  { id: "north", label: "Apontar ao norte", icon: Compass },
  { id: "3d", label: "Modo 3D", icon: Box },
  { id: "globe", label: "Globo", icon: Globe2 },
  { id: "zoomArea", label: "Zoom por área", icon: ZoomIn },
  { id: "share", label: "Compartilhar", icon: Share2 },
  { id: "home", label: "Posição inicial", icon: Home },
  { id: "miniMap", label: "Minimapa", icon: Map },
  { id: "info", label: "Informações", icon: Info }
];

const initialLayers = [
  { id: "conservation", title: "Áreas de conservação", detail: "34 recortes ativos", color: "bg-moss", active: true },
  { id: "water", title: "Bacias hidrográficas", detail: "12 sub-bacias", color: "bg-river", active: true },
  { id: "soil", title: "Uso do solo", detail: "Atualizado em junho", color: "bg-amberline", active: true },
  { id: "rural", title: "Monitoramento rural", detail: "5.428 registros", color: "bg-emerald-300", active: false },
  { id: "heat", title: "Alertas térmicos", detail: "18 focos em observação", color: "bg-orange-400", active: false }
];

const initialReferenceBases = [
  {
    id: "municipal-grid",
    title: "Malha municipal de referência",
    theme: "Administrativo",
    format: "GeoJSON",
    geometry: "Polígono",
    scale: "1:100.000",
    updated: "Junho/2026",
    features: 52,
    active: true,
    color: "border-river bg-river/15"
  },
  {
    id: "hydro-lines",
    title: "Eixos hidrográficos principais",
    theme: "Hidrografia",
    format: "GeoPackage",
    geometry: "Linha",
    scale: "1:50.000",
    updated: "Maio/2026",
    features: 184,
    active: true,
    color: "border-sky-500 bg-sky-400/15"
  },
  {
    id: "protected-areas",
    title: "Unidades ambientais consolidadas",
    theme: "Ambiental",
    format: "Shapefile",
    geometry: "Polígono",
    scale: "1:250.000",
    updated: "Abril/2026",
    features: 37,
    active: false,
    color: "border-moss bg-moss/20"
  },
  {
    id: "rural-points",
    title: "Pontos de apoio rural",
    theme: "Cadastro",
    format: "CSV + WKT",
    geometry: "Ponto",
    scale: "Precisão de campo",
    updated: "Julho/2026",
    features: 428,
    active: false,
    color: "border-amberline bg-amberline/20"
  }
];

const searchPlaces = [
  { name: "Porto Claro", type: "Município", coord: "08.703 S, 63.908 O" },
  { name: "Reserva Arumã", type: "Unidade ambiental", coord: "09.121 S, 62.442 O" },
  { name: "Rio Mutum", type: "Curso d'água", coord: "08.884 S, 64.211 O" }
];

const updates = [
  "Nova base de bacias hidrográficas publicada",
  "Camada de uso do solo recalculada",
  "Exportação em PNG disponível no painel"
];

const demoUsers = [
  { email: "admin@atlas.local", password: "admin123", name: "Administrador", role: "admin" },
  { email: "analista@atlas.local", password: "atlas123", name: "Analista", role: "viewer" }
];

const API_BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:3333/api";
const mapCenter = [-8.76, -63.9];

const layerGeoJson = {
  conservation: {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: { name: "Reserva Arumã" },
        geometry: {
          type: "Polygon",
          coordinates: [[[-64.12, -8.82], [-63.96, -8.72], [-63.79, -8.78], [-63.84, -8.93], [-64.08, -8.96], [-64.12, -8.82]]]
        }
      }
    ]
  },
  water: {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: { name: "Rio Mutum" },
        geometry: {
          type: "LineString",
          coordinates: [[-64.26, -8.48], [-64.08, -8.61], [-63.94, -8.78], [-63.82, -8.97]]
        }
      }
    ]
  },
  soil: {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: { name: "Corredor rural" },
        geometry: {
          type: "LineString",
          coordinates: [[-64.24, -9.02], [-64.03, -8.87], [-63.75, -8.67], [-63.52, -8.55]]
        }
      }
    ]
  }
};

const referenceGeoJson = {
  "municipal-grid": {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: { name: "Porto Claro" },
        geometry: {
          type: "Polygon",
          coordinates: [[[-64.08, -8.64], [-63.9, -8.64], [-63.9, -8.81], [-64.08, -8.81], [-64.08, -8.64]]]
        }
      },
      {
        type: "Feature",
        properties: { name: "Vale Novo" },
        geometry: {
          type: "Polygon",
          coordinates: [[[-63.88, -8.82], [-63.66, -8.82], [-63.66, -9.02], [-63.88, -9.02], [-63.88, -8.82]]]
        }
      }
    ]
  },
  "hydro-lines": {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: { name: "Igarapé Leste" },
        geometry: {
          type: "LineString",
          coordinates: [[-64.18, -8.58], [-64.02, -8.72], [-63.88, -8.9], [-63.72, -9.04]]
        }
      },
      {
        type: "Feature",
        properties: { name: "Igarapé Norte" },
        geometry: {
          type: "LineString",
          coordinates: [[-63.86, -8.49], [-63.72, -8.57], [-63.58, -8.66]]
        }
      }
    ]
  },
  "protected-areas": {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: { name: "Unidade Ambiental Serra Azul" },
        geometry: {
          type: "Polygon",
          coordinates: [[[-64.18, -8.9], [-64.02, -8.83], [-63.92, -8.98], [-64.1, -9.08], [-64.18, -8.9]]]
        }
      }
    ]
  },
  "rural-points": {
    type: "FeatureCollection",
    features: [
      { type: "Feature", properties: { name: "Apoio rural 1" }, geometry: { type: "Point", coordinates: [-63.96, -8.7] } },
      { type: "Feature", properties: { name: "Apoio rural 2" }, geometry: { type: "Point", coordinates: [-63.72, -8.88] } },
      { type: "Feature", properties: { name: "Apoio rural 3" }, geometry: { type: "Point", coordinates: [-64.12, -8.96] } }
    ]
  }
};

const toolGeoJson = {
  measure: {
    type: "FeatureCollection",
    features: [{ type: "Feature", properties: { name: "23,8 km" }, geometry: { type: "LineString", coordinates: [[-64.1, -8.84], [-63.78, -8.66]] } }]
  },
  draw: {
    type: "FeatureCollection",
    features: [{ type: "Feature", properties: { name: "Área desenhada" }, geometry: { type: "Polygon", coordinates: [[[-63.86, -8.72], [-63.72, -8.7], [-63.7, -8.83], [-63.88, -8.86], [-63.86, -8.72]]] } }]
  },
  zoomArea: {
    type: "FeatureCollection",
    features: [{ type: "Feature", properties: { name: "Zoom por área" }, geometry: { type: "Polygon", coordinates: [[[-64.05, -8.62], [-63.68, -8.62], [-63.68, -8.9], [-64.05, -8.9], [-64.05, -8.62]]] } }]
  }
};

function IconButton({ label, icon: Icon, active = false, onClick, className = "" }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={`grid h-10 w-10 place-items-center rounded-lg border border-white/10 bg-ink/90 text-white shadow-control transition hover:-translate-y-0.5 hover:bg-peat focus:outline-none focus:ring-2 focus:ring-amberline/80 ${
        active ? "text-amberline ring-1 ring-amberline/80" : ""
      } ${className}`}
    >
      <Icon size={19} strokeWidth={2.2} />
    </button>
  );
}

function LeftRail({ activePanel, setActivePanel, currentUser }) {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 flex w-12 flex-col items-center justify-between bg-ink text-white shadow-panel">
      <div className="flex flex-col gap-3 pt-4">
        {leftActions.map((action) => (
          <IconButton
            key={action.label}
            label={action.label}
            icon={action.icon}
            active={activePanel === action.panel}
            onClick={() => setActivePanel(activePanel === action.panel ? null : action.panel)}
            className="h-9 w-9 border-0 bg-transparent shadow-none hover:bg-white/10"
          />
        ))}
      </div>
      <IconButton
        label={currentUser ? "Conta" : "Entrar"}
        icon={UserCircle}
        onClick={() => setActivePanel(activePanel === "login" ? null : "login")}
        active={activePanel === "login"}
        className="mb-4 h-9 w-9 border-0 bg-transparent text-amberline shadow-none hover:bg-white/10"
      />
    </aside>
  );
}

function PanelSwitcher({ open, setOpen, activeMap, setActiveMap }) {
  return (
    <div className="relative">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className="flex h-11 min-w-0 items-center gap-2 rounded-lg border border-white/10 bg-ink/95 px-3 text-left text-white shadow-control transition hover:bg-peat focus:outline-none focus:ring-2 focus:ring-amberline/80"
      >
        <Globe2 size={18} className="shrink-0 text-emerald-300" />
        <span className="hidden text-sm font-semibold sm:inline">Atlas Verde</span>
        <span className="text-sm text-white/60">{activeMap}</span>
        <ChevronDown size={16} className={`transition ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute left-0 top-14 w-64 rounded-lg border border-white/10 bg-ink/95 p-2 text-white shadow-panel backdrop-blur">
          <p className="px-2 pb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-white/50">Mudar painel</p>
          <div className="space-y-1">
            {panelOptions.map(({ label, icon: Icon }) => {
              const active = label === activeMap;
              return (
                <button
                  type="button"
                  key={label}
                  onClick={() => {
                    setActiveMap(label);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm transition hover:bg-white/10 ${
                    active ? "border border-amberline/80 bg-white/5 text-white" : "text-white/75"
                  }`}
                >
                  <Icon size={17} className={active ? "text-emerald-300" : "text-river"} />
                  <span className="font-medium">{label}</span>
                  {active && <span className="ml-auto h-2 w-2 rounded-full bg-emerald-300" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function SearchControl({ query, setQuery, setActivePanel }) {
  const matches = query.trim()
    ? searchPlaces.filter((place) => place.name.toLowerCase().includes(query.trim().toLowerCase()))
    : [];

  return (
    <div className="relative flex min-w-0 flex-1 sm:max-w-sm">
      <label className="flex h-11 min-w-0 flex-1 items-center gap-2 rounded-lg border border-white/10 bg-white/90 px-3 text-ink shadow-control">
        <Search size={18} className="shrink-0 text-river" />
        <input
          aria-label="Buscar lugar no mapa"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="min-w-0 flex-1 bg-transparent text-sm font-medium outline-none placeholder:text-slate-500"
          placeholder="Buscar área, rio ou município..."
        />
      </label>

      {matches.length > 0 && (
        <div className="absolute left-0 right-0 top-14 overflow-hidden rounded-lg border border-white/10 bg-white shadow-panel">
          {matches.map((place) => (
            <button
              type="button"
              key={place.name}
              onClick={() => setActivePanel("search")}
              className="flex w-full items-start gap-3 px-3 py-3 text-left text-ink transition hover:bg-slate-100"
            >
              <MapPinned size={18} className="mt-0.5 text-river" />
              <span>
                <span className="block text-sm font-bold">{place.name}</span>
                <span className="block text-xs text-slate-500">{place.type} · {place.coord}</span>
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function TopBar({ switcherOpen, setSwitcherOpen, activeMap, setActiveMap, activeTool, setActiveTool, query, setQuery, setActivePanel }) {
  return (
    <header className="fixed left-14 right-3 top-3 z-20 flex items-start justify-between gap-3 md:left-16">
      <div className="flex min-w-0 flex-1 gap-2">
        <PanelSwitcher open={switcherOpen} setOpen={setSwitcherOpen} activeMap={activeMap} setActiveMap={setActiveMap} />
        <SearchControl query={query} setQuery={setQuery} setActivePanel={setActivePanel} />
      </div>
      <div className="hidden items-center gap-2 lg:flex">
        {topTools.map((tool) => (
          <IconButton
            key={tool.id}
            label={tool.label}
            icon={tool.icon}
            active={activeTool === tool.id}
            onClick={() => {
              setActiveTool(activeTool === tool.id ? null : tool.id);
              setActivePanel(tool.id);
            }}
          />
        ))}
      </div>
      <IconButton label="Ferramentas" icon={Menu} onClick={() => setActivePanel("tools")} className="lg:hidden" />
    </header>
  );
}

function MapCanvas({ layers, referenceBases, uploadedVectors, vectorData, activeTool, mapMode, zoom, minimapVisible }) {
  const layerState = Object.fromEntries(layers.map((layer) => [layer.id, layer.active]));
  const activeReferenceIds = new Set(referenceBases.filter((base) => base.active).map((base) => base.id));

  return (
    <main className={`relative h-dvh overflow-hidden bg-[#dce7d6] pl-12 ${mapMode === "3d" ? "map-tilt" : ""}`}>
      <MapContainer center={mapCenter} zoom={10} minZoom={7} maxZoom={15} zoomControl={false} className={`atlas-leaflet ${mapMode === "globe" ? "map-globe" : ""}`}>
        <LeafletZoomController zoom={zoom} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {layerState.conservation && <GeoJSON key="conservation" data={layerGeoJson.conservation} style={leafletStyle("conservation")} onEachFeature={bindPopup} />}
        {layerState.water && <GeoJSON key="water" data={layerGeoJson.water} style={leafletStyle("water")} onEachFeature={bindPopup} />}
        {layerState.soil && <GeoJSON key="soil" data={layerGeoJson.soil} style={leafletStyle("soil")} onEachFeature={bindPopup} />}
        {layerState.rural && <PointLayer points={[[-8.7, -63.96], [-8.88, -63.72], [-8.96, -64.12]]} color="#10b981" />}
        {layerState.heat && <PointLayer points={[[-8.64, -63.7], [-8.82, -63.83], [-8.96, -64.02]]} color="#fb923c" radius={14} />}
        <ReferenceVectorLayers bases={referenceBases} vectorData={vectorData} />
        {uploadedVectors.filter((dataset) => activeReferenceIds.has(dataset.id)).map((dataset) => (
          <GeoJSON key={dataset.id} data={dataset.geojson} style={leafletStyle("uploaded")} pointToLayer={pointToLayer("#e7b75b")} onEachFeature={bindPopup} />
        ))}
        {activeTool === "measure" && <GeoJSON key="measure-tool" data={toolGeoJson.measure} style={leafletStyle("measure")} onEachFeature={bindPopup} />}
        {activeTool === "draw" && <GeoJSON key="draw-tool" data={toolGeoJson.draw} style={leafletStyle("draw")} onEachFeature={bindPopup} />}
        {activeTool === "zoomArea" && <GeoJSON key="zoom-tool" data={toolGeoJson.zoomArea} style={leafletStyle("zoomArea")} onEachFeature={bindPopup} />}
      </MapContainer>
      {activeTool === "wind" && <WindOverlay />}
      {minimapVisible && <MiniMap />}
    </main>
  );
}

function LeafletZoomController({ zoom }) {
  const map = useMap();
  React.useEffect(() => {
    map.setZoom(Math.round(10 + (zoom - 1) * 10));
  }, [map, zoom]);
  return null;
}

function ReferenceVectorLayers({ bases, vectorData }) {
  return bases
    .filter((base) => base.active && (vectorData[base.id] || referenceGeoJson[base.id]))
    .map((base) => (
      <GeoJSON
        key={`${base.id}-${base.active}`}
        data={vectorData[base.id] || referenceGeoJson[base.id]}
        style={leafletStyle(base.id)}
        pointToLayer={pointToLayer("#e7b75b")}
        onEachFeature={bindPopup}
      />
    ));
}

function PointLayer({ points, color, radius = 7 }) {
  return points.map(([lat, lng]) => (
    <CircleMarker key={`${lat}-${lng}`} center={[lat, lng]} radius={radius} pathOptions={{ color: "#ffffff", weight: 2, fillColor: color, fillOpacity: 0.86 }} />
  ));
}

function leafletStyle(id) {
  const styles = {
    conservation: { color: "#75a860", weight: 2, fillColor: "#75a860", fillOpacity: 0.22 },
    water: { color: "#4f91b9", weight: 5, opacity: 0.75 },
    soil: { color: "#bd7453", weight: 3, dashArray: "6 8", opacity: 0.72 },
    "municipal-grid": { color: "#4f91b9", weight: 2, fillColor: "#4f91b9", fillOpacity: 0.1 },
    "hydro-lines": { color: "#0ea5e9", weight: 4, opacity: 0.8 },
    "protected-areas": { color: "#75a860", weight: 3, fillColor: "#75a860", fillOpacity: 0.18 },
    "rural-points": { color: "#e7b75b", weight: 2, fillColor: "#e7b75b", fillOpacity: 0.85 },
    measure: { color: "#e7b75b", weight: 5, opacity: 0.9 },
    draw: { color: "#e7b75b", weight: 3, fillColor: "#e7b75b", fillOpacity: 0.16 },
    zoomArea: { color: "#4f91b9", weight: 2, dashArray: "8 6", fillColor: "#4f91b9", fillOpacity: 0.08 },
    uploaded: { color: "#e7b75b", weight: 3, fillColor: "#e7b75b", fillOpacity: 0.18 }
  };
  return styles[id] || styles.uploaded;
}

function pointToLayer(color) {
  return (_feature, latlng) => L.circleMarker(latlng, { radius: 7, color: "#ffffff", weight: 2, fillColor: color, fillOpacity: 0.9 });
}

function bindPopup(feature, layer) {
  if (feature?.properties?.name) {
    layer.bindPopup(feature.properties.name);
  }
}

function VectorRepositoryOverlay({ referenceBases }) {
  const visible = Object.fromEntries(referenceBases.map((base) => [base.id, base.active]));

  return (
    <div className="pointer-events-none absolute inset-0 left-12 z-[6]">
      {visible["municipal-grid"] && (
        <>
          <div className="vector-polygon absolute left-[30%] top-[18%] h-36 w-48 rotate-[4deg] rounded-[20%] border-2 border-river bg-river/10" />
          <div className="vector-polygon absolute right-[24%] bottom-[22%] h-32 w-56 rotate-[-11deg] rounded-[24%] border-2 border-river bg-river/10" />
        </>
      )}
      {visible["hydro-lines"] && (
        <>
          <div className="vector-line vector-line-a absolute left-[26%] top-[20%] h-40 w-72" />
          <div className="vector-line vector-line-b absolute right-[14%] top-[34%] h-36 w-64" />
        </>
      )}
      {visible["protected-areas"] && (
        <div className="vector-polygon absolute left-[49%] top-[15%] h-52 w-72 rotate-[16deg] rounded-[34%] border-2 border-moss bg-moss/18" />
      )}
      {visible["rural-points"] && (
        <>
          {["left-[38%] top-[46%]", "left-[61%] top-[28%]", "right-[30%] bottom-[32%]", "left-[71%] bottom-[18%]"].map((pos) => (
            <span key={pos} className={`absolute ${pos} h-3 w-3 rounded-full border-2 border-white bg-amberline shadow-control`} />
          ))}
        </>
      )}
    </div>
  );
}

function RuralMarkers() {
  return (
    <div className="pointer-events-none absolute inset-0 left-12">
      {["left-[31%] top-[30%]", "left-[57%] top-[54%]", "right-[28%] top-[34%]", "left-[24%] bottom-[18%]"].map((pos) => (
        <span key={pos} className={`absolute ${pos} h-3 w-3 rounded-full border-2 border-white bg-emerald-500 shadow-control`} />
      ))}
    </div>
  );
}

function HeatMarkers() {
  return (
    <div className="pointer-events-none absolute inset-0 left-12">
      {["left-[36%] top-[48%]", "right-[22%] top-[28%]", "left-[64%] bottom-[26%]"].map((pos) => (
        <span key={pos} className={`absolute ${pos} h-8 w-8 rounded-full bg-orange-500/45 ring-8 ring-orange-400/20`} />
      ))}
    </div>
  );
}

function MeasurementOverlay() {
  return (
    <div className="pointer-events-none absolute left-[32%] top-[34%] z-10 h-36 w-72">
      <div className="absolute left-2 top-20 h-1 w-72 rotate-[-18deg] bg-amberline shadow-control" />
      <div className="absolute left-0 top-[86px] h-4 w-4 rounded-full bg-amberline ring-4 ring-white" />
      <div className="absolute right-0 top-0 h-4 w-4 rounded-full bg-amberline ring-4 ring-white" />
      <div className="absolute left-28 top-8 rounded bg-ink px-3 py-1 text-sm font-bold text-white shadow-control">23,8 km</div>
    </div>
  );
}

function DrawingOverlay() {
  return (
    <div className="pointer-events-none absolute left-[58%] top-[24%] z-10 h-40 w-52 rotate-[-10deg] rounded-[28%] border-4 border-amberline/90 bg-amberline/15 shadow-control" />
  );
}

function ZoomAreaOverlay() {
  return (
    <div className="pointer-events-none absolute left-[35%] top-[26%] z-10 h-64 w-96 border-2 border-dashed border-river bg-river/10 shadow-control" />
  );
}

function WindOverlay() {
  return (
    <div className="pointer-events-none absolute inset-0 left-12 z-10 opacity-80">
      {Array.from({ length: 8 }).map((_, index) => (
        <div
          key={index}
          className="wind-stream absolute h-px w-44 bg-river/70"
          style={{ left: `${18 + index * 9}%`, top: `${18 + (index % 4) * 15}%`, animationDelay: `${index * 0.2}s` }}
        />
      ))}
    </div>
  );
}

function MiniMap() {
  return (
    <div className="fixed bottom-24 right-3 z-20 h-36 w-48 overflow-hidden rounded-lg border border-white/20 bg-white/90 shadow-panel">
      <div className="relative h-full w-full map-grid">
        <span className="absolute left-12 top-9 h-12 w-20 rounded-[40%] bg-moss/50" />
        <span className="absolute bottom-5 right-8 h-10 w-16 rounded-[40%] bg-river/35" />
        <span className="absolute left-1/2 top-1/2 h-12 w-16 -translate-x-1/2 -translate-y-1/2 border-2 border-ink/60 bg-ink/10" />
      </div>
    </div>
  );
}

function MapLabel({ title, className }) {
  return (
    <div className={`absolute rounded bg-white/55 px-2 py-1 text-xs font-semibold text-slate-600 shadow-sm ${className}`}>
      {title}
    </div>
  );
}

function RightControls({ activeTool, setActiveTool, mapMode, setMapMode, zoom, setZoom, minimapVisible, setMinimapVisible, setActivePanel }) {
  function handleTool(id) {
    if (id === "north" || id === "home") {
      setMapMode("2d");
      setZoom(1);
      setActivePanel(id);
      return;
    }
    if (id === "3d") {
      setMapMode(mapMode === "3d" ? "2d" : "3d");
      setActivePanel("3d");
      return;
    }
    if (id === "globe") {
      setMapMode(mapMode === "globe" ? "2d" : "globe");
      setActivePanel("globe");
      return;
    }
    if (id === "miniMap") {
      setMinimapVisible(!minimapVisible);
      setActivePanel("miniMap");
      return;
    }
    setActiveTool(activeTool === id ? null : id);
    setActivePanel(id);
  }

  return (
    <div className="fixed right-3 top-1/2 z-20 hidden -translate-y-1/2 flex-col gap-2 sm:flex">
      {rightTools.map((control) => (
        <IconButton
          key={control.id}
          label={control.label}
          icon={control.icon}
          active={activeTool === control.id || (control.id === "3d" && mapMode === "3d") || (control.id === "globe" && mapMode === "globe") || (control.id === "miniMap" && minimapVisible)}
          onClick={() => handleTool(control.id)}
        />
      ))}
      <div className="mt-2 overflow-hidden rounded-lg border border-white/10 bg-ink/90 shadow-control">
        <IconButton label="Aproximar" icon={Plus} onClick={() => setZoom(Math.min(1.35, zoom + 0.08))} className="rounded-none border-0 shadow-none" />
        <div className="mx-2 h-px bg-white/10" />
        <IconButton label="Afastar" icon={Minus} onClick={() => setZoom(Math.max(0.85, zoom - 0.08))} className="rounded-none border-0 shadow-none" />
      </div>
    </div>
  );
}

function CoordinatesPanel({ mapMode, zoom, activeTool }) {
  return (
    <section className="fixed bottom-3 right-3 z-20 hidden min-w-80 rounded-lg border border-white/10 bg-ink/90 p-4 text-white shadow-panel backdrop-blur md:block">
      <div className="grid grid-cols-[auto_1fr_1fr] items-center gap-x-5 gap-y-2 text-sm">
        <strong className="text-white/70">GMS</strong>
        <span>Lat: 08º42'12"S</span>
        <span>Lng: 63º54'30"O</span>
        <div className="col-span-3 h-px bg-white/10" />
        <strong className="text-white/70">DEC</strong>
        <span>Zoom: {(zoom * 100).toFixed(0)}%</span>
        <span>Modo: {mapMode.toUpperCase()}</span>
      </div>
      {activeTool && <p className="mt-3 text-xs text-amberline">Ferramenta ativa: {toolLabel(activeTool)}</p>}
    </section>
  );
}

function SessionBadge({ currentUser, setActivePanel }) {
  return (
    <button
      type="button"
      onClick={() => setActivePanel("login")}
      className={`fixed bottom-3 left-16 z-20 hidden items-center gap-2 rounded-lg border px-3 py-2 text-xs font-bold shadow-control backdrop-blur sm:flex ${
        currentUser?.role === "admin"
          ? "border-emerald-300/40 bg-emerald-500/20 text-emerald-100"
          : "border-white/10 bg-ink/90 text-white/70"
      }`}
    >
      {currentUser?.role === "admin" ? <ShieldCheck size={16} /> : <LockKeyhole size={16} />}
      {currentUser ? currentUser.name : "Visitante"}
    </button>
  );
}

function FloatingPanel({
  activePanel,
  setActivePanel,
  layers,
  toggleLayer,
  referenceBases,
  toggleReferenceBase,
  activeTool,
  setActiveTool,
  setMinimapVisible,
  currentUser,
  isAdmin,
  authNotice,
  onLogin,
  onLogout,
  requireAdmin,
  uploadedDataset,
  uploadedVectors,
  vectorData,
  uploadError,
  onUploadVectorFile,
  publishUploadedDataset
}) {
  if (!activePanel) return null;

  const title = panelTitle(activePanel);

  return (
    <section className="fixed left-16 top-20 z-20 max-h-[calc(100vh-7rem)] w-[min(24rem,calc(100vw-5.5rem))] overflow-auto rounded-lg border border-white/10 bg-ink/95 p-4 text-white shadow-panel backdrop-blur">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-amberline">Atlas Verde</p>
          <h2 className="text-lg font-semibold">{title}</h2>
        </div>
        <IconButton label="Fechar painel" icon={X} onClick={() => setActivePanel(null)} className="h-8 w-8" />
      </div>
      <PanelContent
        activePanel={activePanel}
        layers={layers}
        toggleLayer={toggleLayer}
        referenceBases={referenceBases}
        toggleReferenceBase={toggleReferenceBase}
        activeTool={activeTool}
        setActiveTool={setActiveTool}
        setMinimapVisible={setMinimapVisible}
        currentUser={currentUser}
        isAdmin={isAdmin}
        authNotice={authNotice}
        onLogin={onLogin}
        onLogout={onLogout}
        requireAdmin={requireAdmin}
        uploadedDataset={uploadedDataset}
        uploadedVectors={uploadedVectors}
        vectorData={vectorData}
        uploadError={uploadError}
        onUploadVectorFile={onUploadVectorFile}
        publishUploadedDataset={publishUploadedDataset}
      />
    </section>
  );
}

function PanelContent({
  activePanel,
  layers,
  toggleLayer,
  referenceBases,
  toggleReferenceBase,
  activeTool,
  setActiveTool,
  setMinimapVisible,
  currentUser,
  isAdmin,
  authNotice,
  onLogin,
  onLogout,
  requireAdmin,
  uploadedDataset,
  uploadedVectors,
  vectorData,
  uploadError,
  onUploadVectorFile,
  publishUploadedDataset
}) {
  if (activePanel === "layers") {
    return (
      <div className="space-y-3">
        {layers.map((item) => (
          <button
            type="button"
            key={item.id}
            onClick={() => toggleLayer(item.id)}
            className="flex w-full cursor-pointer items-center gap-3 rounded-md bg-white/5 p-3 text-left transition hover:bg-white/10"
          >
            <span className={`h-4 w-4 rounded ${item.color}`} />
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold">{item.title}</span>
              <span className="block text-xs text-white/55">{item.detail}</span>
            </span>
            {item.active ? <Eye size={18} className="text-emerald-300" /> : <EyeOff size={18} className="text-white/40" />}
          </button>
        ))}
      </div>
    );
  }

  if (activePanel === "repository") {
    return (
      <div className="space-y-4">
        <div className="rounded-md bg-white/5 p-3">
          <p className="text-sm leading-relaxed text-white/75">
            Catálogo fictício de bases de referência para consulta, publicação e reuso como dados vetoriais.
          </p>
          <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
            <Metric value={referenceBases.length} label="bases" />
            <Metric value={referenceBases.reduce((total, base) => total + base.features, 0)} label="feições" />
            <Metric value="4" label="formatos" />
          </div>
        </div>

        <div className="flex gap-2">
          <input className="min-w-0 flex-1 rounded-md border border-white/10 bg-white/90 px-3 py-2 text-sm text-ink outline-none" placeholder="Buscar no repositório..." />
          <button className="rounded-md bg-river px-3 py-2 text-sm font-bold">Filtrar</button>
        </div>

        <div className="space-y-3">
          {!isAdmin && <AdminGateMessage currentUser={currentUser} />}
          {referenceBases.map((base) => (
            <article key={base.id} className="rounded-md border border-white/10 bg-white/5 p-3">
              <div className="flex items-start gap-3">
                <span className={`mt-1 h-5 w-5 shrink-0 rounded border-2 ${base.color}`} />
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-bold leading-tight">{base.title}</h3>
                  <p className="mt-1 text-xs text-white/55">
                    {base.theme} · {base.geometry} · {base.features} feições
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => (isAdmin ? toggleReferenceBase(base.id) : requireAdmin("publicar ou remover vetores do mapa"))}
                  className={`rounded-md px-2 py-1 text-xs font-bold ${
                    isAdmin
                      ? base.active
                        ? "bg-emerald-400 text-ink"
                        : "bg-white/10 text-white/70"
                      : "bg-white/5 text-white/35"
                  }`}
                >
                  {!isAdmin ? "Somente admin" : base.active ? "Vetor ativo" : "Publicar vetor"}
                </button>
              </div>
              <dl className="mt-3 grid grid-cols-2 gap-2 text-xs text-white/68">
                <div><dt className="text-white/40">Formato</dt><dd>{base.format}</dd></div>
                <div><dt className="text-white/40">Escala</dt><dd>{base.scale}</dd></div>
                <div><dt className="text-white/40">Atualização</dt><dd>{base.updated}</dd></div>
                <div><dt className="text-white/40">SRID</dt><dd>SIRGAS 2000</dd></div>
              </dl>
              <div className="mt-3 flex gap-2">
                <button type="button" onClick={() => downloadReferenceBase(base, uploadedVectors, vectorData)} className="flex-1 rounded-md bg-white/10 px-3 py-2 text-xs font-bold">GeoJSON</button>
                <button className="flex-1 rounded-md bg-white/10 px-3 py-2 text-xs font-bold">SHP</button>
                <button type="button" onClick={() => downloadMetadata(base)} className="flex-1 rounded-md bg-white/10 px-3 py-2 text-xs font-bold">Metadados</button>
              </div>
            </article>
          ))}
        </div>
      </div>
    );
  }

  if (activePanel === "registry") {
    return (
      <div className="space-y-3">
        <input className="w-full rounded-md border border-white/10 bg-white/90 px-3 py-2 text-sm text-ink outline-none" placeholder="Código do registro ambiental" />
        <input className="w-full rounded-md border border-white/10 bg-white/90 px-3 py-2 text-sm text-ink outline-none" placeholder="Protocolo ou documento do proprietário" />
        <button className="w-full rounded-md bg-emerald-500 px-3 py-2 text-sm font-bold text-ink">Filtrar registros</button>
        <ResultCard title="AV-2048-PORTO" detail="Imóvel rural fictício · 482 ha · sobreposição baixa" />
      </div>
    );
  }

  if (activePanel === "draw") {
    return <ToolPanel title="Desenho ativo" detail="Clique no mapa para simular um polígono de análise. A área destacada mostra a geometria temporária." icon={PencilRuler} activeTool={activeTool} setActiveTool={setActiveTool} toolId="draw" />;
  }

  if (activePanel === "measure") {
    return <ToolPanel title="Medição linear" detail="A linha amarela simula uma medição entre dois pontos, com distância total calculada no mapa." icon={Ruler} activeTool={activeTool} setActiveTool={setActiveTool} toolId="measure" />;
  }

  if (activePanel === "customLayers") {
    return (
      <div className="space-y-3">
        <p className="text-sm leading-relaxed text-white/70">Adicione uma camada temporária por URL, arquivo local ou desenho manual e salve no repositório como vetor.</p>
        <input className="w-full rounded-md border border-white/10 bg-white/90 px-3 py-2 text-sm text-ink outline-none" placeholder="https://dados.exemplo/camada.geojson" />
        <select className="w-full rounded-md border border-white/10 bg-white/90 px-3 py-2 text-sm text-ink outline-none">
          <option>GeoJSON</option>
          <option>KML</option>
          <option>Shapefile compactado</option>
          <option>CSV com WKT</option>
        </select>
        <button
          type="button"
          onClick={() => requireAdmin("adicionar camadas ao repositório")}
          className={`w-full rounded-md px-3 py-2 text-sm font-bold ${isAdmin ? "bg-river" : "bg-white/10 text-white/45"}`}
        >
          {isAdmin ? "Adicionar ao repositório" : "Adicionar ao repositório exige admin"}
        </button>
      </div>
    );
  }

  if (activePanel === "wind") {
    return <ToolPanel title="Ventos na superfície" detail="Linhas animadas representam direção e intensidade estimadas para leitura operacional." icon={Wind} activeTool={activeTool} setActiveTool={setActiveTool} toolId="wind" />;
  }

  if (activePanel === "import") {
    return (
      <div className="space-y-3">
        <p className="text-sm text-white/70">Nesta etapa frontend, o Atlas lê arquivos GeoJSON/JSON, renderiza no Leaflet e prepara a publicação no catálogo.</p>
        <label className="block rounded-md border border-dashed border-white/25 bg-white/5 p-5 text-center text-sm text-white/70">
          <Upload className="mx-auto mb-2 text-amberline" size={22} />
          Selecionar arquivo GeoJSON
          <input type="file" accept=".geojson,.json,application/geo+json,application/json" onChange={onUploadVectorFile} className="sr-only" />
        </label>
        {uploadError && <p className="rounded-md bg-amberline/10 p-3 text-xs font-semibold text-amberline">{uploadError}</p>}
        {uploadedDataset ? (
          <ResultCard title={uploadedDataset.name} detail={`${uploadedDataset.features} feições detectadas · ${uploadedDataset.geometry}`} />
        ) : (
          <ResultCard title="Nenhum arquivo carregado" detail="Carregue um GeoJSON para visualizar e publicar como base vetorial." />
        )}
        <button
          type="button"
          onClick={publishUploadedDataset}
          className={`w-full rounded-md px-3 py-2 text-sm font-bold ${isAdmin && uploadedDataset ? "bg-emerald-500 text-ink" : "bg-white/10 text-white/45"}`}
        >
          {isAdmin ? "Publicar como vetor" : "Publicar como vetor exige admin"}
        </button>
      </div>
    );
  }

  if (activePanel === "export") {
    return (
      <div className="space-y-3">
        <p className="text-sm text-white/70">Prepare uma saída fictícia com escala, coordenadas e camadas visíveis.</p>
        <button className="w-full rounded-md bg-emerald-500 px-3 py-2 text-sm font-bold text-ink">Exportar PNG</button>
        <button className="w-full rounded-md bg-white/10 px-3 py-2 text-sm font-bold">Gerar relatório PDF</button>
      </div>
    );
  }

  if (activePanel === "updates") {
    return <ListPanel items={updates} />;
  }

  if (activePanel === "guide") {
    return <ListPanel items={["Use a busca para centralizar lugares", "Ative camadas no painel lateral", "Ferramentas de mapa abrem painéis contextuais"]} />;
  }

  if (activePanel === "about") {
    return <p className="text-sm leading-relaxed text-white/70">Painel demonstrativo original para consulta territorial, com dados e nomes fictícios.</p>;
  }

  if (activePanel === "login") {
    return <LoginPanel currentUser={currentUser} authNotice={authNotice} onLogin={onLogin} onLogout={onLogout} />;
  }

  if (activePanel === "tools") {
    return (
      <div className="grid grid-cols-2 gap-2">
        {topTools.map((tool) => (
          <button key={tool.id} type="button" onClick={() => setActiveTool(tool.id)} className="flex items-center gap-2 rounded-md bg-white/5 p-3 text-left text-sm hover:bg-white/10">
            <tool.icon size={18} />
            {tool.label}
          </button>
        ))}
      </div>
    );
  }

  if (activePanel === "miniMap") {
    return (
      <div className="space-y-3">
        <p className="text-sm text-white/70">O minimapa mostra uma visão reduzida do enquadramento atual.</p>
        <button onClick={() => setMinimapVisible((value) => !value)} className="w-full rounded-md bg-river px-3 py-2 text-sm font-bold">Alternar minimapa</button>
      </div>
    );
  }

  return <p className="text-sm leading-relaxed text-white/70">{panelDescription(activePanel)}</p>;
}

function ToolPanel({ title, detail, icon: Icon, activeTool, setActiveTool, toolId }) {
  return (
    <div className="space-y-4">
      <div className="flex gap-3 rounded-md bg-white/5 p-3">
        <Icon className="mt-0.5 text-amberline" size={20} />
        <p className="text-sm leading-relaxed text-white/72">{detail}</p>
      </div>
      <button
        type="button"
        onClick={() => setActiveTool(activeTool === toolId ? null : toolId)}
        className="w-full rounded-md bg-emerald-500 px-3 py-2 text-sm font-bold text-ink"
      >
        {activeTool === toolId ? "Desativar ferramenta" : `Ativar ${title.toLowerCase()}`}
      </button>
    </div>
  );
}

function ResultCard({ title, detail }) {
  return (
    <div className="rounded-md border border-white/10 bg-white/5 p-3">
      <p className="text-sm font-bold">{title}</p>
      <p className="mt-1 text-xs text-white/60">{detail}</p>
    </div>
  );
}

function AdminGateMessage({ currentUser }) {
  return (
    <div className="flex gap-3 rounded-md border border-amberline/30 bg-amberline/10 p-3 text-sm text-white/78">
      <LockKeyhole className="mt-0.5 shrink-0 text-amberline" size={18} />
      <p>
        {currentUser
          ? "Seu perfil atual pode consultar e baixar bases, mas publicar vetores exige perfil de administrador."
          : "Entre como administrador para publicar, remover ou versionar bases vetoriais de referência."}
      </p>
    </div>
  );
}

function LoginPanel({ currentUser, authNotice, onLogin, onLogout }) {
  const [email, setEmail] = React.useState("admin@atlas.local");
  const [password, setPassword] = React.useState("admin123");
  const [error, setError] = React.useState("");

  async function submit(event) {
    event.preventDefault();
    const result = await onLogin(email, password);
    setError(result ? "" : "Credenciais inválidas para o ambiente de demonstração.");
  }

  if (currentUser) {
    return (
      <div className="space-y-4">
        <div className="rounded-md border border-emerald-300/30 bg-emerald-400/10 p-3">
          <div className="flex items-center gap-3">
            <ShieldCheck className="text-emerald-300" size={22} />
            <div>
              <p className="text-sm font-bold">{currentUser.name}</p>
              <p className="text-xs text-white/60">{currentUser.role === "admin" ? "Perfil administrador" : "Perfil analista"}</p>
            </div>
          </div>
        </div>
        {currentUser.role === "admin" ? (
          <p className="text-sm leading-relaxed text-white/70">Você pode publicar, ocultar e versionar bases de referência vetoriais.</p>
        ) : (
          <AdminGateMessage currentUser={currentUser} />
        )}
        <button
          type="button"
          onClick={onLogout}
          className="flex w-full items-center justify-center gap-2 rounded-md bg-white/10 px-3 py-2 text-sm font-bold"
        >
          <LogOut size={17} />
          Sair do ambiente
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      {authNotice && <AdminGateMessage currentUser={currentUser} />}
      <input
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        className="w-full rounded-md border border-white/10 bg-white/90 px-3 py-2 text-sm text-ink outline-none"
        placeholder="E-mail institucional"
      />
      <input
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        className="w-full rounded-md border border-white/10 bg-white/90 px-3 py-2 text-sm text-ink outline-none"
        placeholder="Senha"
        type="password"
      />
      {error && <p className="text-xs font-semibold text-amberline">{error}</p>}
      <button className="w-full rounded-md bg-amberline px-3 py-2 text-sm font-bold text-ink">Entrar no ambiente</button>
      <div className="rounded-md bg-white/5 p-3 text-xs leading-relaxed text-white/60">
        Admin: admin@atlas.local / admin123<br />
        Analista: analista@atlas.local / atlas123
      </div>
    </form>
  );
}

function Metric({ value, label }) {
  return (
    <div className="rounded-md bg-ink/55 p-2">
      <strong className="block text-sm text-amberline">{value}</strong>
      <span className="text-white/50">{label}</span>
    </div>
  );
}

function ListPanel({ items }) {
  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item} className="rounded-md bg-white/5 p-3 text-sm text-white/75">{item}</li>
      ))}
    </ul>
  );
}

function TutorialModal({ open, setOpen }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 grid place-items-center bg-ink/50 px-4 backdrop-blur-[1px]">
      <section className="w-full max-w-xl overflow-hidden rounded-lg border-2 border-amberline bg-peat text-white shadow-panel">
        <div className="flex items-center justify-between border-b border-white/10 bg-ink/60 px-5 py-4">
          <h2 className="text-xl font-semibold">Guia disponível</h2>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 rounded-md bg-river px-3 py-2 text-sm font-bold uppercase text-white transition hover:bg-river/85"
          >
            Fechar <X size={17} />
          </button>
        </div>
        <div className="space-y-5 px-6 py-7">
          <p className="text-2xl font-semibold leading-snug">Explore dados ambientais com ferramentas de mapa, consulta e medição.</p>
          <p className="text-lg leading-relaxed text-white/75">
            Use o menu lateral para camadas e repositório, e as ferramentas superiores para desenhar, medir, importar, exportar e consultar registros.
          </p>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="w-full rounded-md bg-emerald-500 px-4 py-3 text-sm font-bold uppercase tracking-wide text-ink transition hover:bg-emerald-400"
          >
            Acessar painel
          </button>
        </div>
      </section>
    </div>
  );
}

function MobileDock({ activeTool, setActiveTool, setActivePanel }) {
  return (
    <nav className="fixed bottom-3 left-16 right-3 z-20 grid grid-cols-4 gap-2 rounded-lg border border-white/10 bg-ink/90 p-2 shadow-panel backdrop-blur sm:hidden">
      {topTools.slice(0, 4).map((tool) => (
        <button
          type="button"
          key={tool.id}
          onClick={() => {
            setActiveTool(activeTool === tool.id ? null : tool.id);
            setActivePanel(tool.id);
          }}
          className={`flex h-12 flex-col items-center justify-center gap-1 rounded-md text-[10px] font-semibold transition hover:bg-white/10 ${
            activeTool === tool.id ? "bg-white/10 text-amberline" : "text-white/75"
          }`}
        >
          <tool.icon size={17} />
          <span>{tool.label.split(" ")[0]}</span>
        </button>
      ))}
    </nav>
  );
}

function AnalysisNotes() {
  return (
    <section className="sr-only" aria-label="Resumo da análise de referência">
      <h2>Ferramentas observadas no Geoportal</h2>
      <p>
        Atualizações, sobre, login, seletor de painel, busca geográfica, desenho, medição, camadas personalizadas, busca de cadastro rural,
        ventos, importar arquivo, exportar mapa, norte, modo 3D, globo, zoom por área, compartilhar, início, minimapa, zoom, informações
        e organização de bases de referência.
      </p>
      <h2>Implementação original</h2>
      <p>
        O Atlas Verde usa essas funções como inspiração de produto, com nomes, textos, dados, camadas, catálogo vetorial, mapa sintético e interações próprias.
      </p>
    </section>
  );
}

function panelTitle(activePanel) {
  const titles = {
    layers: "Camadas do território",
    repository: "Repositório de bases",
    updates: "Atualizações",
    guide: "Guia rápido",
    about: "Sobre o Atlas",
    login: "Acesso",
    draw: "Desenhar",
    measure: "Medir",
    customLayers: "Camadas personalizadas",
    registry: "Buscar registro",
    wind: "Ventos",
    import: "Importar arquivo",
    export: "Exportar mapa",
    north: "Orientação",
    "3d": "Modo 3D",
    globe: "Globo",
    zoomArea: "Zoom por área",
    share: "Compartilhar",
    home: "Posição inicial",
    miniMap: "Minimapa",
    info: "Informações do mapa",
    search: "Resultado de busca",
    tools: "Ferramentas"
  };
  return titles[activePanel] || "Ferramenta";
}

function panelDescription(activePanel) {
  const descriptions = {
    north: "A bússola foi recentralizada para o norte e a inclinação do mapa foi removida.",
    "3d": "O modo 3D inclina levemente o mapa para simular relevo e leitura volumétrica.",
    globe: "O modo globo aplica enquadramento circular para uma leitura planetária simplificada.",
    zoomArea: "Arraste uma área no mapa para aproximar o enquadramento. A caixa tracejada indica a seleção ativa.",
    share: "Link fictício pronto para compartilhar o enquadramento, camadas visíveis e ferramenta ativa.",
    home: "O mapa voltou para o enquadramento inicial.",
    info: "Escala, coordenadas, modo de visualização e ferramenta ativa aparecem no painel inferior.",
    search: "Resultado localizado no mapa sintético e pronto para consulta territorial.",
    repository: "Catálogo de bases de referência com publicação vetorial no mapa."
  };
  return descriptions[activePanel] || "Ferramenta ativada no mapa.";
}

function toolLabel(id) {
  const found = [...topTools, ...rightTools].find((tool) => tool.id === id);
  return found?.label || id;
}

function normalizeGeoJson(input) {
  if (!input || typeof input !== "object") {
    throw new Error("GeoJSON vazio");
  }
  if (input.type === "FeatureCollection" && Array.isArray(input.features)) {
    return input;
  }
  if (input.type === "Feature" && input.geometry) {
    return { type: "FeatureCollection", features: [input] };
  }
  if (input.type && input.coordinates) {
    return { type: "FeatureCollection", features: [{ type: "Feature", properties: { name: "Geometria importada" }, geometry: input }] };
  }
  throw new Error("GeoJSON inválido");
}

function summarizeGeometry(geojson) {
  const types = new Set(geojson.features.map((feature) => feature.geometry?.type).filter(Boolean));
  if (types.size === 0) return "Sem geometria";
  return Array.from(types).join(", ");
}

function downloadReferenceBase(base, uploadedVectors, vectorData) {
  const uploaded = uploadedVectors.find((item) => item.id === base.id);
  const geojson = uploaded?.geojson || vectorData[base.id] || referenceGeoJson[base.id];
  if (!geojson) return;
  downloadJson(`${base.title}.geojson`, geojson);
}

function downloadMetadata(base) {
  downloadJson(`${base.title}-metadados.json`, {
    title: base.title,
    theme: base.theme,
    format: base.format,
    geometry: base.geometry,
    scale: base.scale,
    updated: base.updated,
    features: base.features,
    srid: "SIRGAS 2000"
  });
}

function downloadJson(filename, data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/geo+json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

async function apiRequest(path, options = {}) {
  const headers = { ...(options.headers || {}) };
  if (options.token) headers.Authorization = `Bearer ${options.token}`;

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Erro na API." }));
    throw new Error(error.message || "Erro na API.");
  }

  return response.json();
}

function App() {
  const [switcherOpen, setSwitcherOpen] = React.useState(false);
  const [activePanel, setActivePanel] = React.useState(null);
  const [tutorialOpen, setTutorialOpen] = React.useState(true);
  const [activeTool, setActiveTool] = React.useState(null);
  const [activeMap, setActiveMap] = React.useState("Território");
  const [mapMode, setMapMode] = React.useState("2d");
  const [zoom, setZoom] = React.useState(1);
  const [minimapVisible, setMinimapVisible] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [layers, setLayers] = React.useState(initialLayers);
  const [referenceBases, setReferenceBases] = React.useState(initialReferenceBases);
  const [vectorData, setVectorData] = React.useState(referenceGeoJson);
  const [uploadedDataset, setUploadedDataset] = React.useState(null);
  const [uploadedVectors, setUploadedVectors] = React.useState([]);
  const [uploadError, setUploadError] = React.useState("");
  const [currentUser, setCurrentUser] = React.useState(null);
  const [authToken, setAuthToken] = React.useState("");
  const [authNotice, setAuthNotice] = React.useState("");
  const isAdmin = currentUser?.role === "admin";

  React.useEffect(() => {
    loadCatalogFromApi();
  }, []);

  React.useEffect(() => {
    referenceBases.forEach((base) => {
      if (!vectorData[base.id]) loadBaseGeoJson(base.id);
    });
  }, [referenceBases, vectorData]);

  function toggleLayer(id) {
    setLayers((items) => items.map((item) => (item.id === id ? { ...item, active: !item.active } : item)));
  }

  async function toggleReferenceBase(id) {
    if (!requireAdmin("publicar ou remover vetores do mapa")) return;
    if (authToken) {
      try {
        const updated = await apiRequest(`/bases/${id}/toggle`, {
          method: "PATCH",
          token: authToken
        });
        setReferenceBases((items) => items.map((item) => (item.id === id ? updated : item)));
        return;
      } catch (_error) {
        setUploadError("Não foi possível atualizar a base na API. Aplicando alteração local temporária.");
      }
    }
    setReferenceBases((items) => items.map((item) => (item.id === id ? { ...item, active: !item.active } : item)));
  }

  function handleUploadVectorFile(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const geojson = JSON.parse(String(reader.result));
        const normalized = normalizeGeoJson(geojson);
        const features = normalized.features.length;
        setUploadedDataset({
          id: `upload-${Date.now()}`,
          name: file.name,
          file,
          geojson: normalized,
          features,
          geometry: summarizeGeometry(normalized)
        });
        setUploadError("");
      } catch (_error) {
        setUploadedDataset(null);
        setUploadError("Arquivo inválido. Envie um GeoJSON com FeatureCollection, Feature ou geometria válida.");
      }
    };
    reader.readAsText(file);
  }

  async function publishUploadedDataset() {
    if (!requireAdmin("publicar arquivos como vetores")) return;
    if (!uploadedDataset) {
      setUploadError("Carregue um GeoJSON antes de publicar.");
      return;
    }
    if (authToken && uploadedDataset.file) {
      try {
        const formData = new FormData();
        formData.append("file", uploadedDataset.file);
        formData.append("title", uploadedDataset.name.replace(/\.(geojson|json)$/i, ""));
        formData.append("theme", "Importado");
        const base = await apiRequest("/bases", {
          method: "POST",
          token: authToken,
          body: formData
        });
        setReferenceBases((items) => [...items, base]);
        setVectorData((items) => ({ ...items, [base.id]: uploadedDataset.geojson }));
        setUploadedDataset(null);
        setUploadError("");
        setActivePanel("repository");
        return;
      } catch (error) {
        setUploadError(error.message || "Falha ao publicar arquivo na API.");
        return;
      }
    }
    setUploadedVectors((items) => [...items, uploadedDataset]);
    setReferenceBases((items) => [
      ...items,
      {
        id: uploadedDataset.id,
        title: uploadedDataset.name.replace(/\.(geojson|json)$/i, ""),
        theme: "Importado",
        format: "GeoJSON",
        geometry: uploadedDataset.geometry,
        scale: "Fonte do arquivo",
        updated: "Sessão atual",
        features: uploadedDataset.features,
        active: true,
        color: "border-amberline bg-amberline/20"
      }
    ]);
    setUploadError("");
    setActivePanel("repository");
  }

  function requireAdmin(action) {
    if (isAdmin) return true;
    setAuthNotice(`Para ${action}, entre com um perfil de administrador.`);
    setActivePanel("login");
    return false;
  }

  async function handleLogin(email, password) {
    try {
      const session = await apiRequest("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
        headers: { "Content-Type": "application/json" }
      });
      setCurrentUser(session.user);
      setAuthToken(session.token);
      setAuthNotice("");
      return true;
    } catch (_error) {
      const user = demoUsers.find((item) => item.email === email.trim() && item.password === password);
      if (!user) return false;
      setCurrentUser({ email: user.email, name: user.name, role: user.role });
      setAuthToken("");
      setAuthNotice("");
      return true;
    }
  }

  function handleLogout() {
    setCurrentUser(null);
    setAuthToken("");
    setAuthNotice("");
  }

  async function loadCatalogFromApi() {
    try {
      const bases = await apiRequest("/bases");
      setReferenceBases(bases);
      bases.forEach((base) => loadBaseGeoJson(base.id));
    } catch (_error) {
      setReferenceBases(initialReferenceBases);
      setVectorData(referenceGeoJson);
    }
  }

  async function loadBaseGeoJson(id) {
    try {
      const data = await apiRequest(`/bases/${id}/geojson`);
      setVectorData((items) => ({ ...items, [id]: normalizeGeoJson(data) }));
    } catch (_error) {
      // Fallback local fica disponível para as bases seedadas do frontend.
    }
  }

  return (
    <>
      <AnalysisNotes />
      <MapCanvas layers={layers} referenceBases={referenceBases} uploadedVectors={uploadedVectors} vectorData={vectorData} activeTool={activeTool} mapMode={mapMode} zoom={zoom} minimapVisible={minimapVisible} />
      <LeftRail activePanel={activePanel} setActivePanel={setActivePanel} currentUser={currentUser} />
      <TopBar
        switcherOpen={switcherOpen}
        setSwitcherOpen={setSwitcherOpen}
        activeMap={activeMap}
        setActiveMap={setActiveMap}
        activeTool={activeTool}
        setActiveTool={setActiveTool}
        query={query}
        setQuery={setQuery}
        setActivePanel={setActivePanel}
      />
      <RightControls
        activeTool={activeTool}
        setActiveTool={setActiveTool}
        mapMode={mapMode}
        setMapMode={setMapMode}
        zoom={zoom}
        setZoom={setZoom}
        minimapVisible={minimapVisible}
        setMinimapVisible={setMinimapVisible}
        setActivePanel={setActivePanel}
      />
      <CoordinatesPanel mapMode={mapMode} zoom={zoom} activeTool={activeTool} />
      <SessionBadge currentUser={currentUser} setActivePanel={setActivePanel} />
      <FloatingPanel
        activePanel={activePanel}
        setActivePanel={setActivePanel}
        layers={layers}
        toggleLayer={toggleLayer}
        referenceBases={referenceBases}
        toggleReferenceBase={toggleReferenceBase}
        activeTool={activeTool}
        setActiveTool={setActiveTool}
        setMinimapVisible={setMinimapVisible}
        currentUser={currentUser}
        isAdmin={isAdmin}
        authNotice={authNotice}
        onLogin={handleLogin}
        onLogout={handleLogout}
        requireAdmin={requireAdmin}
        uploadedDataset={uploadedDataset}
        uploadedVectors={uploadedVectors}
        vectorData={vectorData}
        uploadError={uploadError}
        onUploadVectorFile={handleUploadVectorFile}
        publishUploadedDataset={publishUploadedDataset}
      />
      <MobileDock activeTool={activeTool} setActiveTool={setActiveTool} setActivePanel={setActivePanel} />
      <TutorialModal open={tutorialOpen} setOpen={setTutorialOpen} />
    </>
  );
}

createRoot(document.getElementById("root")).render(<App />);
