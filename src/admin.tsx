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