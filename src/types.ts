export interface ScreenItem {
  id: string;
  title: string;
  category: string;
  description: string;
  imageUrl: string;
  aspectRatio?: 'mobile' | 'desktop' | 'square';
  tags: string[];
}

export type DeviceMode = 'mobile' | 'desktop' | 'grid';
