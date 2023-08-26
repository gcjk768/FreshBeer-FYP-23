import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import React, { useEffect, useState } from "react";
import {
	Alert,
	Image,
	Modal,
	Pressable,
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import SelectDropdown from "react-native-select-dropdown";
import { useCookies } from "../CookieContext";
import COLORS from "../constants/colors";
import GlobalStyle from "../utils/GlobalStyle";

// CODES TO STYLE BUTTON
const Button = (props) => {
	const filledBgColor = props.color || COLORS.yellow;
	const outlinedColor = COLORS.white;
	const bgColor = props.filled ? filledBgColor : outlinedColor;
	const textColor = props.filled ? COLORS.black : COLORS.primary;

	return (
		<TouchableOpacity
			style={{
				...styles.button,
				...{ backgroundColor: bgColor },
				...props.style,
			}}
			onPress={props.onPress}
		>
			<Text
				style={{
					fontSize: 15,
					...GlobalStyle.headerFont,
					...{ color: textColor },
				}}
			>
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
						Login Failed
					</Text>
					<Text style={{ fontSize: 16, marginBottom: 20 }}>
						Unable to login! Please enter a valid user account credentials
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

// CODES FOR THE MAIN PAGE
const Welcome = ({ navigation }) => {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [isPasswordShown, setIsPasswordShown] = useState(false);
	const [isChecked, setIsChecked] = useState(false);
	const { setCookies } = useCookies();
	const [selected, setSelected] = useState("");
	const data = ["User", "Venue Owner", "Admin"];
	const [isDialogVisible, setIsDialogVisible] = useState(false);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const freshnessResponse = await axios.post(
					"https://fresh-beer-near-me-6e244313be42.herokuapp.com/readCSV"
				);
			} catch (error) {
				console.log("An error occurred:", error.message);
			}
		};

		fetchData();
	}, []);

	const handleUserLogin = async () => {
		try {
			const response = await axios.post("https://fresh-beer-near-me-6e244313be42.herokuapp.com/userLogin", {
				username: username,
				password: password,
			});

			if (response.data.success) {
				const { userID, username } = response.data;
				const sessionToken = "testtoken123";
				setCookies({ sessionToken, userID, username });
				navigation.navigate("BottomTabNavigation", { screen: "Dashboard" });
			} else {
				const { message } = response.data;
				console.log("Login failed:", message);
				setIsDialogVisible(true);
			}
		} catch (error) {
			console.log("An error occurred:", error.message);
		}
	};

	const handleVenueOwnerLogin = async () => {
		try {
			const response = await axios.post(
				"https://fresh-beer-near-me-6e244313be42.herokuapp.com/venueOwnerLogin",
				{
					username: username,
					password: password,
				}
			);

			if (response.data.success) {
				const { venueOwnerID, username } = response.data;
				const sessionToken = "testtoken123";
				setCookies({ sessionToken, venueOwnerID, username });
				navigation.navigate("VenueOwnerHome");
			} else {
				const { message } = response.data;
				console.log("Login failed:", message);
				setIsDialogVisible(true);
			}
		} catch (error) {
			console.log("An error occurred:", error.message);
		}
	};

	const handleAdminLogin = async () => {
		try {
			const response = await axios.post("https://fresh-beer-near-me-6e244313be42.herokuapp.com/adminLogin", {
				username: username,
				password: password,
			});

			if (response.data.success) {
				const { adminID, username } = response.data;
				const sessionToken = "testtoken123";
				setCookies({ sessionToken, adminID, username });
				navigation.navigate("AdminDashboard");
			} else {
				const { message } = response.data;
				console.log("Login failed:", message);
				setIsDialogVisible(true);
			}
		} catch (error) {
			console.log("An error occurred:", error.message);
		}
	};

	const handleLogin = () => {
		if (selected === "User") {
			handleUserLogin();
		} else if (selected === "Venue Owner") {
			handleVenueOwnerLogin();
		} else if (selected === "Admin") {
			handleAdminLogin();
		}
	};

	const handleCloseDialog = () => {
		setIsDialogVisible(false);
	};

	return (
		<SafeAreaView style={{ flex: 1 }} backgroundColor={COLORS.foam}>
			<View style={{ marginTop: 50 }}>
				<Image
					source={require("../assets/freshbeer.png")}
					style={{
						height: 250,
						width: 270,
						alignSelf: "center",
						resizeMode: "contain",
					}}
				></Image>
			</View>

			<View style={{ paddingHorizontal: 20, marginHorizontal: 22 }}>
				<View style={{ marginBottom: 12 }}>
					<View
						style={{
							width: "100%",
							height: 50,
							borderRadius: 12,
							alignItems: "center",
							justifyContent: "center",
							paddingLeft: 22,
							marginBottom: 15,
							backgroundColor: COLORS.secondary,
						}}
					>
						<TextInput
							value={username}
							onChangeText={setUsername}
							placeholder="Username"
							placeholderTextColor={COLORS.black}
							keyboardType="default"
							style={{ width: "100%" }}
						></TextInput>
					</View>

					<View
						style={{
							width: "100%",
							height: 50,
							borderRadius: 12,
							alignItems: "center",
							justifyContent: "center",
							paddingLeft: 22,
							marginBottom: 15,
							backgroundColor: COLORS.secondary,
						}}
					>
						<TextInput
							value={password}
							onChangeText={setPassword}
							placeholder="Password"
							placeholderTextColor={COLORS.black}
							secureTextEntry={!isPasswordShown}
							style={{ width: "100%" }}
						></TextInput>

						<TouchableOpacity
							onPress={() => setIsPasswordShown(!isPasswordShown)}
							style={{ position: "absolute", right: 12 }}
						>
							{isPasswordShown == true ? (
								<Ionicons name="eye" size={24} color={COLORS.black}></Ionicons>
							) : (
								<Ionicons
									name="eye-off"
									size={24}
									color={COLORS.black}
								></Ionicons>
							)}
						</TouchableOpacity>
					</View>
				</View>

				<View style={{ marginTop: 22 }}>
					<SelectDropdown
						data={data}
						onSelect={(selected) => {
							setSelected(selected);
						}}
						buttonTextAfterSelection={(selected, index) => {
							return selected;
						}}
						defaultButtonText="Select user"
						buttonStyle={{
							width: "100%",
							height: 50,
							borderRadius: 12,
							justifyContent: "center",
							alignItems: "center",
							backgroundColor: COLORS.secondary,
						}}
						buttonTextStyle={{ ...GlobalStyle.bodyFont, fontSize: 14 }}
						dropdownStyle={{ borderRadius: 12 }}
						rowTextStyle={{ ...GlobalStyle.bodyFont, fontSize: 14 }}
						renderDropdownIcon={() => (
							<CustomText style={{ fontSize: 20 }}>▼</CustomText>
						)}
					/>
				</View>

				<View style={{ flexDirection: "row", justifyContent: "center" }}>
					<Button
						title="Login"
						onPress={handleLogin}
						color={COLORS.secondary}
						filled
						style={{
							width: "100%",
							marginVertical: 12,
						}}
					></Button>
					<CustomAlert visible={isDialogVisible} onClose={handleCloseDialog} />
				</View>

				<View style={{ flexDirection: "row", justifyContent: "center" }}>
					<CustomText style={{ fontSize: 16 }}>
						Don't have an account?
					</CustomText>
					<TouchableOpacity onPress={() => navigation.navigate("Signup")}>
						<Text
							style={{
								fontSize: 16,
								...GlobalStyle.headerFont,
								marginLeft: 6,
							}}
						>
							Register
						</Text>
					</TouchableOpacity>
				</View>
			</View>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	button: {
		paddingBottom: 10,
		paddingVertical: 10,
		borderColor: 0,
		borderWidth: 2,
		borderRadius: 12,
		alignItems: "center",
		justifyContent: "center",
	},
});
export default Welcome;
