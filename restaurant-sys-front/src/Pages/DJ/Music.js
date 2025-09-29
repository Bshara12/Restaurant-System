import { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { motion } from "framer-motion";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Music() {
  const [musics, setMusics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPlayingId, setCurrentPlayingId] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMusicName, setNewMusicName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const token = Cookies.get("authToken");

  const fetchMusics = async () => {
    try {
      const res = await axios.get(
        "http://127.0.0.1:8000/api/Employee/GetallMusic",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const list = Array.isArray(res?.data?.musics) ? res.data.musics : [];
      setMusics(list);
      if (list.length > 0) {
        // أول عنصر يأخذ صيغة أن الأغنية تعمل
        setCurrentPlayingId((prev) => prev ?? list[0].id);
      }
    } catch (e) {
      setError("فشل في جلب قائمة الموسيقا");
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMusics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isPlaying = (id) => id === currentPlayingId;

  const deleteMusic = async (id) => {
    try {
      setDeletingId(id);
      await axios.delete(`http://127.0.0.1:8000/api/Employee/deleteMusic/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("تم حذف الأغنية");
      // تحديث القائمة
      setLoading(true);
      await fetchMusics();
      // إذا حذفنا الأغنية الحالية، أعد ضبط currentPlayingId إذا لم تعد موجودة
      if (currentPlayingId === id) {
        // سوف يتم ضبط أول عنصر تلقائياً في fetchMusics إن لم يكن currentPlayingId موجوداً
        setCurrentPlayingId(null);
      }
    } catch (err) {
      const msg = err?.response?.data?.message || "تعذر حذف هذه الأغنية";
      toast.error(msg);
      throw err;
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) return <div className="my_container">Loading musics...</div>;
  if (error) return <div className="my_container" style={{ color: "crimson" }}>{error}</div>;

  return (
    <div className="p-6" style={{ paddingLeft: "20px", width: "100vw", paddingRight: "10px" }}>
      <ToastContainer />
      <div className="" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h1 style={{ color: "orange", marginBottom: "15px", fontSize: "28px" }}>
          <i className="fa-solid fa-music" style={{ marginRight: 10 }} />
          Musics
        </h1>
        <motion.button
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.03, boxShadow: "0 8px 20px rgba(255,152,0,0.35)" }}
          onClick={() => setShowAddModal(true)}
          style={{
            backgroundColor: "#ff9800",
            color: "#fff",
            border: "none",
            padding: "10px 18px",
            borderRadius: 10,
            cursor: "pointer",
            fontWeight: 700,
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <motion.span
            initial={{ rotate: 0 }}
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut" }}
            style={{ display: "inline-block" }}
          >
            <i className="fa-solid fa-plus"></i>
          </motion.span>
          Add Music
        </motion.button>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
          gap: 20,
        }}
      >
        {musics.map((m) => {
          const playing = isPlaying(m.id);
          return (
            <div
              key={m.id}
              onClick={async () => {
                // عند التبديل من أغنية تعمل إلى أخرى: احذف القديمة أولاً
                if (!playing && currentPlayingId) {
                  try {
                    await deleteMusic(currentPlayingId);
                    setCurrentPlayingId(m.id);
                  } catch (_) {
                    // في حال الفشل، لا تغيّر الحالة
                  }
                } else {
                  setCurrentPlayingId(m.id);
                }
              }}
              style={{
                cursor: "pointer",
                borderRadius: 12,
                padding: 16,
                border: playing ? "2px solid #ff9800" : "1px solid #e0e0e0",
                boxShadow: playing
                  ? "0 6px 16px rgba(255,152,0,0.25)"
                  : "0 2px 8px rgba(0,0,0,0.08)",
                background: playing ? "#fffaf3" : "#fff",
                transition: "all 0.2s ease",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12, overflow: "hidden" }}>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 8,
                    background: playing ? "#ff9800" : "#eaeaea",
                    color: playing ? "#fff" : "#555",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 18,
                    flexShrink: 0,
                  }}
                >
                  <i className={`fa-solid ${playing ? "fa-pause" : "fa-play"}`}></i>
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 700, color: "#333", whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>
                    {m.name}
                  </div>
                  <div style={{ fontSize: 12, color: "#888" }}>ID: {m.id}</div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                {/* Equalizer animation when playing */}
                {playing ? (
                  <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 22 }}>
                    {[10, 18, 14].map((h, i) => (
                      <motion.div
                        key={i}
                        initial={{ height: h }}
                        animate={{ height: [10, 22, 8, 18, 12, 22, 10] }}
                        transition={{ duration: 1, repeat: Infinity, ease: "easeInOut", delay: i * 0.1 }}
                        style={{ width: 4, background: "#ff9800", borderRadius: 2 }}
                      />
                    ))}
                  </div>
                ) : (
                  <div style={{ width: 60, textAlign: "right", color: "#aaa", fontSize: 12 }}>Tap to play</div>
                )}

                {/* زر حذف مع أنيميشن */}
                <motion.button
                  title="Delete"
                  onClick={async (e) => {
                    e.stopPropagation();
                    await deleteMusic(m.id);
                  }}
                  disabled={deletingId === m.id}
                  whileHover={{ scale: 1.12, rotate: -5, backgroundColor: "rgba(229,57,53,0.08)" }}
                  whileTap={{ scale: 0.9 }}
                  animate={deletingId === m.id ? { rotate: 360 } : { rotate: 0 }}
                  transition={{ duration: deletingId === m.id ? 0.6 : 0.2, repeat: deletingId === m.id ? Infinity : 0, ease: "easeInOut" }}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: deletingId === m.id ? "#bbb" : "#e53935",
                    cursor: deletingId === m.id ? "not-allowed" : "pointer",
                    padding: 6,
                    borderRadius: 8,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <i className="fa-solid fa-trash"></i>
                </motion.button>
              </div>
            </div>
          );
        })}
      </div>

      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">Add New Music</h2>
            <div className="modal-body">
              <label>
                Name
                <input
                  type="text"
                  value={newMusicName}
                  onChange={(e) => setNewMusicName(e.target.value)}
                  placeholder="Enter music name"
                />
              </label>
            </div>
            <div className="modal-actions">
              <button className="cancel-btn" onClick={() => setShowAddModal(false)}>
                Cancel
              </button>
              <button
                className="edit-btn"
                disabled={submitting}
                onClick={async () => {
                  if (!newMusicName.trim()) {
                    toast.error("الرجاء إدخال اسم الأغنية");
                    return;
                  }
                  try {
                    setSubmitting(true);
                    await axios.post(
                      "http://127.0.0.1:8000/api/Employee/createMusicAsEmployee",
                      { name: newMusicName.trim() },
                      { headers: { Authorization: `Bearer ${token}` } }
                    );
                    toast.success("تمت إضافة الأغنية بنجاح");
                    setNewMusicName("");
                    setShowAddModal(false);
                    setLoading(true);
                    await fetchMusics();
                  } catch (err) {
                    const msg = err?.response?.data?.message || "فشل في إضافة الأغنية";
                    toast.error(msg);
                    console.error(err);
                  } finally {
                    setSubmitting(false);
                  }
                }}
              >
                {submitting ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
