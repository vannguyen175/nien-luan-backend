const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
	{
		shippingDetail: {
			email: { type: String, required: true }, //email_buyer
			address: { type: String, required: true }, //address_buyer
			phone: { type: Number, required: true }, //phone_buyer
			shippingPrice: { type: Number, required: true },
			isPaid: { type: Boolean, default: false }, //da thanh toan hay chua (đối với paymentMethod = "cash")
			deliveredAt: { type: Date }, //thời điểm giao hàng thành công
		},
		buyer: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
	},
	{
		timestamps: true,
	}
);
const Order = mongoose.model("Order", orderSchema);
module.exports = { Order };
