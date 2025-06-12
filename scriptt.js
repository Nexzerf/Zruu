// scriptt.js

let hasValidQR = false;

function openModal() {
  document.getElementById("donateModal").style.display = "block";
  clearDynamicContent();
  resetQRValidation();
}

function closeModal() {
  document.getElementById("donateModal").style.display = "none";
  clearDynamicContent();
  resetQRValidation();
}

function clearDynamicContent() {
  const container = document.getElementById("dynamicContent");
  container.innerHTML = "";
}

function resetQRValidation() {
  hasValidQR = false;
  const submitBtn = document.getElementById("submitBtn");
  const qrStatus = document.getElementById("qr-status");
  const fileNameDisplay = document.getElementById('file-name');
  const fileInput = document.getElementById('slipUpload');
  
  submitBtn.disabled = true;
  qrStatus.style.display = "none";
  fileNameDisplay.style.display = "none";
  fileInput.value = "";
}

// แสดง PromptPay QR (ใช้ API สร้าง QR Code)
function showPromptPay() {
  const container = document.getElementById("dynamicContent");
  
  // แสดงฟอร์มให้ใส่จำนวนเงินก่อน
  container.innerHTML = `
    <div class="amount-input-section">
      <h3>PromptPay</h3>
      <p class="amount-label">จำนวนเงินที่ต้องการจะโอน</p>
      <div class="amount-input-container">
        <input type="number" id="donateAmount" placeholder="0" min="0" class="amount-input" />
        <span class="currency">บาท</span>
      </div>
      <button onclick="generatePromptPayQR()" class="generate-qr-btn">
        <i class="fa-solid fa-qrcode"></i> สร้าง QR Code
      </button>
    </div>
  `;
}

// สร้าง QR Code จาก API
async function generatePromptPayQR() {
  const container = document.getElementById("dynamicContent");
  const promptpay = '0951386174'; // เบอร์ PromptPay ของคุณ
  const amountInput = document.getElementById('donateAmount');
  const amount = amountInput ? parseFloat(amountInput.value) || 0 : 0;
  
  // แสดง Loading
  container.innerHTML = `
    <div class="loading-container">
      <i class="fa-solid fa-spinner fa-spin loading-icon"></i>
      <p class="loading-text">กำลังสร้าง QR Code...</p>
    </div>
  `;
  
  try {
    const response = await fetch(`https://www.pp-qr.com/api/${promptpay}/${amount}`);
    
    if (response.ok) {
      const data = await response.json();
      container.innerHTML = `
        <div class="qr-result-container">
          <img src="${data.qrImage}" alt="PromptPay QR" class="qr-image" />
          <div class="qr-info">
            <p class="promptpay-number">เบอร์ PromptPay: ${promptpay}</p>
            ${amount > 0 ? 
              `<p class="amount-info amount-set">จำนวน: ${amount.toLocaleString()} บาท</p>` : 
              '<p class="amount-info amount-open">จำนวนเงิน: ให้ผู้โอนใส่เอง</p>'
            }
          </div>
          <button onclick="showPromptPay()" class="back-btn">
            <i class="fa-solid fa-arrow-left"></i> เปลี่ยนจำนวนเงิน
          </button>
        </div>
      `;
    } else {
      const errorData = await response.json();
      container.innerHTML = `
        <div class="error-container">
          <i class="fa-solid fa-exclamation-triangle error-icon"></i>
          <p class="error-text">${'โปรดระบุจำนวนเงินก่อนโอน' || 'ไม่สามารถสร้าง QR Code ได้'}</p>
          <button onclick="showPromptPay()" class="retry-btn">ลองใหม่</button>
        </div>
      `;
    }
  } catch (error) {
    console.error('Error creating QR code:', error);
    container.innerHTML = `
      <div class="error-container">
        <i class="fa-solid fa-exclamation-triangle error-icon"></i>
        <p class="error-text">เกิดข้อผิดพลาดในการเชื่อมต่อ</p>
        <p class="error-subtext">กรุณาลองใหม่อีกครั้ง</p>
        <button onclick="showPromptPay()" class="retry-btn">ลองใหม่</button>
      </div>
    `;
  }
}

// แสดงเลขบัญชีธนาคาร
function showKbankInfo() {
  const container = document.getElementById("dynamicContent");
  container.innerHTML = `
    <div class="bank-info-container">
      <div class="bank-header">
        <img src="assets/ksk.png" alt="Kasikorn Bank" class="bank-logo" />
        <h3>ธนาคารกสิกรไทย</h3>
      </div>
      <div class="bank-details">
        <p class="bank-detail-item">
          <i class="fa-solid fa-credit-card"></i>
          <span class="detail-label">เลขที่บัญชี:</span>
          <strong>1261900671</strong>
        </p>
        <p class="bank-detail-item">
          <i class="fa-solid fa-user"></i>
          <span class="detail-label">ชื่อบัญชี:</span>
          <strong>ภานิชา ศรีกระจ่าง</strong>
        </p>
        <p class="bank-detail-item">
          <i class="fa-solid fa-building-columns"></i>
          <span class="detail-label">ธนาคาร:</span>
          <strong>กสิกรไทย</strong>
        </p>
      </div>
    </div>
  `;
}

