const User = require("../models/UserModel");
const Address = require("../models/AddressModel");
const Seller = require("../models/SellerModel");
const Rating = require("../models/RatingModel");

const mongoose = require("mongoose");

const bcrypt = require("bcrypt"); //ma hoa mat khau
const { genneralAccessToken, genneralRefreshToken } = require("./JwtService");

const createUser = (newUser) => {
	return new Promise(async (resolve, reject) => {
		const { name, email, password, phone, isAdmin, avatar } = newUser;

		try {
			const checkUser = await User.findOne({ email: email });
			if (checkUser !== null) {
				//email da ton tai
				resolve({
					status: "ERROR",
					message: "Địa chỉ email đã tồn tại",
				});
			}
			const checkPhone = await Address.findOne({ phone: phone });
			if (checkPhone !== null) {
				//email da ton tai
				resolve({
					status: "ERROR",
					message: "Số điện thoại đã được đăng ký",
				});
			} else {
				const hash = bcrypt.hashSync(password, 10);
				const createUser = await User.create({
					name,
					email,
					password: hash,
					isAdmin,
					avatar,
				});

				if (createUser) {
					const createAddress = await Address.create({
						user: createUser._id,
						phone,
					});
					await Seller.create({ idUser: createUser._id });
					if (createAddress) {
						resolve({
							status: "SUCCESS",
							message: "SUCCESS",
							data: createUser,
						});
					}
				}
			}
		} catch (error) {
			reject(error);
		}
	});
};

const loginUser = (loginUser) => {
	return new Promise(async (resolve, reject) => {
		const { email, password } = loginUser;
		try {
			const checkUser = await User.findOne({ email: email, isAdmin: false });
			if (checkUser === null) {
				return resolve({
					status: "ERROR",
					message: "Email hoặc mật khẩu không hợp lệ. Vui lòng thử lại...",
				});
			} else {
				const isMatch = await bcrypt.compare(password, checkUser?.password);

				if (isMatch === false) {
					return resolve({
						status: "ERROR",
						message: "Email hoặc mật khẩu không hợp lệ. Vui lòng thử lại...",
					});
				}
			}

			//sau khi ktra login hop le
			const access_token = await genneralAccessToken({
				id: checkUser.id,
				isAdmin: checkUser.isAdmin,
			});

			const refresh_token = await genneralRefreshToken({
				id: checkUser.id,
				isAdmin: checkUser.isAdmin,
			});
			resolve({
				status: "SUCCESS",
				message: "SUCCESS",
				access_token,
				refresh_token,
			});
		} catch (error) {
			reject(error);
			console.log(error);
		}
	});
};

