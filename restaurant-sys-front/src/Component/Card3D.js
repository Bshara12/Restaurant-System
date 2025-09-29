import './Card3D.css'
export default function Card3D(props){
  const handleClick = () => {
    if (props.onClick) {
      props.onClick(); // استدعاء الدالة المخصصة عند الضغط
    }
  };
  return(
<div class="cards3D" onClick={handleClick}>
    <figure class="card3D">
        <figcaption class="card_title">{props.Name}</figcaption>
    </figure>
</div>
  );
}