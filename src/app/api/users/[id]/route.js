// นำเข้า NextResponse สำหรับส่ง HTTP Response กลับไปยัง Client
import { NextResponse } from "next/server";

// นำเข้า db สำหรับเชื่อมต่อฐานข้อมูล
import db from "../../../lib/db";

// ============================================================================
// GET By ID Function
// Path: /src/app/api/users/[id]/route.js
// ใช้สำหรับดึงข้อมูลผู้ใช้ตาม ID
// ============================================================================

export async function GET(request, context) {
  try {
    // รับค่า ID จาก URL
    const { id } = await context.params;

    // แปลง ID เป็นตัวเลข
    const userId = Number(id);

    // ตรวจสอบว่า ID ถูกต้องหรือไม่
    if (!Number.isInteger(userId) || userId <= 0) {
      return NextResponse.json(
        {
          status: "error",
          message: "Invalid user ID",
        },
        { status: 400 }
      );
    }

    // ค้นหาข้อมูลผู้ใช้จากฐานข้อมูล
    const [rows] = await db.query(
      "SELECT * FROM tbl_users WHERE id = ? LIMIT 1",
      [userId]
    );

    // ตรวจสอบว่าพบข้อมูลผู้ใช้หรือไม่
    if (rows.length === 0) {
      return NextResponse.json(
        {
          status: "error",
          message: "User not found",
        },
        { status: 404 }
      );
    }

    // ส่งข้อมูลผู้ใช้กลับไป
    return NextResponse.json(
      {
        status: "ok",
        data: rows[0],
      },
      { status: 200 }
    );

  } catch (err) {
    // แสดงข้อผิดพลาดใน Terminal
    console.error("Database query error:", err);

    return NextResponse.json(
      {
        status: "error",
        message: "Database error",
        details: err.message,
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// PUT By ID Function
// ใช้สำหรับแก้ไขข้อมูลผู้ใช้ตาม ID
// (ส่วนนี้ยังเป็นโค้ดจำลองจากโค้ดเดิมของคุณ)
// ============================================================================

// ============================================================================
// PUT By ID Function
// ใช้สำหรับแก้ไขข้อมูลผู้ใช้ตาม ID
// Path: /src/app/api/users/[id]/route.js
// ============================================================================

export async function PUT(request, context) {
  try {
    // รับ ID จาก URL
    const { id } = await context.params;
    const userId = Number(id);

    // ตรวจสอบ ID
    if (!Number.isInteger(userId) || userId <= 0) {
      return NextResponse.json(
        {
          status: "error",
          message: "Invalid user ID",
        },
        { status: 400 }
      );
    }

    // อ่านข้อมูลจาก Request Body เป็นข้อความ
    const rawBody = await request.text();

    // ตรวจสอบว่า Body ว่างหรือไม่
    if (!rawBody.trim()) {
      return NextResponse.json(
        {
          status: "error",
          message: "Request body is empty",
        },
        { status: 400 }
      );
    }

    // แปลงข้อความเป็น JSON
    let body;

    try {
      body = JSON.parse(rawBody);
    } catch (parseError) {
      return NextResponse.json(
        {
          status: "error",
          message: "Invalid JSON format",
        },
        { status: 400 }
      );
    }

    // กำหนดฟิลด์ที่อนุญาตให้แก้ไข
    const allowedFields = [
      "firstname",
      "fullname",
      "lastname",
      "username",
      "password",
      "status",
    ];

    // เลือกเฉพาะฟิลด์ที่อนุญาตให้แก้ไข
    const updates = {};

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updates[field] = body[field];
      }
    }

    // ตรวจสอบว่ามีข้อมูลที่ต้องการแก้ไขหรือไม่
    const fields = Object.keys(updates);

    if (fields.length === 0) {
      return NextResponse.json(
        {
          status: "error",
          message: "No data to update",
        },
        { status: 400 }
      );
    }

    // สร้างคำสั่ง SQL สำหรับแก้ไขข้อมูล
    const setClause = fields
      .map((field) => `${field} = ?`)
      .join(", ");

    const values = fields.map((field) => updates[field]);

    // ตรวจสอบว่ามีผู้ใช้ ID นี้อยู่หรือไม่
    const [existingUsers] = await db.query(
      "SELECT id FROM tbl_users WHERE id = ? LIMIT 1",
      [userId]
    );

    if (existingUsers.length === 0) {
      return NextResponse.json(
        {
          status: "error",
          message: "User not found",
        },
        { status: 404 }
      );
    }

    // แก้ไขข้อมูลในฐานข้อมูล
    await db.query(
      `UPDATE tbl_users SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [...values, userId]
    );

    // ส่งผลลัพธ์กลับ
    return NextResponse.json(
      {
        status: "ok",
        message: `แก้ไขข้อมูลผู้ใช้ ID: ${userId} สำเร็จ`,
        id: userId,
        updatedFields: fields,
      },
      { status: 200 }
    );

  } catch (error) {
    // แสดงรายละเอียด Error ใน Terminal
    console.error("Update user error:", error);

    return NextResponse.json(
      {
        status: "error",
        message: "Database update error",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
// ============================================================================
// DELETE By ID Function
// ใช้สำหรับลบข้อมูลผู้ใช้ตาม ID
// Path: /src/app/api/users/[id]/route.js
// ============================================================================

export async function DELETE(request, context) {
  try {
    // รับค่า ID จาก URL
    const { id } = await context.params;

    // แปลง ID เป็นตัวเลข
    const userId = Number(id);

    // ตรวจสอบว่า ID ถูกต้องหรือไม่
    if (!Number.isInteger(userId) || userId <= 0) {
      return NextResponse.json(
        {
          status: "error",
          message: "Invalid user ID",
        },
        { status: 400 }
      );
    }

    // ตรวจสอบว่ามีผู้ใช้ ID นี้อยู่ในฐานข้อมูลหรือไม่
    const [existingUsers] = await db.query(
      "SELECT id FROM tbl_users WHERE id = ? LIMIT 1",
      [userId]
    );

    if (existingUsers.length === 0) {
      return NextResponse.json(
        {
          status: "error",
          message: "User not found",
        },
        { status: 404 }
      );
    }

    // ลบข้อมูลผู้ใช้จากฐานข้อมูล
    const [result] = await db.query(
      "DELETE FROM tbl_users WHERE id = ?",
      [userId]
    );

    // ตรวจสอบว่ามีการลบแถวข้อมูลจริงหรือไม่
    if (result.affectedRows === 0) {
      return NextResponse.json(
        {
          status: "error",
          message: "User not found",
        },
        { status: 404 }
      );
    }

    // ส่งผลลัพธ์กลับ
    return NextResponse.json(
      {
        status: "ok",
        message: `ลบข้อมูลผู้ใช้ ID: ${userId} สำเร็จ`,
        id: userId,
      },
      { status: 200 }
    );

  } catch (error) {
    // แสดงข้อผิดพลาดใน Terminal
    console.error("Delete user error:", error);

    return NextResponse.json(
      {
        status: "error",
        message: "Database delete error",
        details: error.message,
      },
      { status: 500 }
    );
  }
}