// ฟังก์ชันตรวจสอบ QR Code ในรูปภาพ
function validateQRCode(file) {
  return new Promise((resolve) => {
    const qrStatus = document.getElementById("qr-status");
    
    // แสดงสถานะกำลังตรวจสอบ
    qrStatus.innerHTML = `
      <i class="fa-solid fa-spinner qr-validation-spinner"></i>
      กำลังตรวจสอบ QR Code ในรูปภาพ...
    `;
    qrStatus.className = "qr-status validating";
    qrStatus.style.display = "block";

    const reader = new FileReader();
    reader.onload = function(e) {
      const img = new Image();
      img.onload = function() {
        // สร้าง canvas เพื่ออ่านข้อมูลรูปภาพ
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0, img.width, img.height);
        
        // ดึงข้อมูล image data
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        
        // ใช้ jsQR ตรวจสอบ QR Code
        const qrCode = jsQR(imageData.data, imageData.width, imageData.height);
        
        if (qrCode) {
          // พบ QR Code
          qrStatus.innerHTML = `
            <i class="fa-solid fa-check-circle"></i>
            ตรวจพบ QR Code ในรูปภาพ
          `;
          qrStatus.className = "qr-status valid";
          resolve(true);
        } else {
          // ไม่พบ QR Code
          qrStatus.innerHTML = `
            <i class="fa-solid fa-exclamation-triangle"></i>
            ไม่พบ QR Code ในรูปภาพ
            <div class="qr-details">กรุณาเลือกรูปสลิปที่มี QR Code ชัดเจน</div>
          `;
          qrStatus.className = "qr-status invalid";
          resolve(false);
        }
      };
      
      img.onerror = function() {
        qrStatus.innerHTML = `
          <i class="fa-solid fa-exclamation-triangle"></i>
          ไม่สามารถอ่านรูปภาพได้
          <div class="qr-details">กรุณาเลือกไฟล์รูปภาพที่ถูกต้อง</div>
        `;
        qrStatus.className = "qr-status invalid";
        resolve(false);
      };
      
      img.src = e.target.result;
    };
    
    reader.onerror = function() {
      qrStatus.innerHTML = `
        <i class="fa-solid fa-exclamation-triangle"></i>
        ไม่สามารถอ่านไฟล์ได้
      `;
      qrStatus.className = "qr-status invalid";
      resolve(false);
    };
    
    reader.readAsDataURL(file);
  });
}

function submitSlip() {
  const fileInput = document.getElementById("slipUpload");
  if (!fileInput.files.length) {
    alert("กรุณาแนบสลิปก่อนส่ง");
    return;
  }

  if (!hasValidQR) {
    alert("กรุณาแนบสลิปที่มี QR Code");
    return;
  }

  // เล่นเสียง
  const sound = document.getElementById("successSound");
  sound.play();

  // แสดง popup
  const popup = document.getElementById("successPopup");
  popup.style.display = "flex";

  // Auto-close
  setTimeout(() => {
    closePopup();
  }, 5000);
}

function closePopup() {
  const popup = document.getElementById("successPopup");
  popup.style.display = "none";
}

// Event listener สำหรับแสดงชื่อไฟล์และตรวจสอบ QR Code เมื่อมีการเลือกไฟล์
document.addEventListener('DOMContentLoaded', function() {
  const fileInput = document.getElementById('slipUpload');
  const fileNameDisplay = document.getElementById('file-name');
  const submitBtn = document.getElementById('submitBtn');
  
  fileInput.addEventListener('change', async function(event) {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      const fileName = file.name;
      
      // แสดงชื่อไฟล์
      fileNameDisplay.textContent = `📄 ไฟล์ที่เลือก: ${fileName}`;
      fileNameDisplay.style.display = 'block';
      
      // ตรวจสอบประเภทไฟล์
      if (!file.type.startsWith('image/')) {
        const qrStatus = document.getElementById("qr-status");
        qrStatus.innerHTML = `
          <i class="fa-solid fa-exclamation-triangle"></i>
          ❌ กรุณาเลือกไฟล์รูปภาพเท่านั้น
        `;
        qrStatus.className = "qr-status invalid";
        qrStatus.style.display = "block";
        hasValidQR = false;
        submitBtn.disabled = true;
        return;
      }
      
      // ตรวจสอบ QR Code
      hasValidQR = await validateQRCode(file);
      submitBtn.disabled = !hasValidQR;
      
    } else {
      fileNameDisplay.textContent = '';
      fileNameDisplay.style.display = 'none';
      
      const qrStatus = document.getElementById("qr-status");
      qrStatus.style.display = "none";
      
      hasValidQR = false;
      submitBtn.disabled = true;
    }
  });
});

function submitDonor() {
  const name = document.getElementById("donorName").value.trim() || "ผู้ไม่ประสงค์ออกนาม";
  const message = document.getElementById("donorMessage").value.trim() || "";

  const donorDiv = document.createElement("div");
  donorDiv.className = "donor";
  donorDiv.innerHTML = `<strong>${name}</strong><br/><small>${message}</small>`;

  document.getElementById("donors").prepend(donorDiv);
  document.getElementById("donorName").value = "";
  document.getElementById("donorMessage").value = "";

  closeModal();

  // Future: send data to backend or API
  // sendToAPI(name, message);
}

// Example API call
function sendToAPI(name, message) {
  fetch("https://your-backend-api.com/donations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, message })
  })
  .then(res => res.json())
  .then(data => console.log("Donor saved:", data))
  .catch(err => console.error("Error:", err));
}