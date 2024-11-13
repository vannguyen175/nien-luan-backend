const { Order } = require("../models/OrderModel");
const { OrderDetail } = require("../models/OrderDetailModel");
const Rating = require("../models/RatingModel");
const NotificationService = require("../services/NotificationService");

let io; //biến io đã khởi tạo ở socket.js
let getUserSocketId; //hàm lấy socket userID

const socket = (socketIO, getUserSocketIdFn) => {
	io = socketIO;
	getUserSocketId = getUserSocketIdFn;
};

//rating/create
const createRating = (review, score, idOrder, idProduct, idBuyer) => {
	return new Promise(async (resolve, reject) => {
		try {
			//note: idOrder là idOrder của bảng OrderDetail not Order
			const isExistProduct = await OrderDetail.findOne({ idProduct: idProduct }).populate({
				path: "idProduct",
				select: "images",
			});

			const isExistBuyer = await Order.findOne({ idBuyer: idBuyer, _id: isExistProduct?.idOrder });
			if (isExistProduct && isExistBuyer) {
				const createResult = await Rating.create({
					idOrder: idOrder,
					idProduct: idProduct,
					idBuyer: idBuyer,
					idSeller: isExistProduct.idSeller,
					review: review,
					score: score,
				});
				const userSocket = getUserSocketId(isExistProduct.idSeller);
				const addNoti = await NotificationService.addNotification({
					user: isExistProduct.idSeller,
					info: {
						image: isExistProduct.idProduct.images[0],
						navigate: "seller-profile",
						message: "Người mua hàng đã đánh giá sản phẩm của bạn.",
					},
				});
				if (userSocket) {
					io.to(userSocket.socketId).emit("getNotification", {
						unseenCount: addNoti.unseenCount,
					});
				}
				if (createResult) {
					resolve({
						status: "SUCCESS",
						message: "Đánh giá sản phẩm thành công",
					});
				}
			} else {
				resolve({
					status: "ERROR",
					message: "Người dùng chưa mua sản phẩm này",
				});
			}
		} catch (error) {
			reject(error);
		}
	});
};
const updateRating = (idRating, review, score) => {
	return new Promise(async (resolve, reject) => {
		try {
			//note: idOrder là idOrder của bảng OrderDetail not Order
			const checkExist = await Rating.findOne({ _id: idRating });
			if (checkExist) {
				const updateRes = await Rating.findOneAndUpdate(
					{ _id: idRating },
					{
						score: score,
						review: review,
					},
					{
						new: true,
					}
				);
				if (updateRes) {
					resolve({
						status: "SUCCESS",
						message: "Cập nhật đánh giá thành công",
					});
				}
			} else {
				resolve({
					status: "ERROR",
					message: "Có lỗi khi cập nhật, vui lòng thử lại.",
				});
			}
		} catch (error) {
			reject(error);
		}
	});
};

module.exports = {
	socket,
	createRating,
	updateRating,
};