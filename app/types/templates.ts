export interface MemeTemplate {
  id: string;
  name: string;
  filename: string;
  type: string;
  tags: string[];
  width: number;
  height: number;
  boxCount: number;
  captions: string[];
  blank?: string;
  example?: string;
}
