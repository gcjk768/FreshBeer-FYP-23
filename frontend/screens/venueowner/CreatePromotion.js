import { Ionicons, MaterialIcons, Octicons } from "@expo/vector-icons";
import DatePicker from "@react-native-community/datetimepicker";
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

// custom alert for successful event creations
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

const CreatePromotion = ({ navigation }) => {
	const { cookies } = useCookies();
	const [title, setTitle] = useState("");
	const [date, setDate] = useState(new Date());
	const [description, setDescription] = useState("");
	const [showDatePicker, setShowDatePicker] = useState(false);
	const [errorMessage, setErrorMessage] = useState("");
	const [isEventVisible, setIsEventVisible] = useState(false);
	const [EventTitle, setEventTitle] = useState("");
	const [EventMessage, setEventMessage] = useState("");

	const handleClearButton = () => {
		setTitle("");
		setDate(new Date());
		setDescription("");
	};

	const handleDateChange = (event, selectedDate) => {
		const currentDate = selectedDate || date;
		setShowDatePicker(false);

		const today = new Date().setHours(0, 0, 0, 0);

		if (currentDate < today) {
			setDate(new Date());
			setErrorMessage("Date cannot be set earlier than today");
		} else {
			setDate(currentDate);
			setErrorMessage("");
		}
	};

	const showDatePickerModal = () => {
		setShowDatePicker(true);
	};

	const formatDate = (date) => {
		const day = date.getDate();
		const month = date.getMonth() + 1;
		const year = date.getFullYear();

		return `${day}/${month}/${year}`;
	};

	const handleSubmit = () => {
		const data = {
			eventTitle: title,
			eventDate: formatDate(date),
			eventDescription: description,
			eventCreator: cookies.venueOwnerID,
		};

		axios
			.post("https://fresh-beer-near-me-6e244313be42.herokuapp.com/addEvent", data)
			.then((response) => {
				if (response.data.success) {
					setEventTitle("Success");
					setEventMessage("Event successfully created!");
				} else {
					const { message } = response.data;
					setEventTitle("Error");
					setEventMessage(message);
				}
				setIsEventVisible(true);
			})
			.catch((error) => {
				console.error(error);
			});
	};

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
					<ScrollView>
						<View style={{ marginHorizontal: 22 }}>
							<Text
								style={{
									fontSize: 18,
									...GlobalStyle.headerFont,
									marginBottom: 12,
								}}
							>
								Create Post
							</Text>

							<View style={{ marginBottom: 8 }}>
								<CustomText style={{ marginTop: 10 }}>Title</CustomText>
								<View style={styles.textInput}>
									<TextInput
										onChangeText={(text) => setTitle(text)}
										value={title}
										placeholder="Title"
										placeholderTextColor={COLORS.black}
										keyboardType="default"
										style={{ width: "100%" }}
									></TextInput>
								</View>
							</View>

							<View style={{ marginBottom: 8 }}>
								<CustomText style={{ marginTop: 10 }}>Date</CustomText>
								{/* Error message */}
								{errorMessage ? (
									<Text style={styles.errorMessage}>{errorMessage}</Text>
								) : null}
								<View style={{ flexDirection: "row" }}>
									<View
										style={{
											width: "50%",
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
											value={formatDate(date)}
											placeholder="DD/MM/YYYY"
											onChangeText={(text) => {
												// validate and set the date
												const [day, month, year] = text.split("/");
												const parsedDate = new Date(`${year}-${month}-${day}`);
												if (!isNaN(parsedDate.getTime())) {
													setDate(parsedDate);
													setErrorMessage("");
												} else {
													setErrorMessage("Invalid date format");
												}
											}}
											placeholderTextColor={COLORS.black}
											keyboardType="default"
											style={{ width: "100%" }}
										></TextInput>
									</View>
									<TouchableOpacity
										onPress={showDatePickerModal}
										style={{ marginTop: 20, marginLeft: 15 }}
									>
										<Ionicons name="calendar" size={24} color={COLORS.black} />
									</TouchableOpacity>

									{showDatePicker && (
										<DatePicker
											value={date}
											mode="date"
											display="default"
											onChange={handleDateChange}
										/>
									)}
								</View>
							</View>

							<View
								style={{
									flexDirection: "column",
									height: 250,
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
									Description:
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
										placeholder="Write your description here"
										style={{ ...GlobalStyle.bodyFont }}
										onChangeText={(text) => setDescription(text)}
										value={description}
										multiline
									></TextInput>
								</View>
							</View>

							<View
								style={{
									flexDirection: "row",
									justifyContent: "space-between",
								}}
							>
								<Button
									title="Clear"
									onPress={handleClearButton}
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
									title="Submit"
									color={COLORS.foam}
									filled
									style={{
										width: "40%",
										borderRadius: 10,
										marginTop: 15,
										borderColor: 0,
										elevation: 2,
									}}
									onPress={handleSubmit}
								/>
								<CustomEventAlert
									visible={isEventVisible}
									onClose={() => setIsEventVisible(false)}
									title={EventTitle}
									message={EventMessage}
								/>
							</View>
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
		borderColor: COLORS.grey,
		borderWidth: 1,
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
	errorMessage: {
		color: COLORS.red,
		marginTop: 5,
		marginLeft: 10,
		fontStyle: "italic",
	},
});

export default CreatePromotion;
