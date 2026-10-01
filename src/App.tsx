import { useState } from "react";
import {
  Activity,
  AudioLines,
  ChevronRight,
  CircleHelp,
  Layers3,
  Lightbulb,
  Radio,
  RefreshCw,
  Search,
  Square,
  Play,
  SlidersHorizontal,
  Zap,
} from "lucide-react";
import { useDiscovery } from "./hooks/useDiscovery";
import { serviceKey } from "./mapper/discovery";
const tracks = [
  { name: "Audio", type: "fxaudio", icon: AudioLines, detail: "Sound & music" },
  {
    name: "Pixels",
    type: "fxpixel",
    icon: Layers3,
    detail: "LED & pixel effects",
  },
  { name: "Lighting", type: "fxdmx", icon: Lightbulb, detail: "DMX fixtures" },
  {
    name: "Triggers",
    type: "fxtrigger",
    icon: Zap,
    detail: "Events & signals",
  },
];
export default function App() {
  const { services, loading, error, updated, refresh } = useDiscovery();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [scale, setScale] = useState(10);
  const selectedService = services.find(
    (service) => serviceKey(service) === selected,
  );
  const visible = services.filter((service) =>
    `${service.name} ${service.service} ${service.host}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  );
  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <span className="brand-icon">
            <Activity size={22} />
          </span>
          fx<span>control</span>
        </div>
        <span className="divider" />
        <span className="workspace-label">Workspace</span>
        <span className="version">PREVIEW 01</span>
        <div className="connection">
          <i
            className={error ? "dot warning" : updated ? "dot" : "dot pending"}
          />
          {error
            ? "Discovery unavailable"
            : updated
              ? "Controller connected"
              : "Connecting to controller"}
        </div>
      </header>
      <main>
        <aside className="library">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">YOUR NETWORK</span>
              <h2>
                Services <span className="count">{services.length}</span>
              </h2>
            </div>
            <button
              className="icon-button"
              aria-label="Refresh discovery"
              disabled={loading}
              onClick={() => void refresh()}
            >
              <RefreshCw size={16} className={loading ? "spin" : ""} />
            </button>
          </div>
          <label className="search">
            <Search size={16} />
            <input
              aria-label="Search services"
              placeholder="Find a service…"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
          <div className="discovery-status" role="status">
            {loading
              ? "Fetching discovery snapshot…"
              : error
                ? "Connection needs attention"
                : "Discovered on your local network"}
          </div>
          {error && (
            <div className="error" role="alert">
              <strong>Can’t refresh services</strong>
              <p>{error}. Check that fxcontrol is running.</p>
              {updated && <p>Showing the last successful snapshot.</p>}
              <button onClick={() => void refresh()} disabled={loading}>
                Try again
              </button>
            </div>
          )}
          <div className="service-list">
            {visible.map((service) => (
              <button
                key={serviceKey(service)}
                className={`service-card ${selected === serviceKey(service) ? "selected" : ""}`}
                onClick={() => setSelected(serviceKey(service))}
              >
                <span className={`service-symbol ${service.service}`}>
                  <Radio size={19} />
                </span>
                <span>
                  <strong>{service.name}</strong>
                  <small>
                    {service.service} · {service.host}
                  </small>
                </span>
                <ChevronRight size={14} />
              </button>
            ))}
            {!loading && !error && services.length === 0 && (
              <div className="empty-services">
                <Radio size={30} />
                <h3>Waiting for your services</h3>
                <p>
                  Audio, pixels, lighting, and triggers will appear here when
                  fxcontrol discovers them.
                </p>
              </div>
            )}
            {query && visible.length === 0 && services.length > 0 && (
              <p className="muted">No services match “{query}”.</p>
            )}
          </div>
          <div className="library-footer">
            <i className="dot pending" />
            Refreshes every 30 seconds
            <p>Discovery indicates presence, not service health.</p>
          </div>
        </aside>
        <section className="workspace">
          <div className="workspace-heading">
            <div>
              <span className="eyebrow">SEQUENCE WORKSPACE</span>
              <h1>Your next great effect.</h1>
              <p>One timeline. Every part of the experience.</p>
            </div>
            <span className="badge">Workspace shell</span>
          </div>
          <div className="transport">
            <div className="transport-buttons">
              <button disabled aria-label="Play sequence">
                <Play size={17} />
              </button>
              <button disabled aria-label="Stop sequence">
                <Square size={15} />
              </button>
            </div>
            <div className="timecode">
              00:00<span>.000</span>
              <small>SECONDS / MILLISECONDS</small>
            </div>
            <div className="transport-end">
              <span>No sequence loaded</span>
              <button
                className="emergency"
                disabled
                title="Requires the future controller emergency-stop API"
              >
                <Square size={12} />
                Stop all
              </button>
            </div>
          </div>
          <div className="timeline-toolbar">
            <span>
              <Layers3 size={15} />
              Effect tracks <small>04</small>
            </span>
            <label>
              View{" "}
              <select
                aria-label="Timeline range"
                value={scale}
                onChange={(event) => setScale(Number(event.target.value))}
              >
                <option value={10}>10 seconds</option>
                <option value={30}>30 seconds</option>
                <option value={60}>60 seconds</option>
              </select>
            </label>
          </div>
          <div className="timeline-scroll">
            <div className="timeline">
              <div className="ruler-label">TRACK / TYPE</div>
              <div className="ruler">
                {Array.from({ length: 6 }, (_, index) => (
                  <span key={index}>{((index * scale) / 5).toFixed(0)}s</span>
                ))}
              </div>
              {tracks.map(({ name, type, icon: Icon, detail }, index) => (
                <div className="track" key={type}>
                  <div className="track-label">
                    <small>0{index + 1}</small>
                    <span className={`service-symbol ${type}`}>
                      <Icon size={19} />
                    </span>
                    <div>
                      <strong>{name}</strong>
                      <span>{detail}</span>
                    </div>
                  </div>
                  <div className={`track-lane lane-${type}`}>
                    <span>
                      {
                        services.filter((service) => service.service === type)
                          .length
                      }{" "}
                      discovered
                    </span>
                  </div>
                </div>
              ))}
              <div className="playhead" />
            </div>
          </div>
          <div className="canvas-empty">
            <div className="empty-icon">
              <AudioLines size={27} />
            </div>
            <h2>A space for everything to come together.</h2>
            <p>
              Discover your services now. Arranging effects and running
              <br className="desktop-break" /> sequences will arrive in the next
              stage.
            </p>
            <span className="coming">
              <span />
              TIMELINE EDITING · COMING NEXT
            </span>
          </div>
          <footer className="workspace-footer">
            <span>
              <CircleHelp size={14} />
              Playback and Stop all are unavailable in this preview.
            </span>
            <span>
              Timebase <strong>1 ms</strong>
            </span>
          </footer>
        </section>
        <aside className="inspector">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">DETAILS</span>
              <h2>Inspector</h2>
            </div>
            <SlidersHorizontal size={17} />
          </div>
          {selectedService ? (
            <>
              <div className="inspector-title">
                <span className={`service-symbol ${selectedService.service}`}>
                  <Radio size={22} />
                </span>
                <h3>{selectedService.name}</h3>
                <span className="badge">{selectedService.service}</span>
              </div>
              <dl>
                {Object.entries({
                  ID: selectedService.id,
                  Host: selectedService.host,
                  Port: selectedService.port,
                  API: selectedService.api,
                  Scheme: selectedService.scheme,
                  Path: selectedService.path,
                  Addresses:
                    selectedService.addresses.join(", ") || "Not advertised",
                }).map(([label, value]) => (
                  <div key={label}>
                    <dt>{label}</dt>
                    <dd>{value}</dd>
                  </div>
                ))}
              </dl>
              <p className="inspector-note">
                Advertised metadata only. Service health has not been checked.
              </p>
            </>
          ) : (
            <div className="inspector-empty">
              <SlidersHorizontal size={28} />
              <h3>
                {selected
                  ? "Service no longer discovered"
                  : "The details live here"}
              </h3>
              <p>Select a service to inspect its connection and API details.</p>
            </div>
          )}
          <div className="architecture-note">
            <span className="eyebrow">BUILT FOR THE SHOW</span>
            <p>
              Future playback will run on the controller, even when this browser
              disconnects.
            </p>
          </div>
        </aside>
      </main>
      <footer className="statusbar">
        <span>
          <Activity size={13} />
          FX SUITE <span className="status-separator">/</span> Local workspace
        </span>
        <span>
          {updated
            ? `Snapshot received ${updated.toLocaleTimeString()}`
            : "Awaiting discovery snapshot"}
        </span>
      </footer>
    </div>
  );
}
