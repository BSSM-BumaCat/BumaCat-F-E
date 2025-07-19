import type { Product } from "./types/product.types";

const API_BASE = "https://localhost:8080"; // 서버 API 엔드포인트
const USE_SERVER = import.meta.env['VITE_SERVER'] === '1';

// 목데이터
const MOCK_PRODUCTS: Product[] = [
  {
    id: 1,
    name: "개멋진 초록색 자동차",
    price: 120000,
    imageUrl: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=400&h=300&fit=crop",
    description: "친환경 전기차로 조용하고 경제적입니다. 도심 주행에 최적화되어 있으며, 충전 한 번으로 300km 주행 가능합니다.",
    condition: "중고 - 상",
    donorName: "김환경",
    images: [
      "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1494976688994-7239c8e9d8a9?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1542362567-b07e54358753?w=400&h=300&fit=crop"
    ]
  },
  {
    id: 2,
    name: "반짝반짝 빛나는 자동차",
    price: 120000,
    imageUrl: "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=400&h=300&fit=crop",
    description: "고급 럭셔리 세단으로 부드러운 승차감과 우아한 디자인이 특징입니다. 내부 시설도 매우 깔끔합니다.",
    condition: "신품",
    donorName: "박럭셔리",
    images: [
      "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=400&h=300&fit=crop"
    ]
  },
  {
    id: 3,
    name: "도쿄 OOO 임대",
    price: 120000,
    imageUrl: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&h=300&fit=crop",
    description: "도심 중심가에 위치한 깔끔한 아파트입니다. 교통이 편리하고 주변 시설이 잘 되어 있습니다.",
    condition: "중고 - 중",
    donorName: "이부동산",
    images: [
      "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=400&h=300&fit=crop"
    ]
  },
  {
    id: 4,
    name: "튤립 팝니다. (노란색, 핑크색 ..",
    price: 120000,
    imageUrl: "https://images.unsplash.com/photo-1520763185298-1b434c919102?w=400&h=300&fit=crop",
    description: "봄꽃 튤립",
    images: [
      "https://images.unsplash.com/photo-1520763185298-1b434c919102?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1524386416438-98b9b2d4b433?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1463436294369-64659f0ce2f1?w=400&h=300&fit=crop"
    ]
  },
  {
    id: 5,
    name: "창의관 앞 기절했던 참새",
    price: 120000,
    imageUrl: "https://images.unsplash.com/photo-1551763345-31a4c5c3ca76?w=400&h=300&fit=crop",
    description: "귀여운 참새",
    images: [
      "https://images.unsplash.com/photo-1551763345-31a4c5c3ca76?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1553787151-6064db190d34?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1470093851219-69951fcbb533?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1520808663317-647b476c4c2c?w=400&h=300&fit=crop"
    ]
  },
  {
    id: 6,
    name: "코딩 10시간 해드려요",
    price: 120000,
    imageUrl: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=300&fit=crop",
    description: "프로그래밍 서비스",
    images: [
      "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=400&h=300&fit=crop"
    ]
  },
  {
    id: 7,
    name: "기숙사 왼쪽 침대 나눠줍니다.",
    price: 120000,
    imageUrl: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop",
    description: "기숙사 침대",
    images: [
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1540932239986-30128078f3c5?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1571508601136-ae88a2b7e765?w=400&h=300&fit=crop"
    ]
  },
  {
    id: 8,
    name: "AI로 만든 햄버거 (못먹음)",
    price: 120000,
    imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop",
    description: "인공지능 햄버거",
    images: [
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1550317138-10000687a72b?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1586816001966-79b736744398?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=400&h=300&fit=crop"
    ]
  },
  {
    id: 9,
    name: "35MM CO 카메라",
    price: 120000,
    imageUrl: "https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=400&h=300&fit=crop",
    description: "빈티지 필름카메라",
    images: [
      "https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&h=300&fit=crop"
    ]
  },
  {
    id: 10,
    name: "ON OFF 되는 카메라",
    price: 120000,
    imageUrl: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=400&h=300&fit=crop",
    description: "디지털 카메라",
    images: [
      "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400&h=300&fit=crop"
    ]
  },
  {
    id: 11,
    name: "스마트 워치 (나침반 기능 있음)",
    price: 120000,
    imageUrl: "https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=400&h=300&fit=crop",
    description: "GPS 스마트워치"
  },
  {
    id: 12,
    name: "관세 25% 면제",
    price: 120000,
    imageUrl: "https://images.unsplash.com/photo-1586771107445-d3ca888129ff?w=400&h=300&fit=crop",
    description: "면세 혜택"
  },
  {
    id: 13,
    name: "할머니의 깐깐 만두",
    price: 85000,
    imageUrl: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=400&h=300&fit=crop",
    description: "수제 만두"
  },
  {
    id: 14,
    name: "새 신발 (한번 신어봄)",
    price: 95000,
    imageUrl: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=300&fit=crop",
    description: "거의 새신발"
  },
  {
    id: 15,
    name: "집에서 기른 선인장",
    price: 35000,
    imageUrl: "https://images.unsplash.com/photo-1509587584298-0f3b3a3a1797?w=400&h=300&fit=crop",
    description: "미니 선인장"
  },
  {
    id: 16,
    name: "라면 끓이는 노하우",
    price: 15000,
    imageUrl: "https://images.unsplash.com/photo-1612556490533-c4d5c7adcf8e?w=400&h=300&fit=crop",
    description: "요리 비법"
  },
  {
    id: 17,
    name: "고양이 털 100개",
    price: 25000,
    imageUrl: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&h=300&fit=crop",
    description: "고양이 털모음"
  },
  {
    id: 18,
    name: "아이폰 13 (화면 깨짐)",
    price: 450000,
    imageUrl: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=300&fit=crop",
    description: "중고폰"
  },
  {
    id: 19,
    name: "책상 위 먼지",
    price: 5000,
    imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop",
    description: "역사적 먼지"
  },
  {
    id: 20,
    name: "커피 원두 (어제 갈아둠)",
    price: 45000,
    imageUrl: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=300&fit=crop",
    description: "원두커피"
  },
  {
    id: 21,
    name: "게임기 (조이콘 드리프트)",
    price: 280000,
    imageUrl: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=400&h=300&fit=crop",
    description: "닌텐도 스위치"
  },
  {
    id: 22,
    name: "강아지 울음소리 (WAV)",
    price: 12000,
    imageUrl: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&h=300&fit=crop",
    description: "사운드 파일"
  },
  {
    id: 23,
    name: "미완성 퍼즐 (98%)",
    price: 18000,
    imageUrl: "https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=400&h=300&fit=crop",
    description: "1000피스 퍼즐"
  },
  {
    id: 24,
    name: "우산 (바람 맞은 적 있음)",
    price: 8000,
    imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop",
    description: "접이식 우산"
  }
];

