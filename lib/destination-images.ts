const DESTINATION_IMAGE_MAP: Record<string, string> = {
  "Kangla Fort": "/images/kangla.png",
  "Shree Shree Govindajee Temple": "/images/govindajee.jpg",
  "Ima Market (Khwairamband Bazar)": "/images/ima-keithel.jpg",
  "Loktak Lake": "/images/loktak.jpg",
  "Keibul Lamjao National Park": "/images/keibul.jpg",
  "Red Hill (Lokpaching)": "/images/red-hill.png",
  "Khongjom War Memorial": "/images/khongjom.png",
  "Dzuko Valley": "/images/dzukou.jpg",
  "Shirui Hills": "/images/shirui.jpg",
  "Tharon Cave": "/images/tharon.png",
};

export function getDestinationImage(name: string): string | null {
  return DESTINATION_IMAGE_MAP[name] ?? null;
}
