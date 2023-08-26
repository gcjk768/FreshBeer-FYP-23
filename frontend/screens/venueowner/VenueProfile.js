import { AntDesign, Ionicons, MaterialIcons } from "@expo/vector-icons";
import axios from "axios";
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
import { SelectList } from "react-native-dropdown-select-list";
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

// custom alert for updating profile changes
const CustomProfileAlert = ({ visible, onClose, title, message }) => {
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

const InquiriesNFeedback = ({ navigation }) => {
	const { cookies } = useCookies();
	const [username, setUsername] = useState("");

	const [venueProfile, setVenueProfile] = useState([]);
	const [selectedVenue, setSelectedVenue] = useState(null);
	const [selectedVenueData, setSelectedVenueData] = useState([]);
	const [editMode, setEditMode] = useState(false);
	const [isProfileVisible, setIsProfileVisible] = useState(false);
	const [ProfileTitle, setProfileTitle] = useState("");
	const [ProfileMessage, setProfileMessage] = useState("");

	// function to handle "edit venue profile"
	const handleEditProfile = () => {
		setEditMode(!editMode);
	};

	useEffect(() => {
		setUsername(cookies.username);
		axios
			.get("https://fresh-beer-near-me-6e244313be42.herokuapp.com/getVenueProfile", {
				params: {
					venueOwnerID: cookies.venueOwnerID,
				},
			})
			.then((response) => {
				setVenueProfile(response.data);
			})
			.catch((error) => {
				console.error("Error retrieving Venue Profile", error);
			});
	}, []);

	useEffect(() => {
		const selectedVenueObject = venueProfile.find(
			(venue) => venue.venueName === selectedVenue
		);
		if (selectedVenueObject) {
			setSelectedVenueData({ ...selectedVenueObject });
		} else {
			setSelectedVenueData(null);
		}
	}, [selectedVenue]);

	const handleUpdate = () => {
		const updateData = {
			venueID: selectedVenueData.venueID,
			venueName: selectedVenueData.venueName,
			venueContact: selectedVenueData.venueContact,
			venueAddress: selectedVenueData.venueAddress,
			venueOperatingHours: selectedVenueData.venueOperatingHours,
		};

		axios
			.post("https://fresh-beer-near-me-6e244313be42.herokuapp.com/updateVenue", updateData)
			.then((response) => {
				if (response.data.success) {
					setProfileTitle("Success");
					setProfileMessage("Venue successfully updated!");
				} else {
					const { message } = response.data;
					setProfileTitle("Error");
					setProfileMessage(message);
				}
				setIsProfileVisible(true);
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
					<ScrollView>
						<View style={{ marginHorizontal: 22 }}>
							<Text
								style={{
									fontSize: 18,
									...GlobalStyle.headerFont,
									marginBottom: 12,
								}}
							>
								Venue's Profile
							</Text>
							<View
								style={{
									position: "relative",
									zIndex: 1,
									marginBottom: 12,
								}}
							>
								<SelectList
									data={venueProfile.map((venue) => ({
										label: venue.venueName,
										value: venue.venueName,
									}))}
									value={selectedVenue}
									setSelected={(value) => setSelectedVenue(value)}
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
									defaultOption={selectedVenue}
									search={true}
								/>
							</View>

							{selectedVenueData ? (
								<View
									style={{ flex: 1, marginHorizontal: 22, marginBottom: 12 }}
								>
									<Image
										source={{ uri: selectedVenueData.venueImage }}
										style={styles.venueImage}
									/>
									<AntDesign
										name="edit"
										size={24}
										color={COLORS.black}
										onPress={handleEditProfile}
										style={{ marginTop: 15, marginLeft: "auto" }}
									/>
									<View style={{ marginBottom: 8 }}>
										<CustomText style={{ marginTop: 10 }}>
											Name of venue
										</CustomText>

										<View style={styles.textInput}>
											<TextInput
												value={selectedVenueData.venueName}
												onChangeText={(value) =>
													setSelectedVenueData({
														...selectedVenueData,
														venueName: value,
													})
												}
												placeholder="Venue name"
												placeholderTextColor={COLORS.black}
												keyboardType="default"
												style={{ width: "100%", color: editMode }}
												editable={editMode}
												disabled={!editMode}
											></TextInput>
										</View>
									</View>

									<View style={{ marginBottom: 8 }}>
										<CustomText style={{ marginTop: 10 }}>
											Venue's Contact
										</CustomText>

										<View style={styles.textInput}>
											<TextInput
												value={selectedVenueData.venueContact}
												onChangeText={(value) =>
													setSelectedVenueData({
														...selectedVenueData,
														venueContact: value,
													})
												}
												placeholder="Contact number"
												placeholderTextColor={COLORS.black}
												keyboardType="default"
												style={{ width: "100%", color: editMode }}
												editable={editMode}
												disabled={!editMode}
											></TextInput>
										</View>
									</View>

									<View style={{ marginBottom: 8 }}>
										<CustomText style={{ marginTop: 10 }}>
											Venue's Address
										</CustomText>

										<View
											style={{
												flexDirection: "column",
												height: 60,
												width: "100%",
												backgroundColor: COLORS.grey,
												marginVertical: 10,
												borderRadius: 15,
												borderColor: 0,
												paddingHorizontal: 12,
											}}
										>
											<View style={{ paddingLeft: 12, marginTop: 10 }}>
												<TextInput
													value={selectedVenueData.venueAddress}
													onChangeText={(value) =>
														setSelectedVenueData({
															...selectedVenueData,
															venueAddress: value,
														})
													}
													multiline
													placeholder="Address"
													placeholderTextColor={COLORS.black}
													keyboardType="default"
													style={{ width: "100%", color: editMode }}
													editable={editMode}
													disabled={!editMode}
												></TextInput>
											</View>
										</View>
									</View>

									<View style={{ marginBottom: 8 }}>
										<CustomText style={{ marginTop: 10 }}>
											Venue's Operating Hours
										</CustomText>

										<View
											style={{
												flexDirection: "column",
												height: 150,
												width: "100%",
												backgroundColor: COLORS.grey,
												marginVertical: 10,
												borderRadius: 15,
												borderColor: 0,
												paddingHorizontal: 12,
											}}
										>
											<View style={{ paddingLeft: 12, marginTop: 10 }}>
												<TextInput
													value={selectedVenueData.venueOperatingHours}
													onChangeText={(value) =>
														setSelectedVenueData({
															...selectedVenueData,
															venueOperatingHours: value,
														})
													}
													multiline
													placeholder="Operating hours"
													placeholderTextColor={COLORS.black}
													keyboardType="default"
													style={{ width: "100%", color: editMode }}
													editable={editMode}
													disabled={!editMode}
												></TextInput>
											</View>
										</View>
									</View>

									<Button
										title="Update Changes"
										onPress={handleUpdate}
										color={COLORS.foam}
										filled
										style={{
											marginTop: 10,
											marginBottom: 4,
											elevation: 2,
										}}
									/>
									<CustomProfileAlert
										visible={isProfileVisible}
										onClose={() => setIsProfileVisible(false)}
										title={ProfileTitle}
										message={ProfileMessage}
									/>
								</View>
							) : (
								<View
									style={{
										flex: 1,
										justifyContent: "center",
										alignItems: "center",
									}}
								>
									<MaterialIcons name="place" size={36} color={COLORS.foam} />
									<Text style={{ ...GlobalStyle.headerFont, fontSize: 22 }}>
										Select a venue!
									</Text>
								</View>
							)}
						</View>
					</ScrollView>
				</SafeAreaView>
			</SafeAreaView>
		</View>
	);
};

const styles = StyleSheet.create({
	venueImage: {
		height: 200,
		width: 320,
		borderRadius: 15,
		borderWidth: 5,
		borderColor: 0,
		marginTop: 20,
		justifyContent: "center",
		alignContent: "center",
		marginBottom: 10,
		alignSelf: "center",
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

export default InquiriesNFeedback;
