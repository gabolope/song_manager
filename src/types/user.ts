import {
  GiDrumKit,
  GiFlute,
  GiGrandPiano,
  GiGuitar,
  GiGuitarBassHead,
  GiLaptop,
  GiMicrophone,
  GiSaxophone,
  GiTambourine,
  GiViolin,
} from "react-icons/gi";
import { FaSlidersH } from "react-icons/fa";
import type { IconType } from "react-icons";

export type UserRole = "admin" | "musico";

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  avatar: string;
}

export interface Avatar {
  key: string;
  label: string;
  Icon: IconType;
}

export const AVATARS: Avatar[] = [
  { key: "guitar", label: "Guitarra", Icon: GiGuitar },
  { key: "bass", label: "Bajo", Icon: GiGuitarBassHead },
  { key: "piano", label: "Piano", Icon: GiGrandPiano },
  { key: "drums", label: "Batería", Icon: GiDrumKit },
  { key: "microphone", label: "Voz", Icon: GiMicrophone },
  { key: "saxophone", label: "Saxo", Icon: GiSaxophone },
  { key: "tambourine", label: "Pandereta", Icon: GiTambourine },
  { key: "violin", label: "Violín", Icon: GiViolin },
  { key: "flute", label: "Flauta", Icon: GiFlute },
  { key: "console", label: "Consola", Icon: FaSlidersH },
  { key: "pc", label: "PC", Icon: GiLaptop },
];

export function getAvatar(key: string | undefined): Avatar {
  return AVATARS.find((a) => a.key === key) ?? AVATARS[0];
}
