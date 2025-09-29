import { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import "./AddFood.css";

export default function AddFood() {
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    discription: "",
    categories_id: "",
    time_to_make: "00:00:00",
    discount: 1,
    image: null,
  });

  const [categories, setCategories] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = Cookies.get("authToken");
    axios
      .get("http://127.0.0.1:8000/api/Manager/GetCategories", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setCategories(res.data))
      .catch((err) => console.error("Error fetching categories:", err));
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setFormData({ ...formData, [name]: files[0] });
      setPreview(URL.createObjectURL(files[0]));
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFormData({ ...formData, image: e.dataTransfer.files[0] });
      setPreview(URL.createObjectURL(e.dataTransfer.files[0]));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = Cookies.get("authToken");

    // Manual frontend validation (disable native to avoid unwanted popups)
    if (!formData.name || !formData.name.trim()) {
      toast.error("Please enter a food name");
      return;
    }
    if (!formData.price) {
      toast.error("Please enter a price");
      return;
    }
    if (!formData.discription || !formData.discription.trim()) {
      toast.error("Please enter a description");
      return;
    }
    if (!formData.categories_id) {
      toast.error("Please select a category");
      return;
    }
    // Frontend validation for required image
    if (!formData.image) {
      toast.error("Please upload an image");
      return;
    }

    const data = new FormData();
    data.append("name", formData.name);
    data.append("price", formData.price);
    data.append("discription", formData.discription);
    data.append("categories_id", formData.categories_id);
    // Ensure time complies with backend regex HH:MM:SS
    let normalizedTime = formData.time_to_make;
    // If empty, default to 00:00:00 to avoid browser required popup and satisfy backend regex
    if (!normalizedTime) {
      normalizedTime = "00:00:00";
    } else if (/^\d{2}:\d{2}$/.test(normalizedTime)) {
      // If user selected HH:MM (no seconds), append :00
      normalizedTime = `${normalizedTime}:00`;
    }
    data.append("time-to-make", normalizedTime);
    data.append("discount", formData.discount);
    data.append("image", formData.image);

    // طباعة البيانات في الكونسول قبل الإرسال
    for (let pair of data.entries()) {
      console.log(pair[0] + ": ", pair[1]);
    }

    try {
      await axios.post("http://127.0.0.1:8000/api/CreateFood", data, {
        headers: {
          Authorization: `Bearer ${token}`,
          // Let the browser/axios set the multipart boundary automatically
        },
      });
      toast.success("Food added successfully!");
      navigate("/Manager/dashborad/Food");
    } catch (err) {
      // Show backend validation errors if present
      if (err?.response?.status === 422 && err.response.data?.errors) {
        const errors = err.response.data.errors;
        const firstField = Object.keys(errors)[0];
        const firstMessage = Array.isArray(errors[firstField])
          ? errors[firstField][0]
          : String(errors[firstField]);
        toast.error(firstMessage || "Validation error (422)");
        console.error("Validation errors:", errors);
      } else if (err?.response?.data?.message) {
        toast.error(err.response.data.message);
      } else {
        toast.error("Error adding food");
      }
      console.error(err);
    }
  };

  return (
    <div className="containercenter">
      <div className="addfood-container">
        <h2 className="addfood-title">🍽️ Add New Food</h2>
        <form onSubmit={handleSubmit} className="addfood-form" noValidate>
          <input
            type="text"
            name="name"
            placeholder="Food Name"
            value={formData.name}
            onChange={handleChange}
            required
            className="form-input"
          />
          <input
            type="number"
            name="price"
            placeholder="Price"
            value={formData.price}
            onChange={handleChange}
            required
            className="form-input"
          />
          <textarea
            name="discription"
            placeholder="Description"
            value={formData.discription}
            onChange={handleChange}
            required
            className="form-input"
            rows="3"
          />
          <select
            name="categories_id"
            value={formData.categories_id}
            onChange={handleChange}
            required
            className="form-input"
          >
            <option value="">Select Category</option>
            {categories.map((cat) => (
              <option key={cat.category.id} value={cat.category.id}>
                {cat.category.name}
              </option>
            ))}
          </select>
          <input
            type="time"
            name="time_to_make"
            value={formData.time_to_make}
            onChange={handleChange}
            className="form-input"
            step="1"
            lang="en-GB"
          />

          <div
            className={`drag-drop ${dragActive ? "active" : ""}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => document.getElementById("fileInput").click()}
          >
            {preview ? (
              <img src={preview} alt="Preview" className="image-preview" />
            ) : (
              <p className="drag-text">
                Drag & Drop an image here or <span>browse</span>
              </p>
            )}
            <input
              type="file"
              id="fileInput"
              name="image"
              accept="image/*"
              style={{ display: "none" }}
              required
              onChange={handleChange}
            />
          </div>

          <button type="submit" className="submit-btn">
            + Add Food
          </button>
        </form>
      </div>
    </div>
  );
}