const loginWithGoogle = (email, name, picture) => {
	return new Promise(async (resolve, reject) => {
		try {
			const checkUser = await User.findOne({ email: email, isAdmin: false });
			let access_token = null;
			let refresh_token = null;
			//nếu account không tồn tại => đăng ký
			if (checkUser === null) {
				const newUser = await User.create({
					email,
					name,
					avatar: picture,
				});
				await Address.create({ user: newUser._id });
				await Seller.create({ idUser: newUser._id });

				access_token = await genneralAccessToken({
					id: newUser.id,
					isAdmin: newUser.isAdmin,
				});
				refresh_token = await genneralRefreshToken({
					id: newUser.id,
					isAdmin: newUser.isAdmin,
				});
			} else {
				//nếu account có tồn tại => lấy token
				access_token = await genneralAccessToken({
					id: checkUser.id,
					isAdmin: checkUser.isAdmin,
				});
				refresh_token = await genneralRefreshToken({
					id: checkUser.id,
					isAdmin: checkUser.isAdmin,
				});
			}

			resolve({
				status: "SUCCESS",
				message: "Đăng nhập tài khoản thành công!",
				access_token,
				refresh_token,
			});
		} catch (error) {
			reject(error);
			console.log(error);
		}
	});
};
const loginWithFacebook = (email, name, picture) => {
	return new Promise(async (resolve, reject) => {
		try {
			const checkUser = await User.findOne({ email: email, isAdmin: false });
			let access_token = null;
			let refresh_token = null;
			//nếu account không tồn tại => đăng ký
			if (checkUser === null) {
				const newUser = await User.create({
					email,
					name,
					avatar: picture,
				});
				await Address.create({ user: newUser._id });
				await Seller.create({ idUser: newUser._id });
				access_token = await genneralAccessToken({
					id: newUser.id,
					isAdmin: newUser.isAdmin,
				});
				refresh_token = await genneralRefreshToken({
					id: newUser.id,
					isAdmin: newUser.isAdmin,
				});
			} else {
				//nếu account có tồn tại => lấy token
				access_token = await genneralAccessToken({
					id: checkUser.id,
					isAdmin: checkUser.isAdmin,
				});
				refresh_token = await genneralRefreshToken({
					id: checkUser.id,
					isAdmin: checkUser.isAdmin,
				});
			}

			resolve({
				status: "SUCCESS",
				message: "Đăng nhập tài khoản thành công!",

				access_token,
				refresh_token,
			});
		} catch (error) {
			reject(error);
			console.log(error);
		}
	});
};
const loginAdmin = (loginAdmin) => {
	return new Promise(async (resolve, reject) => {
		const { email, password } = loginAdmin;
		try {
			const checkUser = await User.findOne({ email: email, isAdmin: true });
			if (checkUser === null) {
				return resolve({
					status: "ERROR",
					message: "Email hoặc mật khẩu không hợp lệ. Vui lòng thử lại...",
				});
			} else {
				const isMatch = await bcrypt.compare(password, checkUser?.password);

				if (isMatch === false) {
					return resolve({
						status: "ERROR",
						message: "Email hoặc mật khẩu không hợp lệ. Vui lòng thử lại...",
					});
				}
			}
			//sau khi ktra login hop le
			const access_token = await genneralAccessToken({
				id: checkUser.id,
				isAdmin: true,
			});
			const refresh_token = await genneralRefreshToken({
				id: checkUser.id,
				isAdmin: true,
			});

			resolve({
				status: "SUCCESS",
				message: "SUCCESS",
				access_token,
				refresh_token,
			});
		} catch (error) {
			reject(error);
			console.log(error);
		}
	});
};

const updateUser = (userID, data) => {
	return new Promise(async (resolve, reject) => {
		try {
			const checkUser = await User.findOne({ _id: userID });
			const checkAddress = await Address.findOne({ user: userID });
			if (checkUser === null) {
				resolve({
					status: "ERROR",
					message: "Người dùng không tồn tại",
				});
			}
			const checkPhoneExist = await Address.findOne({ phone: data.phone });
			if (checkPhoneExist && checkPhoneExist?.user.toString() !== userID) {
				resolve({
					status: "ERROR",
					message: "Số điện thoại đã được sử dụng",
				});
			}
			let updateUser = {};
			let updateAddress = {};
			if (data.password) {
				//TH1: create password 	TH2: update password
				const hash = bcrypt.hashSync(data.password, 10);
				updateUser = await User.findByIdAndUpdate(userID, { ...data, password: hash }, { new: true });
				updateAddress = await Address.findOneAndUpdate({ user: userID }, data, {
					new: true,
				});
			} else {
				//User không nhập password => giữ pass cũ
				if (checkAddress) {
					//tồn tại checkAddress (register thủ công)
					updateUser = await User.findByIdAndUpdate(userID, { ...data, password: checkUser.password }, { new: true });
					updateAddress = await Address.findOneAndUpdate({ user: userID }, data, {
						new: true,
					});
				} else {
					//chưa có checkAddress (user đăng ký qua google, fb)
					updateUser = await User.findByIdAndUpdate(userID, { ...data, password: checkUser.password }, { new: true });
					updateAddress = await Address.create({
						user: userID,
						...data,
					});
				}
			}

			resolve({
				status: "OK",
				message: "SUCCESS",
				dataUser: updateUser,
				dataAddress: updateAddress,
			});
		} catch (error) {
			console.log("error", error);
			reject(error);
		}
	});
};

const deleteUser = (userID) => {
	return new Promise(async (resolve, reject) => {
		try {
			const checkUser = await User.findOne({ _id: userID });
			if (checkUser === null) {
				resolve({
					status: "ERROR",
					message: "Người dùng không tồn tại",
				});
			}
			await User.findByIdAndDelete(userID);
			await Address.findOneAndDelete({ user: userID });
			resolve({
				status: "OK",
				message: "Xóa người dùng thành công",
			});
		} catch (error) {
			reject(error);
		}
	});
};

