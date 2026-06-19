# Deployment Guide

เนื่องจากระบบนี้ใช้ Google Apps Script เป็น Backend คุณจำเป็นต้อง Deploy Backend ก่อนเพื่อนำ URL มาเชื่อมต่อกับ Frontend

## 1. การ Deploy Backend (Google Apps Script)

### ทางเลือกที่ 1: Deploy แบบแมนนวล (ง่ายที่สุด ไม่ต้องใช้ Node.js)
1. ไปที่ [script.google.com](https://script.google.com/) และสร้างโปรเจกต์ใหม่
2. คัดลอกโค้ดทั้งหมดจากโฟลเดอร์ `gas/` ใน Repository นี้ ไปวางในหน้า Editor ทีละไฟล์ (สร้างไฟล์ใหม่ตามชื่อเดิม เช่น `Code.gs`, `Router.gs`)
3. ในหน้า Editor เลือกเมนู **Run** -> **setupSystem**
4. ระบบจะแจ้งขอสิทธิ์ (Authorization Required) ให้กดยอมรับสิทธิ์ทั้งหมด
5. รอจนกระทั่งมีหน้าต่างแจ้งว่า "Setup Completed Successfully."
6. ไปที่ Google Drive ของคุณ จะพบ Spreadsheet ที่สร้างใหม่และโฟลเดอร์ `OPD Medication Signatures`
7. ที่หน้า Apps Script Editor เลือกปุ่ม **Deploy** (ขวาบน) -> **New deployment**
8. เลือก Select type -> **Web app**
   - Description: `v1.0`
   - Execute as: **Me**
   - Who has access: **Anyone**
9. กด **Deploy** และคัดลอก **Web app URL** เก็บไว้

### ทางเลือกที่ 2: Deploy ผ่าน Clasp (ต้องการ Node.js)
1. ติดตั้ง Node.js และ Clasp:
   ```bash
   npm install -g @google/clasp
   ```
2. Login เข้าสู่ Google:
   ```bash
   clasp login
   ```
3. สร้างโปรเจกต์:
   ```bash
   cd gas
   clasp create --type webapp --title "OPD Medication Signature"
   ```
4. Push โค้ด:
   ```bash
   clasp push
   ```
5. เปิดหน้า Editor เพื่อรัน `setupSystem()` ครั้งแรก:
   ```bash
   clasp open
   ```
   และทำตามขั้นตอนทางเลือกที่ 1 (ข้อ 3-9)

---

## 2. การตั้งค่า GitHub Secrets (สำหรับ CI/CD - ข้ามได้หาก Deploy Frontend ด้วยวิธีอื่น)

หากใช้ GitHub Actions สำหรับ Clasp deployment:
- `CLASPRC_JSON`: ค่าจากไฟล์ `~/.clasprc.json` (คำเตือน: Refresh Token เป็นข้อมูลสำคัญ ห้ามเผยแพร่)
- `CLASP_JSON`: ค่าจากไฟล์ `.clasp.json` (ต้องมี scriptId)

---

## 3. การ Deploy Frontend (GitHub Pages)

1. นำ URL ที่ได้จากการ Deploy Backend มาใส่ในไฟล์ `frontend/config.js`:
   ```javascript
   const CONFIG = {
       GAS_WEB_APP_URL: "https://script.google.com/macros/s/YOUR_ID/exec"
   };
   ```
2. ทำการ Push โค้ดทั้งหมด (รวม `frontend/config.js`) ขึ้นไปยัง GitHub Repository ของคุณ
   *(หมายเหตุ: แนะนำให้เพิ่ม URL นี้ผ่าน Repository Variables หรือ Secrets โดยใช้ GitHub Actions แทนการ Commit ตรงๆ หากต้องการความเป็นส่วนตัว แม้ URL จะเป็น Public Endpoint ก็ตาม)*
3. ไปที่แท็บ **Settings** > **Pages**
4. ตรงส่วน Source เลือก **Deploy from a branch**
5. เลือก Branch `main` และโฟลเดอร์ `/frontend` (หรือ root ขึ้นอยู่กับการจัดเก็บของคุณ)
6. กด **Save** และรอประมาณ 1-2 นาที คุณจะได้ URL สำหรับใช้งานบน Tablet

### การ Deploy ด้วย GitHub Actions (อัตโนมัติ)
1. สร้างตัวแปรใน Repo: Settings > Secrets and variables > Actions > Variables
2. สร้าง Variable ชื่อ `GAS_WEB_APP_URL` และใส่ URL ของ Web App
3. เมื่อ Push โค้ดเข้า `main` ไฟล์ `.github/workflows/pages.yml` จะอ่านค่านี้และสร้าง `config.js` ให้ก่อน Deploy ขึ้น Pages โดยอัตโนมัติ
