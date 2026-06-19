# Security Information

## 1. Authentication Risk (StaffID-only)
ระบบค่าเริ่มต้นออกแบบมาให้ Login ผ่าน StaffID อย่างเดียวเพื่อความรวดเร็ว ซึ่ง**ไม่ใช่ Strong Authentication** หากเป็นสภาพแวดล้อมที่เคร่งครัดเรื่องความปลอดภัย แนะนำให้แก้ไข Config `REQUIRE_PIN = TRUE` และตั้งค่า PIN Hash ให้กับเจ้าหน้าที่แต่ละคนก่อนใช้งานบน Production

## 2. Public Access Risk
- **GitHub Pages is Public**: โค้ด Frontend ที่โฮสต์บน GitHub Pages จะเข้าถึงได้โดยทุกคน ห้ามเก็บค่าความลับ (Secret Keys) ใดๆ ในโฟลเดอร์ `frontend/`
- **GAS Endpoint is Public**: API ปลายทางเปิดสิทธิ์ Anyone เพื่อให้สามารถเรียกใช้ผ่าน CORS ได้ ดังนั้นการเข้าถึงข้อมูลที่มีความอ่อนไหวจะต้องแนบ `sessionToken` เสมอ Backend มีหน้าที่ตรวจสอบสิทธิ์นี้
- **No Secrets in Frontend**: `GAS_WEB_APP_URL` ถือเป็น Endpoint ปกติและไม่ถือว่าเป็น Secret แต่ห้ามนำ Spreadsheet ID, Drive Folder ID ไปใส่ใน Frontend เด็ดขาด

## 3. Google Drive Permissions
- ไฟล์ลายเซ็น PNG จะถูกเก็บลงในโฟลเดอร์ที่ตั้งค่าไว้ 
- **อย่าเปลี่ยนสิทธิ์ไฟล์ให้เป็น Anyone with link** ระบบบันทึก File ID ลงใน Sheet เจ้าหน้าที่จะสามารถคลิกลิงก์เพื่อดูลายเซ็นได้ หากพวกเขาใช้ Google Account ที่แชร์โฟลเดอร์ให้แล้วเท่านั้น

## 4. Session Security
- ระบบจะ Generate Random Token (UUID) เมื่อเข้าสู่ระบบสำเร็จ
- Token จะถูกเก็บแค่ใน `sessionStorage` (จะหายไปเมื่อปิดแท็บ) และ Backend จะเก็บเพียง Token Hash ไว้
- ระบบมี Session Expiry อัตโนมัติ (เปลี่ยนจาก Active = TRUE เป็น FALSE)

## 5. Incident Response & Data Retention
- ระบบไม่ได้เก็บข้อมูลชื่อ-สกุลของผู้ป่วย จึงมีความเสี่ยงจากข้อมูลส่วนบุคคล (PDPA) ค่อนข้างต่ำ อย่างไรก็ตาม HN ถือเป็นข้อมูลอ่อนไหว จึงควรตั้งค่า Retention Policy ของ Google Workspace เพื่อลบข้อมูลที่เก่าเกินกำหนดและป้องกันพื้นที่เต็ม
- แนะนำให้ทำการ Backup ข้อมูล Spreadsheet และ Drive อย่างน้อยปีละครั้ง
