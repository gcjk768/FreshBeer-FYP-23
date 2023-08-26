import {
	AntDesign,
	Ionicons,
	MaterialIcons,
	Octicons,
} from "@expo/vector-icons";
import axios from "axios";
import CheckBox from "expo-checkbox";
import React, { useEffect, useState } from "react";
import {
	Image,
	Modal,
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";
import { Header } from "react-native-elements";
import { SafeAreaView } from "react-native-safe-area-context";
import { useCookies } from "../../CookieContext";
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
			<Text style={{ fontSize: 15, ...GlobalStyle.bodyFont, color: textColor }}>
				{props.title}
			</Text>
		</TouchableOpacity>
	);
};

// custom alert
const CustomAlert = ({ visible, onClose }) => {
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
						borderRadius: 40,
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
							fontWeight: "bold",
							alignSelf: "center",
							marginBottom: 20,
						}}
					>
						Success
					</Text>
					<Text style={{ fontSize: 16, marginBottom: 20, alignSelf: "center" }}>
						Profile updated!
					</Text>
					<TouchableOpacity
						style={{
							backgroundColor: COLORS.foam,
							padding: 10,
							borderRadius: 8,
							alignItems: "center",
							marginHorizontal: 22,
						}}
						onPress={onClose}
					>
						<Text
							style={{ color: COLORS.black, fontWeight: "bold", fontSize: 16 }}
						>
							OK
						</Text>
					</TouchableOpacity>
				</View>
			</View>
		</Modal>
	);
};