const getAllUsers = (role, page, limit) => {
	return new Promise(async (resolve, reject) => {
		try {
			const perPage = limit; //Số items trên 1 page
			let result = await Address.find({}).populate({
				path: "user",
				match: { isAdmin: role === "admin" },
			});
			
			result = result.filter((res) => res.user);
			const paginatedResult = result.slice((page - 1) * perPage, page * perPage);
			resolve({
				status: "SUCCESS",
				message: "SUCCESS",
				data: paginatedResult,
				totalCount: result.length,
			});
		} catch (error) {
			console.log("Error at getAllUsers", error);
			reject(error);
		}
	});
};

const getAllSellers = (page, limit) => {
	return new Promise(async (resolve, reject) => {
		try {
			const perPage = limit; //Số items trên 1 page
			let result = await Seller.find({}).populate({
				path: "idUser",
				match: { isAdmin: false },
				select: "name email avatar",
			});
			result = result.filter((res) => res.idUser);
			const paginatedResult = result.slice((page - 1) * perPage, page * perPage);

			resolve({
				status: "SUCCESS",
				message: "SUCCESS",
				data: paginatedResult,
				totalCount: result.length,
			});
		} catch (error) {
			console.log("Have error at getAllSellers service", error);
			reject(error);
		}
	});
};

//thông tin chi tiết của người dùng (chỉ chính chủ hoặc admin mới có thể xem được)
const detailUser = (userID) => {
	return new Promise(async (resolve, reject) => {
		try {
			const user = await User.findById(userID);
			const address = await Address.findOne({ user: user._id });
			const seller = await Seller.findOne({ idUser: user._id });

			resolve({
				status: "OK",
				message: "SUCCESS",
				user,
				address,
				seller,
			});
		} catch (error) {
			reject(error);
		}
	});
};

//thông tin cơ bản của người dùng
const infoUser = (userID) => {
	return new Promise(async (resolve, reject) => {
		try {
			const result = await User.findById(userID);

			const address = await Address.findOne({ user: userID });
			const seller = await Seller.findOne({ idUser: userID });
			const rating = await Rating.find({ idSeller: userID })
				.select("score review")
				.populate({
					path: "idProduct",
					select: "images name",
				})
				.populate({
					path: "idBuyer",
					select: "name avatar",
				});

			const avgRating = await Rating.aggregate([
				{
					$match: { idSeller: new mongoose.Types.ObjectId(userID) },
				},
				{
					$group: {
						_id: "$idSeller", // Nhóm theo idSeller
						averageRating: { $avg: "$score" }, // Tính trung bình của trường score
						totalReviews: { $sum: 1 }, // Đếm tổng số đánh giá
					},
				},
			]);

			if (result?.password) {
				const { password, ...user } = result; //destructuring
				const data = {
					...address?._doc,
					...result._doc,
					...seller._doc,
					rating,
					avgRating,
				};
				resolve({
					status: "OK",
					message: "SUCCESS",
					data,
				});
			} else {
				const data = {
					...address?._doc,
					...result._doc,
					...seller._doc,
					rating,
					avgRating,
				};

				resolve({
					status: "OK",
					message: "SUCCESS",
					data,
				});
			}
		} catch (error) {
			console.log("error at infoUser", error);

			reject(error);
		}
	});
};
const searchUser = (key) => {
	return new Promise(async (resolve, reject) => {
		try {
			let data;
			if (key === "all") {
				data = await Address.find().populate({
					path: "user",
				});
			} else {
				data = await Address.find().populate({
					path: "user",
					match: {
						$or: [
							{
								name: { $regex: key, $options: "i" }, // Sử dụng $options: "i" để không phân biệt chữ hoa, chữ thường
							},
						],
					},
				});
			}

			const result = data.filter((value) => value.user !== null);

			resolve({
				status: "OK",
				message: "SUCCESS",
				result,
			});
		} catch (error) {
			reject(error);
		}
	});
};

module.exports = {
	createUser,
	loginWithGoogle,
	loginUser,
	loginAdmin,
	updateUser,
	deleteUser,
	getAllUsers,
	detailUser,
	infoUser,
	searchUser,
	loginWithFacebook,
	getAllSellers,
};
