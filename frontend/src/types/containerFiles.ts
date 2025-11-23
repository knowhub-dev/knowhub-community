export type ContainerFileType = 'file' | 'directory';

export interface ContainerFileEntry {
  name: string;
  path: string;
  type: ContainerFileType;
  size?: number;
}
