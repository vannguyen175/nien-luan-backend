const User = require("../models/UserModel");
const Address = require("../models/AddressModel");
const bcrypt = require("bcrypt"); //ma hoa mat khau
const { genneralAccessToken } = require("./JwtService");
const { required } = require("nodemon/lib/config");

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
				if (createAddress) {
					resolve({
						status: "SUCCESS",
						message: "SUCCESS",
						data: createUser,
					});
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

			resolve({
				status: "SUCCESS",
				message: "SUCCESS",
				access_token,
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
				isAdmin: checkUser.isAdmin,
			});

			resolve({
				status: "SUCCESS",
				message: "SUCCESS",
				access_token,
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
			if (checkUser === null) {
				resolve({
					status: "ERROR",
					message: "User is not exists",
				});
			}
			const hash = bcrypt.hashSync(data.password, 10);
			const updateUser = await User.findByIdAndUpdate(
				userID,
				{ data, password: hash },
				{
					new: true,
				}
			);
			const updateAddress = await Address.findOneAndUpdate({ user: userID }, data, {
				new: true,
			});
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

const getAllUsers = (role) => {
	return new Promise(async (resolve, reject) => {
		try {
			let data = {};
			if (role === "user") {
				data = await Address.find().populate({
					path: "user",
					match: { isAdmin: false },
				});
			} else {
				data = await Address.find().populate({
					path: "user",
					match: { isAdmin: true },
				});
			}
			const result = data.filter((value) => value.user !== null);
			resolve({
				status: "SUCCESS",
				message: "SUCCESS",
				data: result,
			});
		} catch (error) {
			reject(error);
		}
	});
};

const detailUser = (userID) => {
	return new Promise(async (resolve, reject) => {
		try {
			const user = await User.findById(userID);
			const address = await Address.findOne({ user: user._id });

			resolve({
				status: "OK",
				message: "SUCCESS",
				user,
				address,
			});
		} catch (error) {
			reject(error);
		}
	});
};

const infoUser = (userID) => {
	return new Promise(async (resolve, reject) => {
		try {
			const result = await User.findById(userID);
			const address = await Address.findOne({ user: userID });
			const data = {
				name: result.name,
				email: result.email,
				avatar: result.avatar,
				phone: address.phone,
				address: address.province,
				rating: result.rating,
			};
			resolve({
				status: "OK",
				message: "SUCCESS",
				data,
			});
		} catch (error) {
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
	loginUser,
	loginAdmin,
	updateUser,
	deleteUser,
	getAllUsers,
	detailUser,
	infoUser,
	searchUser,
};