export async function fetchProducts(): Promise<Product[]> {
  if (!USE_SERVER) {
    // 목데이터 반환 (약간의 지연 시뮬레이션)
    await new Promise(resolve => setTimeout(resolve, 300));
    return MOCK_PRODUCTS;
  }
  
  const res = await fetch(API_BASE + "/products");
  if (!res.ok) throw new Error("상품 목록을 불러오지 못했습니다.");
  return res.json();
}

export async function addProduct(product: Omit<Product, "id">): Promise<Product> {
  if (!USE_SERVER) {
    // 목데이터에 추가 시뮬레이션
    await new Promise(resolve => setTimeout(resolve, 300));
    const newProduct = { ...product, id: Math.max(...MOCK_PRODUCTS.map(p => p.id)) + 1 };
    MOCK_PRODUCTS.push(newProduct);
    return newProduct;
  }
  
  const res = await fetch(API_BASE + "/products", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(product),
  });
  if (!res.ok) throw new Error("상품 추가에 실패했습니다.");
  return res.json();
}

export async function updateProduct(id: number, product: Omit<Product, "id">): Promise<Product> {
  if (!USE_SERVER) {
    // 목데이터 수정 시뮬레이션
    await new Promise(resolve => setTimeout(resolve, 300));
    const index = MOCK_PRODUCTS.findIndex(p => p.id === id);
    if (index === -1) throw new Error("상품을 찾을 수 없습니다.");
    const updatedProduct = { ...product, id };
    MOCK_PRODUCTS[index] = updatedProduct;
    return updatedProduct;
  }
  
  const res = await fetch(`${API_BASE}/products/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(product),
  });
  if (!res.ok) throw new Error("상품 수정에 실패했습니다.");
  return res.json();
}

export async function deleteProduct(id: number): Promise<void> {
  if (!USE_SERVER) {
    // 목데이터 삭제 시뮬레이션
    await new Promise(resolve => setTimeout(resolve, 300));
    const index = MOCK_PRODUCTS.findIndex(p => p.id === id);
    if (index === -1) throw new Error("상품을 찾을 수 없습니다.");
    MOCK_PRODUCTS.splice(index, 1);
    return;
  }
  
  const res = await fetch(`${API_BASE}/products/${id}`, {
    method: "DELETE" });
  if (!res.ok) throw new Error("상품 삭제에 실패했습니다.");
} 