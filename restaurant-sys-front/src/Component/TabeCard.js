import "./TabeCard.css";
import Cookies from "js-cookie";

export default function TabeCard(props) {
  const statusColor = props.status === "unviled" ? "green" : props.color;
  const userRole = localStorage.getItem("role") || Cookies.get("role");
  
  const handleClick = () => {
    if (props.onClick) {
      props.onClick();
    }
  };

  const deleteCard = (e) => {
    e.stopPropagation();
    if (props.ondelete) {
      props.ondelete();
    }
  };

  const handleQRClick = (e) => {
    e.stopPropagation();
    if (props.onQRClick) {
      props.onQRClick();
    }
  };

  return (
    <div className="Tablecard">
      <div className="bg">
        {userRole === "Manager" && (
          <button 
            className="qr-button" 
            onClick={handleQRClick}
            title="Show QR Code"
          >
            <i className="fas fa-qrcode"></i>
          </button>
        )}
        
        {props.showDelete !== false && (
          <button className="Deletebutton" onClick={deleteCard}>
            <svg viewBox="0 0 448 512" className="svgIcon">
              <path d="M135.2 17.7L128 32H32C14.3 32 0 46.3 0 64S14.3 96 32 96H416c17.7 0 32-14.3 32-32s-14.3-32-32-32H320l-7.2-14.3C307.4 6.8 296.3 0 284.2 0H163.8c-12.1 0-23.2 6.8-28.6 17.7zM416 128H32L53.2 467c1.6 25.3 22.6 45 47.9 45H346.9c25.3 0 46.3-19.7 47.9-45L416 128z"></path>
            </svg>
          </button>
        )}

        <h1>{props.number}</h1>
        <h4 style={{ color: statusColor }}>{props.status}</h4>
        <button className="button" data-text="Awesome" onClick={handleClick}>
          <span className="actual-text">&nbsp;Change&nbsp;</span>
          <span aria-hidden="true" className="hover-text">
            &nbsp;Change&nbsp;
          </span>
        </button>
      </div>
      <div className="blob" style={{ backgroundColor: statusColor }}></div>
    </div>
  );
}
