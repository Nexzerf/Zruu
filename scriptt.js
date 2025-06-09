// script.js

function openModal() {
  document.getElementById("donateModal").style.display = "block";
}

function closeModal() {
  document.getElementById("donateModal").style.display = "none";
}

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

function openModal() {
  document.getElementById("donateModal").style.display = "block";
  clearDynamicContent();
}

function closeModal() {
  document.getElementById("donateModal").style.display = "none";
  clearDynamicContent();
}

function clearDynamicContent() {
  const container = document.getElementById("dynamicContent");
  container.innerHTML = "";
}

// แสดง PromptPay QR (แสดงรูป)
function showPromptPay() {
  const container = document.getElementById("dynamicContent");
  container.innerHTML = `
    <img src="assets/promptpay.jpg" alt="PromptPay QR" style="width:180px; border-radius:12px; box-shadow: 0 0 20px #3b82f6;" />
  `;
}


// แสดงเลขบัญชีธนาคาร
function showKbankInfo() {
  const container = document.getElementById("dynamicContent");
  container.innerHTML = `
    <div>
      <p>เลขที่บัญชี: <strong>1261900671</strong></p>
      <p>ชื่อบัญชี: <strong>ภานิชา ศรีกระจ่าง</strong></p>
      <p>ธนาคาร: <strong>กสิกรไทย</strong></p>
    </div>
  `;
}

function submitSlip() {
  const fileInput = document.getElementById("slipUpload");
  if (!fileInput.files.length) {
    alert("กรุณาแนบสลิปก่อนส่ง");
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

