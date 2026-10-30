// Kiểu dữ liệu của API di động KTCFS.

export type Garden = {
  polygon_id: string;
  commune_id: string;
  commune_name: string;
  area_ha: number;
  center?: { lat: number; lon: number };
};

export type KtcfsUser = {
  user_id: number;
  full_name: string;
  phone: string;
  email?: string;
  role: string;
  commune_id: string;
  commune_name: string;
  garden_count: number;
  // Cán bộ xã không có danh sách vườn: chụp được mọi vườn trong xã.
  gardens?: Garden[];
};

export type TokenPair = {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  session_id: string;
};

export type LoginResponse = TokenPair & { user: KtcfsUser };

export type DiseaseLabel =
  | "Healthy"
  | "Rust"
  | "Corticium"
  | "Mealy"
  | "Nematode"
  | "Anthracnose"
  | "Miner"
  | "Phoma";

export type ClassProbability = {
  label: DiseaseLabel;
  name: string;
  is_disease: boolean;
  confidence: number;
};

export type ScanResult = ClassProbability & {
  is_uncertain: boolean;
  // Khác null nghĩa là chưa chắc chắn: phải hiện cả hai khả năng.
  top2: ClassProbability | null;
  note: string;
  check: string;
  advice: string;
  probabilities: ClassProbability[];
  // xyxy theo điểm ảnh trên ảnh đã xoay đúng chiều, kích thước image_size.
  boxes: { xyxy: [number, number, number, number]; conf: number }[];
  image_size: { width: number; height: number };
};

export type Scan = {
  scan_id: string;
  created_at: string;
  captured_at: string;
  status: string;
  location: { lat: number; lon: number; accuracy_m: number };
  garden: (Garden & { distance_m: number }) | null;
  result: ScanResult;
  recorded_on_map: boolean;
  model_version: string;
  image_path: string;
};

export type ScanPage = { items: Scan[]; next_before: string | null };

export type Disease = {
  label: DiseaseLabel;
  name: string;
  is_disease?: boolean;
  check?: string;
  advice?: string;
};
