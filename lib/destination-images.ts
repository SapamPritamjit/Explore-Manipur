const DESTINATION_IMAGE_MAP: Record<string, string> = {
  "Kangla Fort": "/images/kangla.png",
  "Kangla": "/images/kangla.png",
  "Shree Shree Govindajee Temple": "/images/govindajee.jpg",
  "Ima Market (Khwairamband Bazar)": "/images/ima-keithel.jpg",
  "Ima Keithel": "/images/ima-keithel.jpg",
  "Loktak Lake": "/images/loktak.jpg",
  "Keibul Lamjao National Park": "/images/keibul.jpg",
  "Red Hill (Lokpaching)": "/images/red-hill.png",
  "Khongjom War Memorial": "/images/khongjom.png",
  "Dzuko Valley": "/images/dzukou.jpg",
  "Dzükou Valley": "/images/dzukou.jpg",
  "Shirui Hills": "/images/shirui.jpg",
  "Tharon Cave": "/images/tharon.png",
  "INA Memorial": "/images/ina-memorial.png",
  "Andro": "/images/andro.jpeg",
  "Singju": "/images/singju.jpeg",
  "Chamthong (Kangshoi)": "/images/chamthong.jpeg",
  "Chamthong / Kangsoi": "/images/chamthong.jpeg",
  "Chak Hao Kheer": "/images/cha-khao-kheer.png",
  "Manipur Sangai Festival": "/images/sangai-festival.jpeg",
  "Sangai Festival": "/images/sangai-festival.jpeg",
  "Shirui Lily Festival": "/images/shirui-lily-festival.jpeg",
  "Moirang Lai Haraoba": "/images/lai-haraoba.jpeg",
  "Lai Haraoba": "/images/lai-haraoba.jpeg",
};

export function getDestinationImage(name: string): string | null {
  return DESTINATION_IMAGE_MAP[name] ?? null;
}
