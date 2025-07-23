// src/controllers/ChatGPT.js
import { OpenAI } from "openai";
import dotenv from "dotenv";
import Product from "../model/Product.js";

dotenv.config();

// ✅ Khởi tạo OpenAI client với OpenRouter
const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
  defaultHeaders: {
    "HTTP-Referer": "http://localhost:3000/", // domain frontend của bạn
    "X-Title": "TuVanMuaDienThoai",           // tên ứng dụng hiển thị
  },
});

export const chatTuvan = async (req, res) => {
  try {
    const { message } = req.body;

    // ✅ Lấy danh sách sản phẩm (top 10, chưa xoá)
    const products = await Product.find({ deletedAt: null }).limit(10);

    const productList = products.map((p) => {
      const name = p.title || p.name || "Không tên";
      const price = p.priceDefault
        ? `${p.priceDefault.toLocaleString()} VND`
        : "Giá không rõ";
      const description = p.shortDescription || p.description || "Không có mô tả";
      const link = `http://localhost:5173/product/${p._id}`; // lấy theo ID

      return `- **${name}** (${price}): ${description}\n👉 [Xem chi tiết](${link})`;
    }).join("\n\n");

    const prompt = `
Bạn là một chuyên viên tư vấn điện thoại.
Dưới đây là danh sách sản phẩm có sẵn trong kho:

${productList}

Khách hàng hỏi: "${message}"

👉 Dựa trên thông tin trên và câu hỏi, hãy tư vấn sản phẩm phù hợp nhất.
Trình bày rõ ràng, thân thiện, markdown đẹp, nhấn mạnh sản phẩm đề xuất bằng in đậm (**), có link xem chi tiết sản phẩm.
`;

    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });

    const reply = completion.choices[0].message.content;

    console.group("📩 Chat tư vấn");
    console.log("💬 Câu hỏi:", message);
    console.log("🤖 GPT phản hồi:\n", reply);
    console.groupEnd();

    res.json({ reply });
  } catch (error) {
    console.error("❌ GPT Error:", error.response?.data || error.message);
    res.status(500).json({ error: "Lỗi khi gọi AI tư vấn" });
  }
};
