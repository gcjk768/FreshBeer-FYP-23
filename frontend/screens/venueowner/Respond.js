import { Ionicons, MaterialIcons, Octicons } from "@expo/vector-icons";
import axios from "axios";
import React, { useEffect, useState } from "react";
import {
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

const CustomText = (props) => {
	return (
		<Text style={{ ...GlobalStyle.bodyFont, ...props.style }}>
			{props.children}
		</Text>
	);
};

// custom alert for submitting response
const CustomResponseAlert = ({ visible, onClose, title, message }) => {
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

const Respond = ({ navigation, route }) => {
	const { cookies } = useCookies();
	const { feedbackData } = route.params;
	const [username, setUsername] = useState("");
	const [feedbackResponse, setFeedbackResponse] = useState("");
	const [isResponseVisible, setIsResponseVisible] = useState(false);
	const [ResponseTitle, setResponseTitle] = useState("");
	const [ResponseMessage, setResponseMessage] = useState("");

	useEffect(() => {
		const sessionToken = cookies.sessionToken;
		const venueOwnerID = cookies.venueOwnerID;
		setUsername(cookies.username);
	}, []);

	const replyFeedback = () => {
		const data = {
			feedbackID: feedbackData.feedback.feedbackID,
			feedbackResponse: feedbackResponse,
		};

		axios
			.post("https://fresh-beer-near-me-6e244313be42.herokuapp.com/replyFeedback", data)
			.then((response) => {
				if (response.data.success) {
					setResponseTitle("Success");
					setResponseMessage("Feedback responded!");
				} else {
					const { message } = response.data;
					setResponseTitle("Error");
					setResponseMessage(message);
				}
				setIsResponseVisible(true);
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
							<TouchableOpacity>
								<Ionicons
									name="notifications-outline"
									size={24}
									color={COLORS.black}
									style={{ marginRight: 10 }}
								/>
							</TouchableOpacity>
							<TouchableOpacity onPress={() => navigation.navigate("Welcome")}>
								<MaterialIcons name="logout" size={24} color={COLORS.black} />
							</TouchableOpacity>
						</View>
					}
				/>

				<SafeAreaView style={{ flex: 1 }}>
					<ScrollView contentContainerStyle={{ flexGrow: 1 }}>
						<View style={{ marginHorizontal: 22 }}>
							<Text style={{ fontSize: 18, ...GlobalStyle.headerFont }}>
								Users' Feedback
							</Text>
							<View
								style={{
									marginVertical: 10,
									backgroundColor: COLORS.secondary,
									padding: 10,
									borderRadius: 12,
									borderWidth: 1,
									elevation: 2,
									borderColor: 0,
								}}
							>
								<CustomText>
									{feedbackData.feedback.feedbackDescription}
								</CustomText>
							</View>

							<View
								style={{
									flexDirection: "column",
									height: 200,
									width: "100%",
									elevation: 2,
									backgroundColor: COLORS.grey,
									marginTop: 10,
									borderRadius: 15,
									borderColor: 0,
									marginBottom: 10,
									paddingHorizontal: 12,
								}}
							>
								<Text
									style={{
										fontSize: 15,
										...GlobalStyle.headerFont,
										marginTop: 20,
										marginLeft: 12,
									}}
								>
									Respond:
								</Text>
								<View
									style={{
										flex: 1,
										borderColor: 0,
										borderWidth: 1,
										borderRadius: 12,
										resizeMode: "contain",
										paddingLeft: 12,
										marginTop: 10,
										backgroundColor: COLORS.grey,
									}}
								>
									<TextInput
										placeholder="Write your responses here"
										style={{ ...GlobalStyle.bodyFont }}
										value={feedbackResponse}
										onChangeText={setFeedbackResponse}
										multiline
									></TextInput>
								</View>
							</View>

							<View style={{ marginTop: 5 }}>
								<Button
									title="Submit response"
									onPress={replyFeedback}
									filled
									style={{
										elevation: 2,
										borderColor: 0,
									}}
								/>
							</View>
							<CustomResponseAlert
								visible={isResponseVisible}
								onClose={() => setIsResponseVisible(false)}
								title={ResponseTitle}
								message={ResponseMessage}
							/>
						</View>
					</ScrollView>
				</SafeAreaView>
			</SafeAreaView>
		</View>
	);
};

const styles = StyleSheet.create({
	button: {
		paddingVertical: 10,
		borderColor: COLORS.black,
		borderWidth: 1,
		borderRadius: 12,
		alignItems: "center",
		justifyContent: "center",
	},
});

export default Respond;
