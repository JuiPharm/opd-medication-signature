# ระบบลงนามรับยา OPD (OPD Medication Signature System)

ระบบสำหรับเภสัชกรและผู้ป่วยในการลงนามรับยาที่ช่องจ่ายยาผู้ป่วยนอก (OPD) โดยใช้ Google Apps Script เป็น Backend API และ Google Sheets เป็น Database เพื่อลดการใช้กระดาษและบันทึกหลักฐานการจ่ายยาในรูปแบบดิจิทัล

## ภาพรวมระบบ (Architecture)
- **Frontend**: หน้าเว็บ HTML/CSS/JS (Vanilla) สามารถใช้งานได้บน Tablet 
- **Backend API**: Google Apps Script (GAS) Web App
- **Database**: Google Sheets (ตาราง Staff, Transactions, Sessions, AuditLog, Config)
- **Storage**: Google Drive (เก็บไฟล์ลายเซ็น PNG แยกตาม YYYY/MM/DD)

## Repository Structure
```
frontend/          - โค้ดส่วนหน้าเว็บ (HTML, CSS, JS)
gas/               - โค้ดส่วน Backend (Google Apps Script .gs)
tests/             - (สำหรับเก็บไฟล์ทดสอบ)
.github/workflows/ - ไฟล์ตั้งค่า GitHub Actions สำหรับ Deploy
```

## Local Development
คุณสามารถเปิดไฟล์ `frontend/index.html` บน Browser เพื่อทดสอบหน้าตาของ UI ได้ทันที แต่ระบบจะยังไม่สามารถทำงานได้สมบูรณ์จนกว่าจะใส่ `GAS_WEB_APP_URL` ลงใน `frontend/config.js`

## Config
ตั้งค่าระบบผ่าน Sheet `Config`
- `APP_NAME`: ชื่อระบบ
- `HN_REGEX`: Regular Expression สำหรับตรวจสอบ HN (ค่าเริ่มต้น `^07-[0-9]{2}-[0-9]{6}$`)
- `SESSION_TTL_MINUTES`: อายุของ Session (นาที)
- `DUPLICATE_WINDOW_HOURS`: ช่วงเวลาที่ตรวจสอบการรับยาซ้ำ (ชั่วโมง)
- `REQUIRE_PIN`: เปิดใช้ PIN ในการ Login หรือไม่ (`TRUE`/`FALSE`)

## การจัดการบุคลากร (Staff)
- **วิธีเพิ่ม Staff**: เพิ่มแถวใหม่ใน Sheet `Staff` (คอลัมน์ A ต้องเป็นรูปแบบ Text เสมอ เช่น `000001`) และติ๊ก `TRUE` ที่คอลัมน์ Active
- **วิธีปิด Staff**: นำเครื่องหมายติ๊กออกที่คอลัมน์ Active หรือเปลี่ยนค่าเป็น `FALSE`
- **วิธีเปิด REQUIRE_PIN**: ใส่รหัส Hash (SHA-256) ของ PIN ลงในคอลัมน์ `PINHash` และเปลี่ยน Config `REQUIRE_PIN` เป็น `TRUE`

## วิธีใช้งาน
- **ค้นหารายการ**: ไปที่ Sheet `Transactions` สามารถ Filter หรือค้นหาตาม HN, วันที่, หรือ Record ID
- **เปิดลายเซ็น**: คลิกลิงก์ที่คอลัมน์ `SignatureLink` ใน Sheet `Transactions` (จำเป็นต้องมีสิทธิ์เข้าถึง Google Drive โฟลเดอร์นั้นๆ)

## การบำรุงรักษา
- **อัปเดต Backend**: แก้ไขโค้ดใน `gas/` แล้ว Deploy เป็น Web App เวอร์ชันใหม่
- **อัปเดต Frontend**: แก้ไขโค้ดใน `frontend/` และ Push ขึ้น GitHub
- **Rollback**: สามารถเลือกเวอร์ชันเก่าของ GAS ในหน้า Deployments หรือเลือก Commit เก่าใน GitHub Pages
- **PDPA Checklist**: ระบบไม่ได้เก็บชื่อ-นามสกุลของผู้ป่วย มีเพียง HN (Masked บนหน้าจอ) และลายเซ็น ห้ามแชร์ Folder Google Drive เป็น Public เด็ดขาด

## Limitations
- ไม่ได้เชื่อมต่อกับระบบ HIS (ผู้ป่วยต้องตรวจสอบชื่อยาเอง)
- ไม่รองรับการใช้งานออฟไลน์
