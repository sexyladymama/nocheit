import { useEffect, useRef } from 'react';
import Globe, { type GlobeInstance } from 'globe.gl';
import type { MeshPhongMaterial } from 'three';
import type { PlayableCountry } from '../types';

// Lofi Atlas palette — a globe at dusk. Kept as fixed hex (not CSS tokens):
// the WebGL scene is its own lit "golden hour" world, independent of the
// surrounding page's light/dark chrome.
const COLOR_LOCKED = '#5c4f6e';
const COLOR_LOCKED_HOVER = '#7a6b90';
const COLOR_UNLOCKED = '#f0a67d';
const COLOR_UNLOCKED_HOVER = '#f4bb9c';
const COLOR_SELECTED = '#f2c879';
const COLOR_STROKE = 'rgba(243, 233, 228, 0.35)';
const COLOR_SIDE = 'rgba(30, 20, 40, 0.9)';
const COLOR_OCEAN = '#332a47';
const COLOR_ATMOSPHERE = '#f0a67d';

interface GlobeViewProps {
  countries: PlayableCountry[];
  unlocked: Set<string>;
  selected: PlayableCountry | null;
  onSelectCountry: (country: PlayableCountry) => void;
  flyToToken: number;
}

export default function GlobeView({
  countries,
  unlocked,
  selected,
  onSelectCountry,
  flyToToken,
}: GlobeViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const globeRef = useRef<GlobeInstance | null>(null);
  const hoveredRef = useRef<PlayableCountry | null>(null);
  const stateRef = useRef({ unlocked, selected, onSelectCountry });
  stateRef.current = { unlocked, selected, onSelectCountry };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const globe = new Globe(container)
      .backgroundColor('rgba(0,0,0,0)')
      .showGlobe(true)
      .showAtmosphere(true)
      .atmosphereColor(COLOR_ATMOSPHERE)
      .atmosphereAltitude(0.22)
      .polygonGeoJsonGeometry((d) => (d as PlayableCountry).geometry as never)
      .polygonAltitude((d) => (d === hoveredRef.current ? 0.02 : 0.006))
      .polygonCapColor((d) => colorFor(d as PlayableCountry, stateRef.current, hoveredRef.current))
      .polygonSideColor(() => COLOR_SIDE)
      .polygonStrokeColor(() => COLOR_STROKE)
      .polygonLabel((d) => labelFor(d as PlayableCountry, stateRef.current))
      .polygonsTransitionDuration(200)
      .onPolygonHover((d) => {
        hoveredRef.current = (d as PlayableCountry) ?? null;
        globe.polygonAltitude((p) => (p === hoveredRef.current ? 0.02 : 0.006));
        globe.polygonCapColor((p) =>
          colorFor(p as PlayableCountry, stateRef.current, hoveredRef.current),
        );
      })
      .onPolygonClick((d) => {
        stateRef.current.onSelectCountry(d as PlayableCountry);
      });

    (globe.globeMaterial() as MeshPhongMaterial).color.set(COLOR_OCEAN);

    globe.pointOfView({ lat: 20, lng: 10, altitude: 2.4 });
    globe.controls().autoRotate = true;
    globe.controls().autoRotateSpeed = 0.35;
    globe.controls().enableZoom = true;
    globe.controls().minDistance = 150;
    globe.controls().maxDistance = 500;

    const handleResize = () => {
      globe.width(container.clientWidth);
      globe.height(container.clientHeight);
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    globeRef.current = globe;

    return () => {
      window.removeEventListener('resize', handleResize);
      container.replaceChildren();
      globeRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Push country data once loaded.
  useEffect(() => {
    globeRef.current?.polygonsData(countries);
  }, [countries]);

  // Recolor whenever lock state or selection changes.
  useEffect(() => {
    globeRef.current?.polygonCapColor((d) =>
      colorFor(d as PlayableCountry, { unlocked, selected }, hoveredRef.current),
    );
  }, [unlocked, selected, onSelectCountry]);

  // Fly to the selected/random country.
  useEffect(() => {
    if (!selected?.latlng || !globeRef.current) return;
    const [lat, lng] = selected.latlng;
    globeRef.current.controls().autoRotate = false;
    globeRef.current.pointOfView({ lat, lng, altitude: 1.6 }, 1200);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flyToToken]);

  return <div ref={containerRef} className="globe-container" />;
}

function colorFor(
  d: PlayableCountry,
  state: { unlocked: Set<string>; selected: PlayableCountry | null },
  hovered: PlayableCountry | null,
): string {
  if (!d) return COLOR_LOCKED;
  const isSelected = state.selected?.cca3 === d.cca3;
  const isUnlocked = state.unlocked.has(d.cca3);
  const isHovered = hovered?.cca3 === d.cca3;

  if (isSelected) return COLOR_SELECTED;
  if (isUnlocked) return isHovered ? COLOR_UNLOCKED_HOVER : COLOR_UNLOCKED;
  return isHovered ? COLOR_LOCKED_HOVER : COLOR_LOCKED;
}

function labelFor(
  d: PlayableCountry,
  state: { unlocked: Set<string> },
): string {
  const status = state.unlocked.has(d.cca3) ? 'Débloqué' : 'Verrouillé';
  return `<div class="globe-tooltip"><strong>${d.flag ?? ''} ${d.nameFr}</strong><br/>${status}</div>`;
}
