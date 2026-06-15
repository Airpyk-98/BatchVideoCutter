import { create } from 'zustand';

export interface VideoCut {
  id: string;
  startTime: number;
  endTime: number;
  name: string;
}

export interface SelectedVideo {
  uri: string;
  name: string;
  type: string;
  size: number;
  cuts: VideoCut[];
}

interface VideoStore {
  videos: SelectedVideo[];
  addVideos: (newVideos: SelectedVideo[]) => void;
  removeVideo: (uri: string) => void;
  addCut: (videoUri: string, cut: VideoCut) => void;
  updateCut: (videoUri: string, cutId: string, updatedCut: Partial<VideoCut>) => void;
  removeCut: (videoUri: string, cutId: string) => void;
  clearAll: () => void;
}

export const useVideoStore = create<VideoStore>((set) => ({
  videos: [],
  addVideos: (newVideos) => set((state) => {
    const existingUris = state.videos.map(v => v.uri);
    const uniqueNew = newVideos.filter(v => !existingUris.includes(v.uri));
    return { videos: [...state.videos, ...uniqueNew] };
  }),
  removeVideo: (uri) => set((state) => ({
    videos: state.videos.filter((v) => v.uri !== uri)
  })),
  addCut: (videoUri, cut) => set((state) => ({
    videos: state.videos.map((v) => {
      if (v.uri === videoUri) {
        if (v.cuts.length >= 5) return v; // Max 5 cuts
        return { ...v, cuts: [...v.cuts, cut] };
      }
      return v;
    })
  })),
  updateCut: (videoUri, cutId, updatedCut) => set((state) => ({
    videos: state.videos.map((v) => {
      if (v.uri === videoUri) {
        return {
          ...v,
          cuts: v.cuts.map((c) => c.id === cutId ? { ...c, ...updatedCut } : c)
        };
      }
      return v;
    })
  })),
  removeCut: (videoUri, cutId) => set((state) => ({
    videos: state.videos.map((v) => {
      if (v.uri === videoUri) {
        return { ...v, cuts: v.cuts.filter((c) => c.id !== cutId) };
      }
      return v;
    })
  })),
  clearAll: () => set({ videos: [] }),
}));
