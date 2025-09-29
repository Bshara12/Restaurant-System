import "./FoodCard.css";
import Cookies from "js-cookie";

export default function FoodCard({ food, onEdit, onDelete }) {
  const hasDiscount = food.discount !== 1;
  const discountedPrice = (food.price * food.discount).toFixed(2);
  const token = Cookies.get("authToken");
  const isLoggedIn = !!token;

  return (
    <div className="modern-food-card">
      <div className="food-image">
        <img src={food.image} alt={food.name} />
        {hasDiscount && (
          <span className="discount-badge">
            -{Math.round((1 - food.discount) * 100)}%
          </span>
        )}
      </div>
      <div className="food-content">
        <h2>{food.name}</h2>
        <p className="description">{food.discription}</p>
        <p className="category">📂 {food.category_name}</p>
        <div className="price-box">
          {hasDiscount ? (
            <>
              <span className="old-price">${food.price}</span>
              <span className="new-price">${discountedPrice}</span>
            </>
          ) : (
            <span className="new-price">${food.price}</span>
          )}
        </div>
        <p className="time">⏱ {food["time-to-make"]}</p>

        <div className="btn-group">
          {isLoggedIn ? (
            <>
              <button className="edit-btn" onClick={onEdit}>
                ✏️ Edit
              </button>
              <button className="delete-btn" onClick={onDelete}>
                🗑 Delete
              </button>
            </>
          ) : (
            <button className="add-to-cart">Add to Cart</button>
          )}
        </div>
      </div>
    </div>
  );
}
