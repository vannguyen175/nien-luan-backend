//POST: /api/order/create
const Product = require("../models/ProductModel");
const Order = require("../models/OrderModel");
const User = require("../models/UserModel");
const Cart = require("../models/CartModel");

const createCart = (newCart) => {
	return new Promise(async (resolve, reject) => {
		const { idUser, idProduct } = newCart;

		try {
			const checkCart = await Cart.findOne({ idUser: idUser, idProduct: idProduct });
			if (checkCart) {
				return resolve({
					status: "EXIST",
					message: "Sản phẩm đã được thêm vào giỏ hàng",
				});
			} else {
				const isUserExist = await Cart.findOne({ idUser: idUser });
				if (isUserExist) {
					//nếu đã tồn tại ít nhất 1 sp trong giỏ => cập nhật
					const result = await Cart.findOneAndUpdate(
						{ idUser: idUser },
						{ $push: { idProduct: idProduct } }
					);

					return resolve({
						status: "SUCCESS",
						message: "Cập nhật cart thành công",
						data: result,
					});
				} else {
					//user chưa từng thêm sp vào giỏ hàng => tạo giỏ hàng
					const result = await Cart.create({
						idUser: idUser,
						idProduct: idProduct,
					});
					return resolve({
						status: "SUCCESS",
						message: "Tạo cart thành công",
						data: result,
					});
				}
			}
		} catch (error) {
			console.log(`Có lỗi ở CartService: ${error}`);
		}
	});
};

const deleteCart = (idUser, idProduct) => {
	return new Promise(async (resolve, reject) => {
		try {
			const checkCart = await Cart.findOne({ idUser: idUser, idProduct: idProduct });
			if (checkCart) {
				const result = await Cart.findOneAndUpdate(
					{ idUser: idUser },
					{ $pull: { idProduct: idProduct } },
					{ new: true }
				);

				return resolve({
					status: "SUCCESS",
					message: "Xóa giỏ hàng thành công",
					data: result,
				});
			} else {
				return resolve({
					status: "ERROR",
					message: "Giỏ hàng không tồn tại",
				});
			}
		} catch (error) {
			console.log(`Có lỗi ở Cart delete: ${error}`);
		}
	});
};

const getCart = (idUser, idProduct) => {
	return new Promise(async (resolve, reject) => {
		try {
			const checkCart = await Cart.findOne();
			if (checkCart) {
				let result = [];
				const data = await Cart.find({ idUser: idUser });
				let productDetail;
				for (let index = 0; index < data[0].idProduct.length; index++) {
					productDetail = await Product.findById(data[0].idProduct[index]);
					console.log('productDetail', data[0].idProduct[index]);
					result.push(productDetail);
				}
				return resolve({
					status: "SUCCESS",
					message: "Lấy giỏ hàng thành công",
					data: result,
				});
			} else {
				return resolve({
					status: "ERROR",
					message: "ID người dùng không tồn tại",
				});
			}
		} catch (error) {
			console.log(`Có lỗi ở CartService: ${error}`);
		}
	});
};

module.exports = {
	createCart,
	getCart,
	deleteCart,
};
