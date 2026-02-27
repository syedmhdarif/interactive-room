export interface Project {
  id: string;
  title: string;
  description: string;
  url: string;
  tags: string[];
}

export interface HotspotConfig {
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
  shape: 'box' | 'plane';
  label: string;
}

export interface SceneContextValue {
  isLocked: boolean;
  setIsLocked: (v: boolean) => void;
  showProjectList: boolean;
  setShowProjectList: (v: boolean) => void;
  nearHotspot: HotspotConfig | null;
  setNearHotspot: (h: HotspotConfig | null) => void;
}
