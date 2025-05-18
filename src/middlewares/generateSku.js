import Product from "../models/Product.js";
import AttributeValue from "../models/AttributeValue.js";

export const generateSku = async (variant) => {
	try {
		// Lấy sản phẩm dựa vào productId
		const product = await Product.findById(variant.productId);
		if (!product) throw new Error("Không tìm thấy sản phẩm");

		// Lấy danh sách giá trị của các thuộc tính
		const attributeValues = await Promise.all(
			variant.attributes.map(async (attr) => {
				const value = await AttributeValue.findById(attr.valueId);
				if (!value) throw new Error("Không tìm thấy giá trị");
				return value ? value.slug || value.name : "N/A";
			})
		);

		// Ghép SKU theo định dạng: PRODUCT_SLUG-ATTR1-ATTR2
		const sku = `${product.slug.toUpperCase()}-${attributeValues.join("-")}`;

		return sku;
	} catch (error) {
		console.error("Lỗi khi tạo SKU:", error);
		return null;
	}
};
