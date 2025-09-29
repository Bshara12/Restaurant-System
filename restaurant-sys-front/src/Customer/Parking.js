import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Cookies from "js-cookie";
import jsQR from "jsqr";
import "./Customer.css";

export default function Parking() {
  const { customerId } = useParams();
  const navigate = useNavigate();
  const [restaurantName, setRestaurantName] = useState("مطعم الذواقة");
  const [showCamera, setShowCamera] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [carNumber, setCarNumber] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const streamRef = useRef(null);
  const scanIntervalRef = useRef(null);

  useEffect(() => {
    // Get restaurant name from localStorage
    const storedRestaurantName = localStorage.getItem('restaurantName');
    if (storedRestaurantName) {
      setRestaurantName(storedRestaurantName);
    }

    // Cleanup camera when component unmounts
    return () => {
      stopCamera();
      stopScanning();
    };
  }, []);

  const startScanning = () => {
    if (scanIntervalRef.current) return;
    
    setIsScanning(true);
    scanIntervalRef.current = setInterval(() => {
      scanForQR();
    }, 500); // Scan every 500ms
  };

  const stopScanning = () => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    setIsScanning(false);
  };

  const scanForQR = () => {
    if (videoRef.current && canvasRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const context = canvas.getContext('2d');
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      const qrCode = jsQR(imageData.data, imageData.width, imageData.height);
      
      if (qrCode) {
        console.log("QR Code detected from camera:", qrCode.data);
        
        // Extract car number from QR code data
        let extractedCarNumber = qrCode.data;
        
        // If QR contains more than just number, extract it
        if (extractedCarNumber.includes(':')) {
          extractedCarNumber = extractedCarNumber.split(':')[1];
        }
        
        // Clean up any non-numeric characters if needed
        extractedCarNumber = extractedCarNumber.replace(/\D/g, '');
        
        if (extractedCarNumber) {
          setCarNumber(extractedCarNumber);
          setShowConfirmation(true);
          stopCamera();
          stopScanning();
          toast.success("تم قراءة الباركود بنجاح!");
        }
      }
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment', // Use back camera on mobile
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setShowCamera(true);
        
        // Start scanning when video is ready
        videoRef.current.onloadedmetadata = () => {
          startScanning();
        };
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      toast.error("فشل في الوصول للكاميرا. تأكد من السماح بالوصول للكاميرا.");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    stopScanning();
    setShowCamera(false);
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const context = canvas.getContext('2d');
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0);
      
      // Convert to blob and process
      canvas.toBlob((blob) => {
        processQRCode(blob);
      }, 'image/jpeg', 0.8);
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      processQRCode(file);
    }
  };

  const processQRCode = async (imageBlob) => {
    setIsProcessing(true);
    
    try {
      // Convert blob to image
      const imageUrl = URL.createObjectURL(imageBlob);
      const img = new Image();
      
      img.onload = () => {
        // Create canvas to process the image
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        // Get image data
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        
        // Use jsQR to decode QR code
        const qrCode = jsQR(imageData.data, imageData.width, imageData.height);
        
        if (qrCode) {
          console.log("QR Code detected:", qrCode.data);
          
          // Extract car number from QR code data
          // Assuming QR code contains just the car number or in a specific format
          let extractedCarNumber = qrCode.data;
          
          // If QR contains more than just number, extract it
          // Example: if QR contains "CAR:1234" extract "1234"
          if (extractedCarNumber.includes(':')) {
            extractedCarNumber = extractedCarNumber.split(':')[1];
          }
          
          // Clean up any non-numeric characters if needed
          extractedCarNumber = extractedCarNumber.replace(/\D/g, '');
          
          if (extractedCarNumber) {
            setCarNumber(extractedCarNumber);
            setShowConfirmation(true);
            stopCamera();
            toast.success("تم قراءة الباركود بنجاح!");
          } else {
            toast.error("لم يتم العثور على رقم سيارة صالح في الباركود");
          }
        } else {
          toast.error("لم يتم العثور على باركود في الصورة. يرجى المحاولة مرة أخرى.");
        }
        
        // Clean up
        URL.revokeObjectURL(imageUrl);
        setIsProcessing(false);
      };
      
      img.onerror = () => {
        toast.error("فشل في تحميل الصورة");
        URL.revokeObjectURL(imageUrl);
        setIsProcessing(false);
      };
      
      img.src = imageUrl;
      
    } catch (error) {
      console.error("Error processing QR code:", error);
      toast.error("فشل في قراءة الباركود. يرجى المحاولة مرة أخرى.");
      setIsProcessing(false);
    }
  };

  const confirmCarRequest = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/Customer/GetMyCar/${carNumber}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        toast.success(`تم طلب إحضار السيارة رقم ${carNumber} بنجاح!`);
        setShowConfirmation(false);
        setCarNumber("");
        // Navigate back to main menu after success
        setTimeout(() => {
          navigate(`/${customerId}`);
        }, 2000);
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "فشل في طلب إحضار السيارة");
      }
    } catch (error) {
      console.error("Error requesting car:", error);
      toast.error("خطأ في الاتصال بالخادم");
    }
  };

  const goBackToMenu = () => {
    navigate(`/${customerId}`);
  };

  return (
    <div className="parking-page">
      <ToastContainer
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={true}
        pauseOnFocusLoss
        pauseOnHover
      />

      <div className="parking-header">
        <div className="parking-header-content">
          <div className="parking-logo-section">
            <img
              src={require("../Assets/logores2.png")}
              alt="Restaurant Logo"
              className="parking-logo"
            />
            <div className="parking-title-section">
              <button className="back-to-menu-btn" onClick={goBackToMenu}>
                <i className="fa-solid fa-arrow-right"></i>
              </button>
              <h1>
                <i className="fa-solid fa-car"></i>
                {restaurantName} - خدمة المركبات
              </h1>
            </div>
          </div>
          <div className="parking-info">
            <span className="parking-customer-id">العميل: {Cookies.get('customerId')}</span>
          </div>
        </div>
      </div>

      <div className="parking-content">
        {!showCamera && !showConfirmation && (
          <div className="parking-options">
            <div className="parking-welcome">
              <div className="parking-icon">
                <i className="fa-solid fa-car"></i>
              </div>
              <h2>خدمة إحضار المركبات</h2>
              <p>اختر طريقة قراءة الباركود لإحضار سيارتك</p>
            </div>

            <div className="qr-options">
              <button className="qr-option-btn camera-btn" onClick={startCamera}>
                <div className="option-icon">
                  <i className="fa-solid fa-camera"></i>
                </div>
                <div className="option-content">
                  <h3>تصوير الباركود</h3>
                  <p>استخدم الكاميرا لتصوير باركود السيارة</p>
                </div>
              </button>

              <button 
                className="qr-option-btn upload-btn" 
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="option-icon">
                  <i className="fa-solid fa-upload"></i>
                </div>
                <div className="option-content">
                  <h3>رفع صورة الباركود</h3>
                  <p>اختر صورة تحتوي على باركود السيارة</p>
                </div>
              </button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
            />
          </div>
        )}

        {showCamera && (
          <div className="camera-container">
            <div className="camera-header">
              <h3>
                <i className="fa-solid fa-camera"></i>
                {isScanning ? "جاري البحث عن الباركود..." : "وجه الكاميرا نحو الباركود"}
              </h3>
              <button className="close-camera-btn" onClick={stopCamera}>
                <i className="fa-solid fa-times"></i>
              </button>
            </div>
            
            <div className="camera-view">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="camera-video"
              />
              <div className="qr-overlay">
                <div className="qr-frame"></div>
              </div>
            </div>

            <div className="camera-controls">
              <div className="scanning-status">
                {isScanning ? (
                  <>
                    <div className="scanning-spinner"></div>
                    <span>جاري البحث التلقائي عن الباركود...</span>
                  </>
                ) : (
                  <span>ضع الباركود داخل الإطار</span>
                )}
              </div>
            </div>
          </div>
        )}

        {showConfirmation && (
          <div className="confirmation-container">
            <div className="confirmation-content">
              <div className="confirmation-icon">
                <i className="fa-solid fa-car"></i>
              </div>
              <h2>تأكيد طلب إحضار السيارة</h2>
              <div className="car-number-display">
                <span className="car-label">رقم السيارة:</span>
                <span className="car-number">{carNumber}</span>
              </div>
              <p>هل تريد إحضار السيارة ذات الرقم المذكور أعلاه؟</p>
              
              <div className="confirmation-buttons">
                <button 
                  className="cancel-btn" 
                  onClick={() => {
                    setShowConfirmation(false);
                    setCarNumber("");
                  }}
                >
                  إلغاء
                </button>
                <button className="confirm-btn" onClick={confirmCarRequest}>
                  <i className="fa-solid fa-check"></i>
                  تأكيد الطلب
                </button>
              </div>
            </div>
          </div>
        )}

        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </div>
    </div>
  );
}
