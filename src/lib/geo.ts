import { feature } from 'topojson-client';
import type { Topology, GeometryCollection } from 'topojson-specification';

import topology from '../data/countries-50m.json';
import countriesRaw from '../data/countries.json';
import type { Country, PlayableCountry } from '../types';

const countries = countriesRaw as Country[];

function normalizeNumericId(id: string): string {
  return String(Number(id));
}

export function loadPlayableCountries(): PlayableCountry[] {
  const topo = topology as unknown as Topology;
  const geo = feature(
    topo,
    topo.objects.countries as GeometryCollection,
  ) as unknown as GeoJSON.FeatureCollection;

  const byNumericId = new Map(countries.map((c) => [normalizeNumericId(c.ccn3), c]));

  const playable: PlayableCountry[] = [];
  for (const f of geo.features) {
    if (f.id == null || !f.geometry) continue;
    const country = byNumericId.get(normalizeNumericId(String(f.id)));
    if (!country) continue;
    playable.push({ ...country, geometry: f.geometry });
  }

  return playable.sort((a, b) => a.nameFr.localeCompare(b.nameFr, 'fr'));
}
