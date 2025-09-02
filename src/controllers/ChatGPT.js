// src/controllers/ChatGPT.js
import { OpenAI } from "openai";
import dotenv from "dotenv";
import Product from "../model/Product.js";
import Category from "../model/Category.js";

dotenv.config();

// ✅ Khởi tạo OpenAI client với OpenRouter
const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
  defaultHeaders: {
    "HTTP-Referer": "http://localhost:3000/",
    "X-Title": "TuVanMuaDienThoai",
  },
});

export const chatTuvan = async (req, res) => {
  try {
    const { message } = req.body;
    const messageLower = message.toLowerCase();
    console.log("✅ CHECK API KEY:", process.env.OPENROUTER_API_KEY);

    // ✅ Kiểm tra xem khách chỉ chào
    const greetingKeywords = ["chào", "xin chào", "hi", "hello"];
    if (greetingKeywords.some(k => messageLower.includes(k))) {
      return res.json({ reply: "Xin chào! Bạn cần giúp gì hôm nay?" });
    }

    // ✅ Nhận diện so sánh sản phẩm
    const compareKeywords = ["so sánh", "vs", "khác nhau", "với"];
    const isCompare = compareKeywords.some(k => messageLower.includes(k));

    // ✅ Lấy tất cả sản phẩm đang có và populate category + variants
    const products = await Product.find({ deletedAt: null })
      .populate({ path: "categoryId", select: "name" })
      .populate({ path: "variants", select: "name price stock" })
      .select("title name priceDefault shortDescription description variants categoryId _id imageUrl")
      .limit(100)
      .lean();

    // Nếu không phải so sánh thì nhận diện category + ngân sách
    let matchedCategory = null;
    let hasBudget = false;
    let budgetValue = null;

    if (!isCompare) {
      const categoriesInDB = products.map(p => p.categoryId?.name).filter(Boolean);
      matchedCategory = categoriesInDB.find(c => messageLower.includes(c.toLowerCase()));

      // Nhận diện ngân sách (6 triệu, 20m, 6000000)
      const budgetRegex = /(\d+(\.\d+)?\s*(triệu|m)|\d{6,})/i;
      const budgetMatch = message.match(budgetRegex);
      hasBudget = !!budgetMatch;
      budgetValue = hasBudget
        ? parseFloat(budgetMatch[0].replace(/[^\d]/g, '')) *
          (budgetMatch[0].toLowerCase().includes('triệu') || budgetMatch[0].toLowerCase().includes('m') ? 1000000 : 1)
        : null;

      if (!matchedCategory || !hasBudget) {
        let askMessage = "Để tư vấn tốt hơn, ";
        if (!matchedCategory) askMessage += "Anh/Chị có đang tìm sản phẩm thuộc danh mục nào cụ thể chưa? ";
        if (!hasBudget) askMessage += "Ngân sách của Anh/Chị là bao nhiêu?";
        return res.json({ reply: askMessage.trim() });
      }
    }

    // ✅ Lọc sản phẩm theo category + ngân sách nếu không so sánh
    let filteredProducts = products;
    if (!isCompare && matchedCategory && hasBudget) {
      filteredProducts = products.filter(p =>
        p.categoryId?.name === matchedCategory && p.priceDefault <= budgetValue
      );

      if (filteredProducts.length === 0) {
        return res.json({
          reply: `Hiện tại chúng tôi chưa có sản phẩm thuộc danh mục <b>${matchedCategory}</b> trong tầm giá <b>${budgetValue.toLocaleString()} VND</b>.`
        });
      }
    }
// ✅ Lọc sản phẩm theo tên nếu khách nhập tên cụ thể
// ✅ Lọc sản phẩm theo tên nếu khách nhập tên cụ thể
const productNamesLower = products.map(p => ({ ...p, nameLower: (p.title || p.name || "").toLowerCase() }));
const matchedByName = productNamesLower.filter(p => messageLower.includes(p.nameLower));

if (matchedByName.length > 0) {
  filteredProducts = matchedByName; // ưu tiên sản phẩm nhập đúng tên
}
else if (!isCompare) {
  // Nếu không tìm thấy theo tên, mới chạy logic category + ngân sách
  const categoriesInDB = products.map(p => p.categoryId?.name).filter(Boolean);
  matchedCategory = categoriesInDB.find(c => messageLower.includes(c.toLowerCase()));

  // Nhận diện ngân sách
  const budgetRegex = /(\d+(\.\d+)?\s*(triệu|m)|\d{6,})/i;
  const budgetMatch = message.match(budgetRegex);
  hasBudget = !!budgetMatch;
  budgetValue = hasBudget
    ? parseFloat(budgetMatch[0].replace(/[^\d]/g, '')) *
      (budgetMatch[0].toLowerCase().includes('triệu') || budgetMatch[0].toLowerCase().includes('m') ? 1000000 : 1)
    : null;

  if (!matchedCategory || !hasBudget) {
    let askMessage = "Để tư vấn tốt hơn, ";
    if (!matchedCategory) askMessage += "Anh/Chị có đang tìm sản phẩm thuộc danh mục nào cụ thể chưa? ";
    if (!hasBudget) askMessage += "Ngân sách của Anh/Chị là bao nhiêu?";
    return res.json({ reply: askMessage.trim() });
  }

  // lọc theo category + ngân sách
  filteredProducts = products.filter(p =>
    p.categoryId?.name === matchedCategory && p.priceDefault <= budgetValue
  );

  if (filteredProducts.length === 0) {
    return res.json({
      reply: `Hiện tại chúng tôi chưa có sản phẩm thuộc danh mục <b>${matchedCategory}</b> trong tầm giá <b>${budgetValue.toLocaleString()} VND</b>.`
    });
  }
}


    // ✅ Chuẩn bị danh sách sản phẩm HTML
const productList = filteredProducts.map(p => {
  const name = p.title || p.name || "Không tên";
  const price = p.priceDefault ? `${p.priceDefault.toLocaleString()} VND` : "Giá chưa cập nhật";
  const link = `http://localhost:5173/product/${p._id}`;

  let variantText = "";
  if (p.variants && p.variants.length) {
    const validVariants = p.variants
      .filter(v => v.name || v.price)
      .map(v => {
        const vName = v.name || "Phiên bản tiêu chuẩn";
        const vPrice = typeof v.price === "number" ? `${v.price.toLocaleString()} VND` : "Giá chưa cập nhật";
        return `- ${vName}: ${vPrice}`;
      });
    if (validVariants.length > 0) {
      variantText = `<div style="margin-top:6px; color:#718096; font-size:13px;">các màu:<br/>${validVariants.join('<br/>')}</div>`;
    }
  }

  return `
<div style="border:1px solid #e2e8f0; border-radius:12px; padding:10px; display:flex; align-items:center; justify-content:space-between; gap:10px; margin-bottom:10px; background:#f8fafc;">
  <div style="flex:1; display:flex; flex-direction:column; justify-content:center;">
    <span style="font-weight:bold; color:#1a202c; font-size:14px;">${name}</span>
    <span style="color:#4a5568; font-size:13px;">${price}</span>
    ${variantText}
  </div>
  <a href="${link}" target="_blank" style="flex-shrink:0;">
    <img src="${p.imageUrl || '/placeholder.png'}" alt="${name}" style="width:60px; height:60px; object-fit:cover; border-radius:8px; border:1px solid #cbd5e1;" />
  </a>
</div>
`;
}).join("\n");




    // ✅ Prompt cho AI
    let prompt;
    if (isCompare) {
      const productNames = filteredProducts.map(p => p.title || p.name);
      const matchedProducts = productNames.filter(name =>
        messageLower.includes(name.toLowerCase())
      );

      let recommendation = "";
      if (matchedProducts.length >= 2) {
        const p1 = filteredProducts.find(p => p.title === matchedProducts[0] || p.name === matchedProducts[0]);
        const p2 = filteredProducts.find(p => p.title === matchedProducts[1] || p.name === matchedProducts[1]);
        if (p1 && p2) {
          const expensive = p1.priceDefault >= p2.priceDefault ? p1.title : p2.title;
          recommendation = `<br/><b>💡 Gợi ý:</b> Dựa trên giá cả và chất lượng, bạn nên chọn sản phẩm <b>${expensive}</b> vì nó có hiệu năng và chất lượng tốt hơn.`;
        }
      }

      prompt = `
Bạn là chuyên viên tư vấn điện thoại.
Dưới đây là danh sách sản phẩm hiện có trong kho:

${productList}

Khách hàng hỏi: "${message}"

👉 Nhiệm vụ:
- Nhận diện các sản phẩm mà khách muốn so sánh từ danh sách trên.
- So sánh chi tiết bằng bảng Markdown: Tiêu chí | Sản phẩm A | Sản phẩm B
- Các tiêu chí: Thiết kế, Màn hình, Chip/Hiệu năng, Camera, Pin, Giá
- Sau bảng, đưa ra gợi ý sản phẩm phù hợp, ưu tiên sản phẩm giá cao hơn.
${recommendation}
- Sử dụng HTML/Markdown rõ ràng, giữ nguyên liên kết "Xem chi tiết".
`;
    } else {
      prompt = `
Bạn là chuyên viên tư vấn điện thoại thân thiện.
Dưới đây là danh sách sản phẩm có sẵn:

${productList}

Khách hàng hỏi: "${message}"

👉 Dựa trên thông tin trên, tư vấn sản phẩm phù hợp nhất.
- Nhấn mạnh sản phẩm đề xuất bằng in đậm (**)
- Giữ liên kết và hình ảnh
- Trình bày HTML/Markdown đẹp, dễ đọc
`;
    }

    // ✅ Gọi OpenAI
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
