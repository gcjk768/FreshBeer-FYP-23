import {
	FontAwesome5,
	Ionicons,
	MaterialIcons,
	Octicons,
} from "@expo/vector-icons";
import axios from "axios";
import React, { useEffect, useState } from "react";
import {
	Alert,
	Modal,
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";
import { SelectList } from "react-native-dropdown-select-list";
import { Header } from "react-native-elements";
import {
	Cell,
	Col,
	Cols,
	Row,
	Rows,
	Table,
	TableWrapper,
} from "react-native-reanimated-table";
import { SafeAreaView } from "react-native-safe-area-context";
import COLORS from "../../constants/colors";
import GlobalStyle from "../../utils/GlobalStyle";

const Button = (props) => {
	const filledBgColor = props.color || COLORS.primary;
	const outlinedColor = COLORS.white;
	const bgColor = props.filled ? filledBgColor : outlinedColor;
	const textColor = props.filled ? COLORS.black : COLORS.white;

	return (
		<TouchableOpacity
			style={{
				...styles.button,
				...{ backgroundColor: bgColor },
				...props.style,
			}}
			onPress={props.onPress}
		>
			<Text style={{ fontSize: 12, ...GlobalStyle.bodyFont, color: textColor }}>
				{props.title}
			</Text>
		</TouchableOpacity>
	);
};

const CustomText = (props) => {
	return (
		<Text style={{ ...GlobalStyle.bodyFont, ...props.style }}>
			{props.children}
		</Text>
	);
};

// custom alert for successful edit
const CustomEditAlert = ({ visible, onClose, title, message }) => {
	return (
		<Modal visible={visible} transparent animationType="fade">
			<View
				style={{
					flex: 1,
					backgroundColor: "rgba(0, 0, 0, 0.5)",
					justifyContent: "center",
					alignItems: "center",
				}}
			>
				<View
					style={{
						width: "80%",
						backgroundColor: COLORS.white,
						borderRadius: 20,
						padding: 30,
					}}
				>
					<Ionicons
						name="md-beer"
						size={34}
						color={COLORS.foam}
						style={{ alignSelf: "center" }}
					/>
					<Text
						style={{
							fontSize: 18,
							...GlobalStyle.headerFont,
							alignSelf: "center",
							marginBottom: 20,
						}}
					>
						{title}
					</Text>
					<CustomText
						style={{
							alignSelf: "center",
							fontSize: 16,
							marginBottom: 20,
						}}
					>
						{message}
					</CustomText>
					<TouchableOpacity
						style={{
							backgroundColor: COLORS.foam,
							padding: 10,
							borderRadius: 8,
							alignItems: "center",
							marginTop: 20,
						}}
						onPress={onClose}
					>
						<Text style={{ ...GlobalStyle.headerFont, fontSize: 16 }}>OK</Text>
					</TouchableOpacity>
				</View>
			</View>
		</Modal>
	);
};

// custom alert for successful user creation
const CustomCreateAlert = ({ visible, onClose, title, message }) => {
	return (
		<Modal visible={visible} transparent animationType="fade">
			<View
				style={{
					flex: 1,
					backgroundColor: "rgba(0, 0, 0, 0.5)",
					justifyContent: "center",
					alignItems: "center",
				}}
			>
				<View
					style={{
						width: "80%",
						backgroundColor: COLORS.white,
						borderRadius: 20,
						padding: 30,
					}}
				>
					<Ionicons
						name="md-beer"
						size={34}
						color={COLORS.foam}
						style={{ alignSelf: "center" }}
					/>
					<Text
						style={{
							fontSize: 18,
							...GlobalStyle.headerFont,
							alignSelf: "center",
							marginBottom: 20,
						}}
					>
						{title}
					</Text>
					<CustomText
						style={{
							alignSelf: "center",
							fontSize: 16,
							marginBottom: 20,
						}}
					>
						{message}
					</CustomText>
					<TouchableOpacity
						style={{
							backgroundColor: COLORS.foam,
							padding: 10,
							borderRadius: 8,
							alignItems: "center",
							marginTop: 20,
						}}
						onPress={onClose}
					>
						<Text style={{ ...GlobalStyle.headerFont, fontSize: 16 }}>OK</Text>
					</TouchableOpacity>
				</View>
			</View>
		</Modal>
	);
};

const ManageUsers = ({ navigation }) => {
	const [userData, setUserData] = useState({
		admins: [],
		users: [],
		venueOwners: [],
	});
	const [selectedUser, setSelectedUser] = useState(null);
	const [isModalVisible, setIsModalVisible] = useState(false);
	const [isCreateUserModalVisible, setIsCreateUserModalVisible] =
		useState(false);
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [email, setEmail] = useState("");
	const [mobileNumber, setMobileNumber] = useState("");
	const [selectedAccountType, setSelectedAccountType] = useState("User");
	const [createUserState, setCreateUserState] = useState(false);
	const [editUserState, setEditUserState] = useState(false);

	const [isEditVisible, setIsEditVisible] = useState(false);
	const [EditTitle, setEditTitle] = useState("");
	const [EditMessage, setEditMessage] = useState("");

	const [isCreateVisible, setIsCreateVisible] = useState(false);
	const [CreateTitle, setCreateTitle] = useState("");
	const [CreateMessage, setCreateMessage] = useState("");

	const toggleModal = () => {
		setIsModalVisible(!isModalVisible);
	};

	const toggleModal2 = () => {
		setIsCreateUserModalVisible(!isCreateUserModalVisible);
	};

	useEffect(() => {
		axios
			.get("https://fresh-beer-near-me-6e244313be42.herokuapp.com/getUser")
			.then((response) => {
				setUserData(response.data);
				setCreateUserState(false);
				setEditUserState(false);
			})
			.catch((error) => {
				console.error("Error retrieving User Data", error);
			});
	}, [createUserState, editUserState]);

	const generateTableData = () => {
		const combinedData = [
			...userData.admins,
			...userData.users,
			...userData.venueOwners,
		];

		return combinedData.map((user) => [
			user.username,
			user.adminID ? "Admin" : user.venueOwnerID ? "Venue Owner" : "User",
			<Button
				title="Edit Account"
				onPress={() => {
					setSelectedUser(user);
					toggleModal();
				}}
				color={COLORS.blue}
				filled
				style={{
					marginTop: 10,
					marginBottom: 4,
					elevation: 2,
				}}
			/>,
		]);
	};

	const handleCreateUser = () => {
		const data = {
			username: username,
			password: password,
			email: email,
			mobileNumber: mobileNumber,
			selectedAccountType: selectedAccountType,
		};

		axios
			.post("https://fresh-beer-near-me-6e244313be42.herokuapp.com/createUser", data)
			.then((response) => {
				if (response.data.success) {
					setCreateTitle("Success");
					setCreateMessage("Account created!");
					setCreateUserState(true);
				} else {
					const { message } = response.data;
					setCreateTitle("Error");
					setCreateMessage(message);
				}
				setIsCreateVisible(true);
			})
			.catch((error) => {
				console.error(error);
			});
	};

	const handleEditUser = () => {
		axios
			.post("https://fresh-beer-near-me-6e244313be42.herokuapp.com/editUser", { selectedUser })
			.then((response) => {
				if (response.data.success) {
					setEditTitle("Success");
					setEditMessage("Account edited!");
					setEditUserState(true);
				} else {
					const { message } = response.data;
					setEditTitle("Error");
					setEditMessage(message);
				}
				setIsEditVisible(true);
			})
			.catch((error) => {
				console.error(error);
			});
	};

	return (
		<View style={{ flex: 1 }}>
			<SafeAreaView style={{ flex: 1 }} backgroundColor={COLORS.secondary}>
				<Header
					placement="left"
					backgroundColor={COLORS.primary}
					containerStyle={{
						height: 100,
						borderBottomLeftRadius: 40,
						borderBottomRightRadius: 40,
					}}
					leftComponent={
						<View style={{ flexDirection: "row" }}>
							<TouchableOpacity onPress={() => navigation.goBack()}>
								<MaterialIcons
									name="keyboard-arrow-left"
									size={24}
									color={COLORS.black}
								/>
							</TouchableOpacity>
						</View>
					}
					centerComponent={{
						text: "FreshBeer",
						style: {
							fontSize: 20,
							...GlobalStyle.headerFont,
							flexDirection: "row",
							justifyContent: "flex-start",
						},
					}}
					rightComponent={
						<View style={{ flexDirection: "row" }}>
							<TouchableOpacity onPress={() => navigation.navigate("Welcome")}>
								<MaterialIcons name="logout" size={24} color={COLORS.black} />
							</TouchableOpacity>
						</View>
					}
				/>

				<SafeAreaView style={{ flex: 1 }}>
					<ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
						<View style={{ marginHorizontal: 22 }}>
							<Text
								style={{
									fontSize: 18,
									...GlobalStyle.headerFont,
								}}
							>
								Manage Users
							</Text>

							<View
								style={{
									flexDirection: "row",
									justifyContent: "flex-end",
									alignItems: "flex-end",
								}}
							>
								<Button
									title="Create user"
									color={COLORS.foam}
									filled
									style={{
										marginTop: 10,
										marginBottom: 4,
										elevation: 2,
										width: "30%",
									}}
									onPress={() => {
										toggleModal2();
									}}
								/>
								{/* popup for create new user */}
								<Modal
									visible={isCreateUserModalVisible}
									animationType="slide"
									transparent
									onRequestClose={() => setIsCreateUserModalVisible(false)}
								>
									<View
										style={{
											width: "100%",
											height: "100%",
											backgroundColor: COLORS.secondary,
											borderRadius: 10,
											paddingHorizontal: 20,
											elevation: 5,
										}}
									>
										<View style={{ marginTop: 12 }}>
											<TouchableOpacity
												onPress={() => setIsCreateUserModalVisible(false)}
											>
												<Ionicons
													name="arrow-back"
													size={24}
													color={COLORS.black}
												/>
											</TouchableOpacity>
										</View>
										<View style={{ marginHorizontal: 22 }}>
											<Text
												style={{
													fontSize: 18,
													...GlobalStyle.headerFont,
													marginVertical: 12,
												}}
											>
												Create New User
											</Text>
											<View style={{ marginBottom: 8 }}>
												<CustomText style={{ marginTop: 10 }}>
													Username
												</CustomText>
												<View style={styles.textInput}>
													<TextInput
														placeholder="Username"
														onChangeText={(text) => setUsername(text)}
														style={{ width: "100%" }}
													/>
												</View>
											</View>

											<View style={{ marginBottom: 8 }}>
												<CustomText style={{ marginTop: 10 }}>
													Password
												</CustomText>
												<View style={styles.textInput}>
													<TextInput
														placeholder="Password"
														onChangeText={(text) => setPassword(text)}
														style={{ width: "100%" }}
													/>
												</View>
											</View>

											<View style={{ marginBottom: 8 }}>
												<CustomText style={{ marginTop: 10 }}>Email</CustomText>
												<View style={styles.textInput}>
													<TextInput
														placeholder="Email"
														onChangeText={(text) => setEmail(text)}
														style={{ width: "100%" }}
													/>
												</View>
											</View>

											<View style={{ marginBottom: 8 }}>
												<CustomText style={{ marginTop: 10 }}>
													Mobile Number
												</CustomText>
												<View style={styles.textInput}>
													<TextInput
														placeholder="Mobile Number"
														onChangeText={(text) => setMobileNumber(text)}
														style={{ width: "100%" }}
													/>
												</View>
											</View>

											<View style={{ marginBottom: 8 }}>
												<CustomText style={{ marginTop: 10 }}>
													Account Type
												</CustomText>
												<SelectList
													data={["User", "Venue Owner", "Admin"]}
													defaultOption={{ value: "User" }}
													setSelected={(itemValue) =>
														setSelectedAccountType(itemValue)
													}
													boxStyles={{
														borderRadius: 12,
														borderColor: 0,
														backgroundColor: COLORS.grey,
														opacity: 1,
													}}
													dropdownStyles={{
														right: 0,
														borderColor: 0,
														backgroundColor: COLORS.grey,
														opacity: 1,
													}}
													search={false}
												/>
											</View>
											<Button
												title="Create"
												color={COLORS.foam}
												filled
												onPress={() => handleCreateUser()}
												style={{ marginTop: 20 }}
											/>
											<CustomCreateAlert
												visible={isCreateVisible}
												onClose={() => setIsCreateVisible(false)}
												title={CreateTitle}
												message={CreateMessage}
											/>
										</View>
									</View>
								</Modal>
							</View>

							<View style={{ marginTop: 20, justifyContent: "center" }}>
								<Table
									borderStyle={{ borderWidth: 1, borderColor: COLORS.black }}
								>
									<Row
										data={["Username", "Account Type", "Actions"]} // Modified labels
										style={styles.head}
										textStyle={{
											textAlign: "center",
											...GlobalStyle.headerFont,
										}}
									/>
									<Rows
										data={generateTableData()}
										textStyle={{ ...GlobalStyle.bodyFont, textAlign: "center" }}
									/>
								</Table>
							</View>

							{/* popup for edit account */}
							<Modal visible={isModalVisible} animationType="slide" transparent>
								{selectedUser && (
									<View
										style={{
											width: "100%",
											height: "100%",
											backgroundColor: COLORS.secondary,
											borderRadius: 10,
											paddingHorizontal: 20,
											elevation: 5,
										}}
									>
										<View style={{ marginTop: 12 }}>
											<TouchableOpacity
												onPress={() => setIsModalVisible(false)}
											>
												<Ionicons
													name="arrow-back"
													size={24}
													color={COLORS.black}
												/>
											</TouchableOpacity>
										</View>
										<ScrollView
											contentContainerStyle={{ paddingBottom: 10 }}
											showsVerticalScrollIndicator={false}
										>
											<View style={{ marginHorizontal: 22 }}>
												<Text
													style={{
														fontSize: 18,
														...GlobalStyle.headerFont,
														marginTop: 22,
														marginBottom: 12,
													}}
												>
													Edit User Account
												</Text>
												<View style={{ marginBottom: 8 }}>
													<CustomText style={{ marginTop: 10 }}>
														Username
													</CustomText>
													<View style={styles.textInput}>
														<TextInput
															placeholder="Username"
															onChangeText={(text) =>
																setSelectedUser({
																	...selectedUser,
																	username: text,
																})
															}
															value={selectedUser.username}
															style={{ width: "100%" }}
														/>
													</View>
												</View>
												<View style={{ marginBottom: 8 }}>
													<CustomText style={{ marginTop: 10 }}>
														Account Type
													</CustomText>
													<View style={styles.textInput}>
														<TextInput
															value={
																selectedUser.adminID
																	? "Admin"
																	: selectedUser.venueOwnerID
																	? "Venue Owner"
																	: "User"
															}
															onChangeText={() => {}}
															editable={false}
															style={{ width: "100%" }}
														/>
													</View>
												</View>
												<View style={{ marginBottom: 8 }}>
													<CustomText style={{ marginTop: 10 }}>
														Password
													</CustomText>
													<View style={styles.textInput}>
														<TextInput
															placeholder="Password"
															value={selectedUser.password}
															onChangeText={(text) =>
																setSelectedUser({
																	...selectedUser,
																	password: text,
																})
															}
															style={{ width: "100%" }}
														/>
													</View>
												</View>
												<View style={{ marginBottom: 8 }}>
													<CustomText style={{ marginTop: 10 }}>
														Email
													</CustomText>
													<View style={styles.textInput}>
														<TextInput
															placeholder="Email"
															onChangeText={(text) =>
																setSelectedUser({
																	...selectedUser,
																	email: text,
																})
															}
															value={selectedUser.email}
															style={{ width: "100%" }}
														/>
													</View>
												</View>
												<View style={{ marginBottom: 8 }}>
													<CustomText style={{ marginTop: 10 }}>
														Mobile Number
													</CustomText>
													<View style={styles.textInput}>
														<TextInput
															placeholder="Password"
															value={selectedUser.mobileNumber}
															onChangeText={(text) =>
																setSelectedUser({
																	...selectedUser,
																	mobileNumber: text,
																})
															}
															style={{ width: "100%" }}
														/>
													</View>
												</View>
												<View style={{ marginBottom: 8 }}>
													<CustomText style={{ marginTop: 10 }}>
														{selectedUser.userID
															? "Referral Code:"
															: selectedUser.venueOwnerID
															? ""
															: ""}
													</CustomText>
													<View style={styles.textInput}>
														<TextInput
															value={
																selectedUser.userID
																	? selectedUser.referralCode
																	: selectedUser.venueOwnerID
																	? ""
																	: ""
															}
															onChangeText={(text) => {
																if (selectedUser.userID) {
																	setSelectedUser({
																		...selectedUser,
																		referralCode: text,
																	});
																} else if (selectedUser.venueOwnerID) {
																}
															}}
															style={{ width: "100%" }}
														/>
													</View>
												</View>
												<View style={{ marginBottom: 8 }}>
													<CustomText style={{ marginTop: 10 }}>
														{selectedUser.userID ? "Referral Points" : ""}
													</CustomText>
													<View style={styles.textInput}>
														<TextInput
															value={
																selectedUser.userID
																	? selectedUser.referralPoints.toString()
																	: ""
															}
															onChangeText={(text) => {
																if (selectedUser.userID) {
																	setSelectedUser({
																		...selectedUser,
																		referralPoints: parseInt(text),
																	});
																}
															}}
															style={{ width: "100%" }}
														/>
													</View>
												</View>
												<Button
													title="Edit User"
													color={COLORS.foam}
													filled
													onPress={() => handleEditUser()}
													style={{ marginTop: 20 }}
												/>
												<CustomEditAlert
													visible={isEditVisible}
													onClose={() => setIsEditVisible(false)}
													title={EditTitle}
													message={EditMessage}
												/>
											</View>
										</ScrollView>
									</View>
								)}
							</Modal>
						</View>
					</ScrollView>
				</SafeAreaView>
			</SafeAreaView>
		</View>
	);
};

const styles = StyleSheet.create({
	searchContainer: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginHorizontal: 20,
		marginVertical: 12,
	},
	searchInput: {
		flex: 1,
		height: 45,
		borderWidth: 1,
		borderColor: 0,
		borderRadius: 20,
		paddingHorizontal: 20,
		marginRight: 10,
		backgroundColor: COLORS.grey,
	},
	head: {
		height: 44,
		backgroundColor: COLORS.foam,
	},
	button: {
		paddingVertical: 10,
		borderColor: COLORS.black,
		borderWidth: 0,
		borderRadius: 12,
		alignItems: "center",
		justifyContent: "center",
	},
	textInput: {
		width: "100%",
		height: 45,
		borderColor: 0,
		borderWidth: 1,
		borderRadius: 12,
		alignItems: "center",
		justifyContent: "center",
		paddingLeft: 22,
		marginTop: 10,
		backgroundColor: COLORS.grey,
	},
});

export default ManageUsers;
