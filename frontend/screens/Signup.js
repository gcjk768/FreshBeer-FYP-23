import { Ionicons, MaterialIcons, Octicons } from "@expo/vector-icons";
import axios from "axios";
import CheckBox from "expo-checkbox";
import React, { useState } from "react";
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
import { Header } from "react-native-elements";
import { SafeAreaView } from "react-native-safe-area-context";
import COLORS from "../constants/colors";
import GlobalStyle from "../utils/GlobalStyle";

// Button component
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
			<Text
				style={{
					fontSize: 16,
					...GlobalStyle.headerFont,
					color: textColor,
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
						Account Signup Success
					</Text>
					<Text style={{ fontSize: 16, marginBottom: 20 }}>
						Your account has been successfully created!
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

// Signup component
const Signup = ({ navigation }) => {
	const ageRestriction = 18;
	const [isPasswordShown, setIsPasswordShown] = useState(false);
	const [isChecked, setIsChecked] = useState(false);
	const [username, setUsername] = useState("");
	const [email, setEmail] = useState("");
	const [mobileNumber, setMobileNumber] = useState("");
	const [password1, setPassword1] = useState("");
	const [password2, setPassword2] = useState("");
	const [isDialogVisible, setIsDialogVisible] = useState(false);

	const handleSignUp = () => {
		if (!username) {
			// Username is missing
		} else if (!mobileNumber) {
			// Mobile number is missing
			Alert.alert("Missing Mobile Number", "Please enter your mobile number.");
		} else if (isChecked) {
			if (password1 !== password2) {
				// Passwords do not match
				Alert.alert(
					"Password Mismatch",
					"Please make sure your passwords match."
				);
			} else {
				// Passwords match, send signup request
				axios
					.post("https://fresh-beer-near-me-6e244313be42.herokuapp.com/signup", {
						username: username,
						password: password1,
						email: email,
						mobileNumber: mobileNumber,
					})
					.then((response) => {
						if (response.data.success) {
							// Handle success response
							setIsDialogVisible(true);
							console.log("Account Signup success");
							navigation.navigate("Welcome");
						} else {
							// Display specific error message based on response
							if (response.data.message === "Username already exists") {
								Alert.alert(
									"Username is Taken",
									"Please choose a different username."
								);
							} else if (response.data.message === "Email already exists") {
								Alert.alert(
									"Email is Taken",
									"Please use a different email address."
								);
							} else if (
								response.data.message === "Mobile number already exists"
							) {
								Alert.alert(
									"Mobile Number is Taken",
									"Please use a different mobile number."
								);
							} else {
								Alert.alert("Signup Error", "An error occurred during signup.");
							}
						}
					})
					.catch((error) => {
						// Handle error response
						console.error(error);
						Alert.alert("Signup Error", "An error occurred during signup.");
					});
			}
		} else {
			// Age restriction not met
			Alert.alert(
				"Age Restriction",
				`You must be over ${ageRestriction} years old to sign up.`
			);
		}
	};

	const handleCloseDialog = () => {
		setIsDialogVisible(false);
	};

	return (
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

			<ScrollView>
				<View style={{ flex: 1, marginHorizontal: 32, marginBottom: 12 }}>
					<View style={{ marginBottom: 8 }}>
						<Text
							style={{
								fontSize: 24,
								...GlobalStyle.headerFont,
								marginTop: 12,
								textAlign: "center",
							}}
						>
							Create Account
						</Text>

						<CustomText
							style={{
								textAlign: "center",
								marginBottom: 12,
							}}
						>
							Welcome to Fresh Beer Near Me!
						</CustomText>
					</View>

					<View style={{ marginBottom: 8 }}>
						<CustomText style={{ marginTop: 10 }}>Username</CustomText>
						<View
							style={{
								width: "100%",
								height: 50,
								borderColor: 0,
								borderWidth: 1,
								borderRadius: 12,
								alignItems: "center",
								justifyContent: "center",
								paddingLeft: 22,
								marginTop: 8,
								backgroundColor: COLORS.grey,
							}}
						>
							<TextInput
								placeholder="Enter your username"
								keyboardType="default"
								style={{
									width: "100%",
								}}
								value={username}
								onChangeText={setUsername}
							/>
						</View>
					</View>

					<View style={{ marginBottom: 12 }}>
						<CustomText style={{ marginTop: 10 }}>Email</CustomText>
						<View
							style={{
								width: "100%",
								height: 50,
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
								placeholder="Enter your email address"
								keyboardType="default"
								style={{
									width: "100%",
								}}
								value={email}
								onChangeText={setEmail}
							/>
						</View>
					</View>

					<View style={{ marginBottom: 12 }}>
						<CustomText style={{ marginTop: 10 }}>Mobile Number</CustomText>
						<View
							style={{
								width: "100%",
								height: 50,
								borderColor: 0,
								borderWidth: 1,
								borderRadius: 12,
								alignItems: "center",
								justifyContent: "space-between",
								flexDirection: "row",
								paddingLeft: 22,
								marginTop: 10,
								backgroundColor: COLORS.grey,
							}}
						>
							<Text
								style={{
									fontSize: 14,
									width: "15%",
									borderRightWidth: 1,
									borderLeftColor: COLORS.black,
									marginVertical: 8,
									alignItems: "center",
									color: COLORS.black,
								}}
							>
								+65
							</Text>

							<TextInput
								placeholder="Enter your phone number"
								keyboardType="numeric"
								style={{
									width: "80%",
								}}
								value={mobileNumber}
								onChangeText={setMobileNumber}
							/>
						</View>
					</View>

					<View style={{ marginBottom: 12 }}>
						<CustomText style={{ marginTop: 10 }}>Password</CustomText>
						<View
							style={{
								width: "100%",
								height: 50,
								borderColor: 0,
								borderWidth: 1,
								borderRadius: 12,
								alignItems: "center",
								justifyContent: "center",
								paddingLeft: 22,
								marginTop: 10,
								backgroundColor: COLORS.grey,
								flexDirection: "row",
							}}
						>
							<TextInput
								placeholder="Enter your password"
								secureTextEntry={!isPasswordShown}
								style={{
									flex: 1,
								}}
								value={password1}
								onChangeText={setPassword1}
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

					<View style={{ marginBottom: 12 }}>
						<CustomText style={{ marginTop: 10 }}>Confirm Password</CustomText>
						<View
							style={{
								width: "100%",
								height: 50,
								borderColor: 0,
								borderWidth: 1,
								borderRadius: 12,
								alignItems: "center",
								justifyContent: "center",
								paddingLeft: 22,
								marginTop: 10,
								backgroundColor: COLORS.grey,
								flexDirection: "row",
							}}
						>
							<TextInput
								placeholder="Re-enter your password"
								secureTextEntry={!isPasswordShown}
								style={{
									flex: 1,
								}}
								value={password2}
								onChangeText={setPassword2}
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

					<View
						style={{
							flexDirection: "row",
							marginVertical: 12,
							alignItems: "center",
						}}
					>
						<CheckBox
							style={{ marginRight: 8 }}
							value={isChecked}
							onValueChange={setIsChecked}
							color={isChecked ? COLORS.black : undefined}
						/>

						<CustomText>I am above 18</CustomText>
					</View>

					<Button
						title="Sign Up"
						filled
						onPress={handleSignUp}
						style={{
							marginTop: 15,
							width: "100%",
						}}
					/>
					<CustomAlert visible={isDialogVisible} onClose={handleCloseDialog} />

					<View
						style={{
							flexDirection: "row",
							justifyContent: "center",
							marginVertical: 22,
						}}
					>
						<CustomText style={{ fontSize: 16 }}>
							Already have an account?
						</CustomText>
						<TouchableOpacity onPress={() => navigation.navigate("Welcome")}>
							<Text
								style={{
									fontSize: 16,
									...GlobalStyle.headerFont,
									marginLeft: 6,
								}}
							>
								Login
							</Text>
						</TouchableOpacity>
					</View>
				</View>
			</ScrollView>
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

export default Signup;
