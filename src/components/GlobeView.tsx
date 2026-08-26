import { useEffect, useRef } from 'react';
import Globe, { type GlobeInstance } from 'globe.gl';
import type { MeshPhongMaterial } from 'three';
import type { PlayableCountry } from '../types';

const COLOR_LOCKED = '#3a4256';
const COLOR_LOCKED_HOVER = '#525d78';
const COLOR_UNLOCKED = '#22c55e';
const COLOR_UNLOCKED_HOVER = '#4ade80';
const COLOR_SELECTED = '#facc15';
const COLOR_STROKE = 'rgba(226, 232, 240, 0.45)';
const COLOR_SIDE = 'rgba(15, 20, 32, 0.85)';

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
      .atmosphereColor('#7dd3fc')
      .atmosphereAltitude(0.18)
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

    (globe.globeMaterial() as MeshPhongMaterial).color.set('#141a2b');

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
  const status = state.unlocked.has(d.cca3) ? '🔓 débloqué' : '🔒 verrouillé';
  return `<div class="globe-tooltip"><strong>${d.flag ?? ''} ${d.nameFr}</strong><br/>${status}</div>`;
}
