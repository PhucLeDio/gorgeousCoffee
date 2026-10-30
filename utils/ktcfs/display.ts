import type { ClassProbability, DiseaseLabel, ScanResult } from "./types";

export const LABEL_COLORS: Record<DiseaseLabel, string> = {
  Healthy: "#4CAF50",
  Rust: "#E65100",
  Corticium: "#EC407A",
  Mealy: "#8D6E63",
  Nematode: "#5E35B1",
  Anthracnose: "#212121",
  Miner: "#FBC02D",
  Phoma: "#1E88E5",
};

// Tuyến trùng là bệnh ở rễ, model chỉ nghi ngờ được qua lá.
export function displayName(item: Pick<ClassProbability, "label" | "name">) {
  if (item.label === "Nematode" && !/nghi/i.test(item.name)) {
    return `Nghi ngờ ${item.name.charAt(0).toLowerCase()}${item.name.slice(1)}`;
  }
  return item.name;
}

export function formatPercent(confidence: number) {
  return `${Math.round(confidence * 100)}%`;
}

export function formatDateTime(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(date.getHours())}:${pad(date.getMinutes())} ${pad(date.getDate())}/${pad(
    date.getMonth() + 1
  )}/${date.getFullYear()}`;
}

// Màu theo tình trạng cho người dùng: xanh = lá khỏe, đỏ = có bệnh, cam = chưa chắc chắn
export function statusOf(result: Pick<ScanResult, "is_disease" | "top2">) {
  if (result.top2) return { color: "#E65100", soft: "#FFF3E0", icon: "help-circle" as const };
  if (result.is_disease) return { color: "#C62828", soft: "#FDECEA", icon: "alert-circle" as const };
  return { color: "#2E7D32", soft: "#E8F5E9", icon: "checkmark-circle" as const };
}

export function statusTitle(result: ScanResult) {
  return result.top2 ? "Chưa chắc chắn" : displayName(result);
}
