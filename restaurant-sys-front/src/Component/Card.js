import React from "react";
import "./Card.css";

const Card = (props) => {
  const handleClick = () => {
    if (props.onClick) {
      props.onClick(); // استدعاء الدالة المخصصة عند الضغط
    }
  };

  return (
    <div className="card" onClick={handleClick}>
      <span />
      <div className="content">
        <h3>{props.Name}</h3>
        <div className="">
          <p>{props.Owner}</p>
        </div>
        <div className="">
          <p>{props.location}</p>
        </div>
      </div>
      <div className="icons"></div>
    </div>
  );
};

export default Card;