const Profile = ({ navigation }) => {
	const [userID, setUserID] = useState("");
	const [username, setUsername] = useState("");
	const [email, setEmail] = useState("");
	const [mobileNumber, setMobileNumber] = useState("");
	const [password, setPassword] = useState("");
	const [isPasswordShown, setIsPasswordShown] = useState(false);
	const [receiveNotification, setReceiveNotification] = useState(false);
	const { cookies } = useCookies();
	const [isDialogVisible, setIsDialogVisible] = useState(false);
	const [editMode, setEditMode] = useState(false);

	useEffect(() => {
		const sessionToken = cookies.sessionToken;
		const userID = cookies.userID;
		console.log(sessionToken);
		console.log(userID);

		const fetchUserData = async () => {
			try {
				const response = await axios.post("https://fresh-beer-near-me-6e244313be42.herokuapp.com/getUserData", {
					userID,
				});

				const userData = response.data;
				const { username, email, mobileNumber, password, receiveNotification } =
					userData;

				setUserID(userID);
				setUsername(username);
				setEmail(email);
				setMobileNumber(mobileNumber);
				setPassword(password);
				setReceiveNotification(receiveNotification);
			} catch (error) {
				console.error("Error fetching user data:", error);
			}
		};

		fetchUserData();
	}, []);

	//Function for save changes button
	const saveChanges = async () => {
		try {
			const newData = {
				userID: userID,
				username: username,
				password: password,
				email: email,
				mobileNumber: mobileNumber,
				receiveNotification: receiveNotification,
			};
			// Make a POST request to the /updateProfile endpoint with the new data
			const response = await axios.post(
				"https://fresh-beer-near-me-6e244313be42.herokuapp.com/editProfile",
				newData
			);

			// Handle the response
			if (response.data.success) {
				console.log("Profile updated successfully");
				setIsDialogVisible(true);
			} else {
				console.log("No changes made to profile!");
			}
		} catch (error) {
			console.error("Error updating profile:", error.message);
		}
	};

	const handleCloseDialog = () => {
		setIsDialogVisible(false);
	};

	// function to handle "edit profile"
	const handleEditProfile = () => {
		setEditMode(!editMode);
	};

	return (
		<ScrollView contentContainerStyle={{ flexGrow: 1, height: 950 }}>
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
						<View
							style={{
								flexDirection: "row",
							}}
						>
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
				/>

				<View
					style={{
						flexDirection: "row",
						alignItems: "center",
						marginHorizontal: 32,
						marginTop: 5,
					}}
				>
					<Text
						style={{
							fontSize: 24,
							...GlobalStyle.headerFont,
							marginTop: 20,
							marginHorizontal: 12,
						}}
					>
						My Profile
					</Text>
					<AntDesign
						name="edit"
						size={24}
						color={COLORS.black}
						onPress={handleEditProfile}
						style={{ marginTop: 15, marginLeft: "auto" }}
					/>
				</View>
				<View
					style={{
						justifyContent: "center",
						alignItems: "center",
						marginHorizontal: 32,
						marginTop: 5,
					}}
				>
					<Image
						source={require("../../assets/beer.png")}
						style={{
							height: 140,
							width: 140,
							borderRadius: 85,
							borderWidth: 5,
							borderColor: COLORS.primary,
						}}
					/>
					<View
						style={{
							position: "absolute",
							bottom: 0,
							right: 80,
							zIndex: 9999,
						}}
					>
						<MaterialIcons
							name="photo-camera"
							size={32}
							color={COLORS.primary}
						/>
					</View>
				</View>

				<View style={{ flex: 1, marginHorizontal: 32, marginBottom: 12 }}>
					<View style={{ marginBottom: 8 }}>
						<Text
							style={{
								fontSize: 14,
								...GlobalStyle.bodyFont,
								marginTop: 10,
							}}
						>
							Username
						</Text>

						<View
							style={{
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
							}}
						>
							<TextInput
								value={username}
								onChangeText={setUsername}
								placeholder="Username"
								placeholderTextColor={COLORS.black}
								keyboardType="default"
								style={{
									width: "100%",
									color: editMode,
								}}
								editable={editMode}
								disabled={!editMode}
							></TextInput>
						</View>
					</View>

					<View style={{ marginBottom: 8 }}>
						<Text
							style={{
								fontSize: 14,
								...GlobalStyle.bodyFont,
								marginTop: 10,
							}}
						>
							Email
						</Text>

						<View
							style={{
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
							}}
						>
							<TextInput
								value={email}
								onChangeText={setEmail}
								placeholder="Email"
								placeholderTextColor={COLORS.black}
								keyboardType="email-address"
								style={{
									width: "100%",
									color: editMode,
								}}
								editable={editMode}
								disabled={!editMode}
							></TextInput>
						</View>
					</View>

					<View style={{ marginBottom: 8 }}>
						<Text
							style={{
								fontSize: 14,
								...GlobalStyle.bodyFont,
								marginTop: 10,
							}}
						>
							Mobile Number
						</Text>

						<View
							style={{
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
							}}
						>
							<TextInput
								value={mobileNumber}
								onChangeText={setMobileNumber}
								placeholder="Mobile Number"
								placeholderTextColor={COLORS.black}
								keyboardType="default"
								style={{
									width: "100%",
									color: editMode,
								}}
								editable={editMode}
								disabled={!editMode}
							></TextInput>
						</View>
					</View>

					<View style={{ marginBottom: 12 }}>
						<Text
							style={{
								fontSize: 14,
								...GlobalStyle.bodyFont,
								marginTop: 10,
							}}
						>
							Password
						</Text>

						<View
							style={{
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
							}}
						>
							<TextInput
								placeholder="Password"
								value={password}
								onChangeText={setPassword}
								placeholderTextColor={COLORS.black}
								secureTextEntry={!isPasswordShown}
								style={{
									width: "100%",
									color: editMode,
								}}
								editable={editMode}
								disabled={!editMode}
							/>

							<TouchableOpacity
								onPress={() => setIsPasswordShown(!isPasswordShown)}
								style={{
									position: "absolute",
									right: 12,
								}}
							>
								<Ionicons
									name={isPasswordShown ? "eye" : "eye-off"}
									size={24}
									color={COLORS.black}
								/>
							</TouchableOpacity>
						</View>
					</View>

					<View style={styles.checkboxContainer}>
						<CheckBox
							value={receiveNotification}
							onValueChange={setReceiveNotification}
							tintColors={COLORS.black}
							style={{
								marginRight: 5,
								color: editMode,
							}}
							editable={editMode}
							disabled={!editMode}
						/>
						<Text style={[GlobalStyle.bodyFont, styles.checkboxLabel]}>
							Receive notifications for new releases, events & personalized
							recommendations
						</Text>
					</View>

					<Button
						title="Save Changes"
						onPress={saveChanges}
						color={COLORS.foam}
						filled
						style={{
							marginTop: 10,
							marginBottom: 4,
							elevation: 2,
						}}
					></Button>
					<CustomAlert visible={isDialogVisible} onClose={handleCloseDialog} />
				</View>
			</SafeAreaView>
		</ScrollView>
	);
};

const styles = StyleSheet.create({
	inputContainer: {
		marginVertical: 10,
	},
	label: {
		fontSize: 16,
		fontWeight: "bold",
	},
	input: {
		height: 40,
		borderWidth: 1,
		borderRadius: 5,
		paddingHorizontal: 10,
	},
	checkboxContainer: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 12,
	},
	checkbox: {
		marginRight: 5, // Adjusted value for closer spacing
	},
	checkboxLabel: {
		color: COLORS.black,
		marginHorizontal: 12,
		fontSize: 13,
	},
	button: {
		marginTop: 20,
		paddingVertical: 10,
		alignItems: "center",
		borderColor: COLORS.black,
		borderRadius: 20,
		width: "50%",
		alignSelf: "center",
	},
});

export default Profile;
