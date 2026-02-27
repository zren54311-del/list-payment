import React, { useState, useEffect } from "react";
import axios from "axios";
import QRCode from "qrcode.react";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";

export default function Dashboard() {
  const [merchant, setMerchant] = useState(null);
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({ name: "", price: "" });
  const [paymentLink, setPaymentLink] = useState([]);

  // Check session
  useEffect(() => {
    const saved = localStorage.getItem("merchant");
    if (saved) setMerchant(JSON.parse(saved));
  }, []);

  // Load products
  useEffect(() => {
    if (!merchant) return;
    axios.get(`/.netlify/functions/functions?fn=getProducts&merchantId=${merchant.id}`)
      .then(res => setProducts(res.data.products));
  }, [merchant]);

  const addProduct = async () => {
    if (!newProduct.name || !newProduct.price) return;
    const res = await axios.post("/.netlify/functions/functions?fn=addProduct", {
      merchantId: merchant.id,
      name: newProduct.name,
      price: Number(newProduct.price)
    });
    setProducts([...products, res.data.product]);
    setNewProduct({ name: "", price: "" });
  };

  const createPayment = async (product, method) => {
    const res = await axios.post("/.netlify/functions/functions?fn=createPayment", {
      merchantId: merchant.id,
      amount: product.price,
      method,
      productName: product.name
    });
    setPaymentLink([...paymentLink, res.data.paymentLink]);
  };

  const handleLogout = () => {
    localStorage.removeItem("merchant");
    setMerchant(null);
  };

  if (!merchant) return (
    <div style={{ padding: 24 }}>
      <h1>Merchant Dashboard Login / Register</h1>
      <LoginForm setMerchant={setMerchant} />
      <RegisterForm setMerchant={setMerchant} />
    </div>
  );

  const ProductCard = ({ product }) => {
    const [method, setMethod] = useState("qris");
    const [link, setLink] = useState("");

    const handlePay = async () => {
      await createPayment(product, method);
      setLink(`/.netlify/functions/functions?fn=createPayment&product=${product.name}&method=${method}`);
    };

    return (
      <div style={styles.card}>
        <div style={styles.shimmer}></div>
        <h2 style={styles.title}>{product.name}</h2>
        <p style={styles.price}>Rp {product.price}</p>
        <select style={styles.select} value={method} onChange={e => setMethod(e.target.value)}>
          <option value="qris">QRIS</option>
          <option value="gopay">GOPAY</option>
          <option value="dana">DANA</option>
          <option value="ovo">OVO</option>
        </select>
        <button style={styles.button} onClick={handlePay}>Bayar Sekarang</button>
        {link && (
          <div style={styles.qrContainer}>
            <QRCode value={link} size={120} />
            <a href={link} target="_blank" style={styles.link}>Klik / Scan</a>
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={styles.container}>
      <button onClick={handleLogout} style={{ ...styles.button, background: "#ef4444", marginBottom: 20 }}>Logout</button>
      <h1 style={styles.header}>✨ {merchant.username} Dashboard ✨</h1>

      <div style={styles.addProduct}>
        <input type="text" placeholder="Nama Produk" style={styles.input}
          value={newProduct.name} onChange={e => setNewProduct({ ...newProduct, name: e.target.value })} />
        <input type="number" placeholder="Harga" style={styles.input}
          value={newProduct.price} onChange={e => setNewProduct({ ...newProduct, price: e.target.value })} />
        <button style={styles.button} onClick={addProduct}>Tambah Produk</button>
      </div>

      <div style={styles.grid}>
        {products.map(p => (
          <div key={p.id}>
            <ProductCard product={p} />
            <p style={styles.battleText}>{merchant.username} vs kalsNotDev</p>
          </div>
        ))}
      </div>

      {paymentLink.map((ln, idx) => (
        <div key={idx} style={styles.paymentSection}>
          <a href={ln} target="_blank" style={styles.link}>Scan/Klik untuk bayar</a>
        </div>
      ))}

      <footer style={styles.footer}>
        Powered By <span style={styles.footerShimmer}>kalsNotDev 🖐</span>
      </footer>
    </div>
  );
}

// CSS-in-JS styles
const styles = {
  container: { padding: 24, fontFamily: "Inter,sans-serif", position: "relative" },
  header: { textAlign: "center", fontSize: 24, fontWeight: "bold", color: "#7c3aed", marginBottom: 24 },
  addProduct: { margin: "20px auto", padding: 16, background: "rgba(255,255,255,0.8)", borderRadius: 12 },
  input: { width: "100%", padding: 8, margin: "6px 0", border: "1px solid #ddd", borderRadius: 8 },
  button: { padding: 10, background: "#7c3aed", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer" },
  grid: { display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))" },
  card: { background: "white", padding: 16, borderRadius: 8, boxShadow: "0 2px 10px rgba(0,0,0,0.1)", position: "relative" },
  shimmer: { height: 4, background: "linear-gradient(to right,#a78bfa,#60a5fa,#f472b6)", marginBottom: 8 },
  title: { fontSize: 18, fontWeight: "bold", color: "#7c3aed" },
  price: { marginBottom: 8, color: "#374151" },
  select: { width: "100%", padding: 8, borderRadius: 8, border: "1px solid #ddd", marginBottom: 8 },
  qrContainer: { textAlign: "center" },
  link: { color: "#1d4ed8", textDecoration: "underline" },
  battleText: { textAlign: "center", fontWeight: "bold", color: "#7c3aed" },
  paymentSection: { marginTop: 10, textAlign: "center" },
  footer: { textAlign: "center", marginTop: 30, color: "#555" },
  footerShimmer: { background: "linear-gradient(90deg,#fff,#8b5cf6,#fff)", WebkitBackgroundClip: "text", color: "transparent" }
};
