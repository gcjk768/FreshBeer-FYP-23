import { Ionicons, MaterialIcons, Octicons } from "@expo/vector-icons";
import axios from "axios";
import React, { useEffect, useState } from "react";
import {
	Alert,
	Image,
	ScrollView,
	StyleSheet,
	Text,
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
	const textColor = COLORS.black;

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
					fontSize: 12,
					...GlobalStyle.bodyFont,
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

const InquiriesNFeedback = ({ navigation }) => {
	const { cookies } = useCookies();
	const [username, setUsername] = useState("");

	const [feedbackData, setFeedbackData] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		setUsername(cookies.username);
		axios
			.get("https://fresh-beer-near-me-6e244313be42.herokuapp.com/getFeedback", {
				params: {
					venueOwnerID: cookies.venueOwnerID,
				},
			})
			.then((response) => {
				const { feedbacks } = response.data;
				setFeedbackData(feedbacks);
				setLoading(false);
			})
			.catch((error) => {
				console.error("Error retrieving data", error);
				setLoading(false);
			});
	}, []);

	const navigateToRespond = (feedbackItem) => {
		navigation.navigate("Respond", { feedbackData: feedbackItem });
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
							<TouchableOpacity onPress={() => console.log(feedbackData)}>
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
					{loading ? (
						<View style={{ alignItems: "center" }}>
							<Text>Loading...</Text>
						</View>
					) : (
						<ScrollView contentContainerStyle={{ paddingBottom: 30 }}>
							<View style={{ marginHorizontal: 22 }}>
								<Text
									style={{
										fontSize: 18,
										...GlobalStyle.headerFont,
										marginBottom: 12,
									}}
								>
									Users' Feedback
								</Text>

								{feedbackData.map((feedbackItem, index) => (
									<View
										key={index}
										style={{
											flexDirection: "row",
											justifyContent: "space-between",
											elevation: 2,
										}}
									>
										<View
											style={{
												width: "100%",
												borderColor: 0,
												paddingHorizontal: 20,
												paddingVertical: 10,
												borderRadius: 5,
												backgroundColor: COLORS.white,
												elevation: 2,
											}}
										>
											<View
												style={{ flexDirection: "row", alignItems: "center" }}
											>
												<Image
													source={require("../../assets/beer.png")}
													style={{
														width: 60,
														height: 60,
														borderRadius: 80,
														backgroundColor: COLORS.grey,
														alignSelf: "flex-start",
													}}
													resizeMode="contain"
												/>
												<View
													style={{ flexDirection: "column", marginLeft: 15 }}
												>
													<Text
														style={{ ...GlobalStyle.headerFont, fontSize: 15 }}
													>
														{feedbackItem.feedback.username}
													</Text>
												</View>
											</View>
											<View
												style={{
													flexDirection: "row",
													justifyContent: "space-between",
												}}
											>
												<Text style={{ flex: 1, ...GlobalStyle.headerFont }}>
													{feedbackItem.venueName}
												</Text>
												<Text
													style={{
														alignItems: "flex-end",
														color: "#A0A5BD",
														...GlobalStyle.headerFont,
													}}
												>
													{feedbackItem.feedback.feedbackDate}
												</Text>
											</View>

											<CustomText>
												{feedbackItem.feedback.feedbackDescription}
											</CustomText>
											<View style={{ flex: 1, alignItems: "flex-end" }}>
												<Button
													title={
														feedbackItem.feedback.feedbackResponseBool
															? "Responded"
															: "Respond"
													}
													onPress={
														feedbackItem.feedback.feedbackResponseBool
															? null // If feedbackResponseBool is true, make the button unclickable
															: () => navigateToRespond(feedbackItem)
													}
													disabled={feedbackItem.feedback.feedbackResponseBool}
													filled
													style={
														feedbackItem.feedback.feedbackResponseBool
															? styles.respondedButton // Use the greyed-out style if already responded
															: styles.notRespondedButton //
													}
												></Button>
											</View>
										</View>
									</View>
								))}
							</View>
						</ScrollView>
					)}
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
	respondedButton: {
		width: "30%",
		backgroundColor: COLORS.grey,
		paddingVertical: 10,
		borderColor: COLORS.black,
		borderWidth: 1,
		borderRadius: 12,
		alignItems: "center",
		justifyContent: "center",
	},
	notRespondedButton: {
		width: "30%",
		backgroundColor: COLORS.foam,
		paddingVertical: 10,
		borderColor: COLORS.black,
		borderWidth: 1,
		borderRadius: 12,
		alignItems: "center",
		justifyContent: "center",
	},
});

export default InquiriesNFeedback;
