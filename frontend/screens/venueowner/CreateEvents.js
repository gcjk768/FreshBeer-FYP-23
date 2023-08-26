import {
	AntDesign,
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

// custom alert for removing event posts
const CustomEventAlert = ({ visible, onClose, title, message }) => {
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

const CreateEvents = ({ navigation }) => {
	const { cookies } = useCookies();
	const [eventData, setEventData] = useState([]);
	const [isModalVisible, setIsModalVisible] = useState(false);
	const [selectedEvent, setSelectedEvent] = useState(null);
	const [isEventVisible, setIsEventVisible] = useState(false);
	const [EventTitle, setEventTitle] = useState("");
	const [EventMessage, setEventMessage] = useState("");

	const toggleModal = () => {
		setIsModalVisible(!isModalVisible);
	};

	const handleRemove = (eventID) => {
		const data = {
			eventID: eventID,
		};
		axios
			.post("https://fresh-beer-near-me-6e244313be42.herokuapp.com/removeEvent", data)
			.then((response) => {
				if (response.data.success) {
					setEventTitle("Success");
					setEventMessage("Event successfully removed!");
					toggleModal();
				} else {
					const { message } = response.data;
					toggleModal();
					setEventTitle("Error");
					setEventMessage(message);
				}
				setIsEventVisible(true);
			})
			.catch((error) => {
				console.error(error);
			});
	};

	useEffect(() => {
		axios
			.get("https://fresh-beer-near-me-6e244313be42.herokuapp.com/getEvent", {
				params: {
					venueOwnerID: cookies.venueOwnerID,
				},
			})
			.then((response) => {
				setEventData(response.data);
			})
			.catch((error) => {
				console.error("Error retrieving Event", error);
			});
	}, [handleRemove]);

	return (
		<View style={{ flex: 1 }}>
			<SafeAreaView style={{ flex: 1, backgroundColor: COLORS.secondary }}>
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
					<ScrollView>
						<View
							style={{
								flexDirection: "row",
								justifyContent: "flex-end",
								alignItems: "center",
								marginHorizontal: 20,
							}}
						>
							<Button
								title="Create events"
								color={COLORS.foam}
								filled
								style={{
									width: "40%",
									height: 50,
									borderRadius: 10,
									marginLeft: 10,
								}}
								onPress={() => navigation.navigate("CreatePromotion")}
							/>
						</View>
						<View style={{ marginHorizontal: 20 }}>
							{eventData.map((event, index) => (
								<View key={index} style={styles.container}>
									<View style={{ marginHorizontal: 12 }}>
										<View
											style={{
												flexDirection: "row",
												justifyContent: "space-between",
												alignItems: "center",
												backgroundColor: COLORS.grey,
												marginTop: 5,
											}}
										>
											<Text style={{ ...GlobalStyle.headerFont, fontSize: 18 }}>
												{event.eventTitle}
											</Text>

											<TouchableOpacity
												onPress={() => {
													setSelectedEvent(event);
													toggleModal();
												}}
											>
												<AntDesign name="delete" size={24} color="red" />
											</TouchableOpacity>
										</View>
										<Text
											style={{
												...GlobalStyle.headerFont,
												fontSize: 14,
											}}
										>
											{event.eventDate}
										</Text>
										<Text style={{ marginTop: 10, ...GlobalStyle.headerFont }}>
											Description:
										</Text>
										<CustomText>{event.eventDescription}</CustomText>
									</View>
								</View>
							))}
						</View>
					</ScrollView>

					<Modal visible={isModalVisible} transparent animationType="fade">
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
									Are you sure you want to remove?
								</Text>
								<CustomText
									style={{
										alignSelf: "center",
										marginBottom: 20,
									}}
								>
									Title: {selectedEvent?.eventTitle}
								</CustomText>
								<CustomText
									style={{
										alignSelf: "center",
										marginBottom: 20,
									}}
								>
									Date: {selectedEvent?.eventDate}
								</CustomText>
								<CustomText
									style={{
										alignSelf: "center",
										marginBottom: 20,
									}}
								>
									Description: {selectedEvent?.eventDescription}
								</CustomText>
								<View
									style={{
										flexDirection: "row",
										justifyContent: "space-between",
									}}
								>
									<Button
										title="Cancel"
										onPress={toggleModal}
										color={COLORS.foam}
										filled
										style={{
											width: "40%",
											borderRadius: 10,
											marginTop: 15,
											borderColor: 0,
											elevation: 2,
										}}
									/>
									<Button
										title="Remove"
										color={COLORS.foam}
										filled
										style={{
											width: "40%",
											borderRadius: 10,
											marginTop: 15,
											borderColor: 0,
											elevation: 2,
										}}
										onPress={() => {
											handleRemove(selectedEvent.eventID);
										}}
									/>
									<CustomEventAlert
										visible={isEventVisible}
										onClose={() => setIsEventVisible(false)}
										title={EventTitle}
										message={EventMessage}
									/>
								</View>
							</View>
						</View>
					</Modal>
				</SafeAreaView>
			</SafeAreaView>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		backgroundColor: COLORS.grey,
		flexDirection: "column",
		width: "100%",
		borderRadius: 26,
		padding: 10,
		borderWidth: 1,
		borderColor: 0,
		marginVertical: 12,
	},
	button: {
		paddingVertical: 10,
		borderColor: COLORS.grey,
		borderWidth: 1,
		borderRadius: 12,
		alignItems: "center",
		justifyContent: "center",
	},
});

export default CreateEvents;
