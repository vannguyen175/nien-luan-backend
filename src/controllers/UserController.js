const UserService = require("../services/UserService.js");

const createUser = async (req, res) => {
	try {
		const { name, email, password, confirmPassword, phone } = req.body;
		const regexEmail = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
		const isCheckEmail = regexEmail.test(email);
		if (!name || !email || !password || !confirmPassword || !phone) {
			return res.status(200).json({
				status: `ERROR`,
				message: "Vui lòng điền đầy đủ thông tin.",
			});
		} else if (!isCheckEmail) {
			return res.status(200).json({
				status: `ERROR`,
				message: "Email không hợp lệ.",
			});
		} else if (password != confirmPassword) {
			return res.status(200).json({
				status: `ERROR`,
				message: "Mật khẩu nhập lại không hợp lệ.",
			});
		}
		const response = await UserService.createUser(req.body);
		return res.status(200).json(response);
	} catch (error) {
		return res.status(404).json({ message: error });
	}
};

const loginUser = async (req, res) => {
	try {
		const { email, password } = req.body; //destructuring
		const regexEmail = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
		const isCheckEmail = regexEmail.test(email);
		if (!email || !password) {
			return res.status(200).json({
				status: `ERROR`,
				message: "Vui lòng điền đầy đủ thông tin.",
			});
		} else if (!isCheckEmail) {
			return res.status(200).json({
				status: `ERROR`,
				message: "Email không hợp lệ.",
			});
		}
		const response = await UserService.loginUser(req.body);
		return res.status(200).json(response);
	} catch (error) {
		return res.status(404).json({ message: error });
	}
};
const loginAdmin = async (req, res) => {
	try {
		const { email, password } = req.body.data; //destructuring
		const regexEmail = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
		const isCheckEmail = regexEmail.test(email);

		if (!email || !password) {
			return res.status(200).json({
				status: `ERROR`,
				message: "Vui lòng điền đầy đủ thông tin.",
			});
		} else if (!isCheckEmail) {
			return res.status(200).json({
				status: `ERROR`,
				message: "Email không hợp lệ.",
			});
		}
		const response = await UserService.loginAdmin(req.body.data);
		return res.status(200).json(response);
	} catch (error) {
		return res.status(404).json({ message: error });
	}
};

const updateUser = async (req, res) => {
	try {
		const userID = req.params.id;
		const data = req.body;
		const regexEmail = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
		const isCheckEmail = regexEmail.test(data.email);
		if (!data.name || !data.email) {
			return res.status(200).json({
				status: `ERROR`,
				message: "Vui lòng điền đầy đủ thông tin.",
			});
		}
		if (!isCheckEmail) {
			return res.status(200).json({
				status: `ERROR`,
				message: "Email không hợp lệ.",
			});
		}
		const response = await UserService.updateUser(userID, data);

		return res.status(200).json(response);
	} catch (error) {
		return res.status(404).json({ message: error });
	}
};

const deleteUser = async (req, res) => {
	try {
		const userID = req.params.id;
		if (!userID) {
			return res.status(200).json({
				status: `ERR`,
				message: "The user_id is requied",
			});
		}
		const response = await UserService.deleteUser(userID);
		return res.status(200).json(response);
	} catch (error) {
		return res.status(404).json({ message: error });
	}
};

const getAllUsers = async (req, res) => {
	try {
		const role = req.body.role;
		const response = await UserService.getAllUsers(role);
		return res.status(200).json(response);
	} catch (error) {
		return res.status(404).json({ message: error });
	}
};

const detailUser = async (req, res) => {
	try {
		const userID = req.params.id;
		const response = await UserService.detailUser(userID);
		return res.status(200).json(response);
	} catch (error) {
		return res.status(404).json({ message: error });
	}
};
const logoutUser = async (req, res) => {
	try {
		localStorage.clear("access_token");
		return res.status(200).json({
			status: "SUCCESS",
			message: "Logout successfully",
		});
	} catch (error) {
		return res.status(404).json({ message: error });
	}
};

const infoUser = async (req, res) => {
	try {
		const userID = req.params.id;
		const response = await UserService.infoUser(userID);
		return res.status(200).json(response);
	} catch (error) {
		return res.status(404).json({ message: error });
	}
};

const searchUser = async (req, res) => {
	try {
		const key = req.params.key;
		const response = await UserService.searchUser(key);
		return res.status(200).json(response);
	} catch (error) {
		return res.status(404).json({ message: error });
	}
};

module.exports = {
	createUser,
	loginUser,
	loginAdmin,
	updateUser,
	deleteUser,
	getAllUsers,
	detailUser,
	logoutUser,
	infoUser,
	searchUser,
};
