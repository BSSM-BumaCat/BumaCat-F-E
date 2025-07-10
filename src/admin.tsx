import type { Product } from "./Root";
import { useState, useEffect } from "react";
import { fetchProducts, addProduct, updateProduct, deleteProduct } from "./api";

const ADMIN_ID = "admin";
const ADMIN_PW = "summer123";

function Admin() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [id, setId] = useState("");
  const [pw, setPw] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<Omit<Product, "id">>({ name: "", price: 0, imageUrl: "", description: "" });
  const [announcement, setAnnouncement] = useState("");
  const [currentAnnouncement, setCurrentAnnouncement] = useState<string | null>(null);

  // 상품 목록 불러오기
  const loadProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchProducts();
      setProducts(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      loadProducts();
    }
  }, [isLoggedIn]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (id === ADMIN_ID && pw === ADMIN_PW) {
      setIsLoggedIn(true);
    } else {
      alert("관리자 정보가 올바르지 않습니다.");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: name === "price" ? Number(value) : value }));
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.imageUrl || !form.description || !form.price) return;
    setLoading(true);
    setError(null);
    try {
      await addProduct(form);
      setForm({ name: "", price: 0, imageUrl: "", description: "" });
      await loadProducts();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product: Product) => {
    setEditId(product.id);
    setForm({ name: product.name, price: product.price, imageUrl: product.imageUrl, description: product.description });
  };

  // 공지사항 관리
  const handleAnnouncementSubmit = () => {
    if (announcement.trim()) {
      setCurrentAnnouncement(announcement.trim());
      setAnnouncement("");
      // localStorage에 저장해서 새로고침해도 유지
      localStorage.setItem('announcement', announcement.trim());
      alert("공지사항이 등록되었습니다!");
    }
  };

  const handleAnnouncementClear = () => {
    setCurrentAnnouncement(null);
    localStorage.removeItem('announcement');
    alert("공지사항이 삭제되었습니다!");
  };

  // 페이지 로드 시 기존 공지사항 불러오기
  useEffect(() => {
    const savedAnnouncement = localStorage.getItem('announcement');
    if (savedAnnouncement) {
      setCurrentAnnouncement(savedAnnouncement);
    }
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editId === null) return;
    setLoading(true);
    setError(null);
    try {
      await updateProduct(editId, form);
      setEditId(null);
      setForm({ name: "", price: 0, imageUrl: "", description: "" });
      await loadProducts();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    setLoading(true);
    setError(null);
    try {
      await deleteProduct(id);
      await loadProducts();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-sky-100 via-cyan-100 to-emerald-100">
        <form onSubmit={handleLogin} className="bg-white/90 p-8 rounded-2xl shadow-xl flex flex-col gap-4 w-80">
          <h2 className="text-2xl font-bold text-center text-cyan-700 mb-2">관리자 로그인</h2>
          <input
            className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-300"
            placeholder="ID"
            value={id}
            onChange={e => setId(e.target.value)}
            autoFocus
          />
          <input
            className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-300"
            placeholder="Password"
            type="password"
            value={pw}
            onChange={e => setPw(e.target.value)}
          />
          <button className="bg-gradient-to-r from-sky-400 via-cyan-400 to-emerald-400 text-white font-semibold py-2 rounded-lg shadow hover:from-sky-500 hover:to-emerald-500 transition-all">로그인</button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 via-cyan-100 to-emerald-100 flex flex-col items-center py-12 px-4">
      <h1 className="text-3xl font-extrabold mb-8 tracking-tight select-none drop-shadow-xl text-cyan-700">부마켓 관리자</h1>
      
      {/* 공지사항 관리 섹션 */}
      <div className="bg-white/90 rounded-2xl shadow-lg p-6 mb-8 w-full max-w-xl">
        <h2 className="text-xl font-bold mb-4 text-cyan-700">📢 공지사항 관리</h2>
        {currentAnnouncement && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-blue-800">현재 공지사항:</span>
              <button 
                onClick={handleAnnouncementClear}
                className="text-red-500 hover:text-red-700 text-sm underline"
              >
                삭제
              </button>
            </div>
            <p className="text-blue-700 mt-1">{currentAnnouncement}</p>
          </div>
        )}
        <div className="flex gap-2">
          <input 
            className="flex-1 border rounded-lg px-3 py-2"
            placeholder="새 공지사항을 입력하세요..."
            value={announcement}
            onChange={(e) => setAnnouncement(e.target.value)}
          />
          <button 
            onClick={handleAnnouncementSubmit}
            className="bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold px-4 py-2 rounded-lg shadow hover:from-blue-600 hover:to-purple-600 transition-all whitespace-nowrap"
          >
            등록
          </button>
        </div>
      </div>

      <form onSubmit={editId === null ? handleAdd : handleUpdate} className="bg-white/90 rounded-2xl shadow-lg p-6 mb-8 flex flex-col gap-3 w-full max-w-xl">
        <h2 className="text-xl font-bold mb-2 text-cyan-700">{editId === null ? "상품 추가" : "상품 수정"}</h2>
        <input className="border rounded-lg px-3 py-2" name="name" placeholder="상품명" value={form.name} onChange={handleChange} />
        <input className="border rounded-lg px-3 py-2" name="price" type="number" placeholder="가격" value={form.price || ""} onChange={handleChange} />
        <input className="border rounded-lg px-3 py-2" name="imageUrl" placeholder="이미지 URL" value={form.imageUrl} onChange={handleChange} />
        <textarea className="border rounded-lg px-3 py-2" name="description" placeholder="설명" value={form.description} onChange={handleChange} />
        <button className="bg-gradient-to-r from-sky-400 via-cyan-400 to-emerald-400 text-white font-semibold py-2 rounded-lg shadow hover:from-sky-500 hover:to-emerald-500 transition-all">
          {editId === null ? "추가" : "수정 완료"}
        </button>
        {editId !== null && (
          <button type="button" className="text-cyan-500 underline mt-1" onClick={() => { setEditId(null); setForm({ name: "", price: 0, imageUrl: "", description: "" }); }}>
            취소
          </button>
        )}
      </form>
      {loading && <div className="mb-4 text-cyan-600">로딩 중...</div>}
      {error && <div className="mb-4 text-red-500">{error}</div>}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-8 w-full max-w-7xl">
        {products.map((product) => (
          <div key={product.id} className="bg-white/80 rounded-2xl shadow-md p-5 flex flex-col items-center border border-cyan-100">
            <img src={product.imageUrl} alt={product.name} className="object-cover w-full h-40 rounded-xl mb-3" />
            <h3 className="text-lg font-bold text-cyan-700 mb-1 text-center">{product.name}</h3>
            <p className="text-cyan-500 text-sm mb-2 text-center min-h-[32px]">{product.description}</p>
            <span className="text-base font-bold text-emerald-500 mb-2">{product.price.toLocaleString()}원</span>
            <div className="flex gap-2 mt-auto">
              <button className="px-3 py-1 rounded bg-cyan-400 text-white text-sm font-semibold hover:bg-cyan-500 transition" onClick={() => handleEdit(product)}>수정</button>
              <button className="px-3 py-1 rounded bg-red-400 text-white text-sm font-semibold hover:bg-red-500 transition" onClick={() => handleDelete(product.id)}>삭제</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Admin;