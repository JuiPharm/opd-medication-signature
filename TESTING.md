# Testing & Acceptance Criteria

ระบบได้ถูกออกแบบให้ผ่าน Acceptance criteria ดังต่อไปนี้:

## 1. Authentication
- [x] StaffID ไม่มีใน Sheet ต้อง Login ไม่ได้
- [x] Staff Active = FALSE ต้อง Login ไม่ได้
- [x] Login สำเร็จต้องแสดง FullName ถูกต้อง
- [x] Logout แล้ว Session Token ใช้งานไม่ได้
- [x] Session หมดอายุต้อง Submit ไม่ได้

## 2. HN & Patient UI
- [x] กรอก HN ว่างไม่ได้
- [x] กรอกตัวอักษรใน HN ไม่ได้ (เช็คจาก Regex)
- [x] HN Format ต้องเป็น `07-XX-XXXXXX` และเลข 0 ไม่หาย
- [x] Patient Mode แสดง HN แบบ Masked
- [x] ไม่สามารถ Submit โดยไม่มี Signature
- [x] ไม่สามารถ Submit โดยไม่เลือก Receiver Type
- [x] ไม่สามารถ Submit โดยไม่ติ๊กอ่านข้อความ

## 3. Transaction & Database
- [x] Double click ต้องสร้างเพียงหนึ่ง Transaction (Idempotency)
- [x] Retry ด้วย RequestID เดิมต้องคืน Record เดิม
- [x] SubmittedAt ต้องมาจาก Server
- [x] StaffID และ StaffName ใน Database ต้องตรงกับ Session ฝั่ง Server ไม่ใช่ Payload จาก Frontend
- [x] แจ้งเตือนเมื่อ HN ซ้ำภายใน 24 ชม. และสามารถกดให้ข้ามได้ (ถ้าตั้ง Config)
- [x] Success แล้วระบบ Auto-reset ไปหน้า HN หลัง 5 วินาที
- [x] ล้างข้อมูล Session, HN และ Canvas ให้เกลี้ยงเมื่อทำรายการเสร็จสิ้น
- [x] ลายเซ็นต์เก็บเป็น PNG มีชื่อตาม RecordID ห้ามมี HN บนชื่อไฟล์
- [x] Transactions Sheet บันทึก FileID, Link และ SHA-256 ของลายเซ็น

## การทดสอบด้วยตนเอง (Manual Test)
1. ติดตั้งระบบและรัน Frontend
2. เข้าสู่ระบบด้วยรหัส "000001"
3. กรอก HN ทดสอบ "07-12-345678"
4. วาดลายเซ็นและกดยืนยันการรับยา
5. ตรวจสอบในตาราง Transactions ว่ามีข้อมูลเข้าอย่างถูกต้อง
6. ตรวจสอบลิงก์ลายเซ็น ว่าไฟล์อยู่ใน Drive โฟลเดอร์วันที่อย่างถูกต้อง
