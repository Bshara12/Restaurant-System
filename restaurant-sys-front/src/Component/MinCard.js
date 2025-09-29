import "./MainCard.css";

export default function MainCard(props) {
  const handleClick = () => {
    if (props.onClick) {
      props.onClick(); // استدعاء الدالة المخصصة عند الضغط
    }
  };

  return (
    <div className="min_card">
      <h2>{props.Name}</h2>

      {/* <i className="fa-solid fa-trash" onClick={handleClick}></i> */}

      <div className="hoverbutton" data-tooltip="click to delete">
        <div className="button-wrapper">
          <div className="text">delete</div>
          <span className="icon">
            <i className="fa-solid fa-trash" onClick={handleClick}></i>
          </span>
        </div>
      </div>
    </div>
  );
}
