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

const ManageVenue = ({ navigation }) => {
	const [venueData, setVenueData] = useState([]);
	const [modalVisible, setModalVisible] = useState(false);
	const [addModalVisible, setAddModalVisible] = useState(false);
	const [selectedVenue, setSelectedVenue] = useState(null);
	const [editVenueState, setEditVenueState] = useState(false);

	const [venueName, setVenueName] = useState("");
	const [venueAddress, setVenueAddress] = useState("");
	const [venueContact, setVenueContact] = useState("");
	const [venueImage, setVenueImage] = useState("");
	const [venueOperatingHours, setVenueOperatingHours] = useState("");
	const [venueLatitude, setVenueLatitude] = useState("");
	const [venueLongitude, setVenueLongitude] = useState("");

	const [isEditVisible, setIsEditVisible] = useState(false);
	const [EditTitle, setEditTitle] = useState("");
	const [EditMessage, setEditMessage] = useState("");

	const [isCreateVisible, setIsCreateVisible] = useState(false);
	const [CreateTitle, setCreateTitle] = useState("");
	const [CreateMessage, setCreateMessage] = useState("");

	const handleOpenModal = (venue) => {
		setSelectedVenue(venue);
		setModalVisible(true);
	};

	const handleCloseModal = () => {
		setSelectedVenue(null);
		setModalVisible(false);
	};

	useEffect(() => {
		axios
			.get("https://fresh-beer-near-me-6e244313be42.herokuapp.com/getVenue")
			.then((response) => {
				setVenueData(response.data);
				setEditVenueState(false);
			})
			.catch((error) => {
				console.error("Error retrieving Venue Data", error);
			});
	}, [editVenueState]);

	const handleEditVenue = () => {
		axios
			.post("https://fresh-beer-near-me-6e244313be42.herokuapp.com/editVenue", { selectedVenue })
			.then((response) => {
				if (response.data.success) {
					setEditTitle("Success");
					setEditMessage("Venue edited!");
					setEditVenueState(true);
				}
				setIsEditVisible(true);
			})
			.catch((error) => {
				console.error(error);
			});
	};

	const handleAddVenue = () => {
		const data = {
			venueName: venueName,
			venueAddress: venueAddress,
			venueContact: venueContact,
			venueImage: venueImage,
			venueOperatingHours: venueOperatingHours,
			venueLatitude: venueLatitude,
			venueLongitude: venueLongitude,
		};

		axios
			.post("https://fresh-beer-near-me-6e244313be42.herokuapp.com/addVenue", data)
			.then((response) => {
				if (response.data.success) {
					setCreateTitle("Success");
					setCreateMessage("New venue data added!");
					setVenueName("");
					setVenueAddress("");
					setVenueContact("");
					setVenueImage("");
					setVenueOperatingHours("");
					setVenueLatitude("");
					setVenueLongitude("");
				}
				setIsCreateVisible(true);
			})
			.catch((error) => {
				console.error("Error adding new venue data", error);
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
									marginBottom: 12,
								}}
							>
								Manage Venue
							</Text>

							<View
								style={{
									flexDirection: "row",
									justifyContent: "flex-end",
									alignItems: "flex-end",
								}}
							>
								<Button
									title="Add Venue"
									color={COLORS.foam}
									filled
									style={{
										marginTop: 10,
										marginBottom: 4,
										elevation: 2,
										width: "40%",
									}}
									onPress={() => setAddModalVisible(true)}
								/>
								<Modal visible={addModalVisible} animationType="slide">
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
												onPress={() => setAddModalVisible(false)}
											>
												<Ionicons
													name="arrow-back"
													size={24}
													color={COLORS.black}
												/>
											</TouchableOpacity>
										</View>

										<ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
											<View style={{ marginHorizontal: 22 }}>
												<Text
													style={{
														fontSize: 18,
														...GlobalStyle.headerFont,
														marginTop: 22,
														marginBottom: 12,
													}}
												>
													Add Venue
												</Text>

												<View style={{ marginBottom: 8 }}>
													<CustomText style={{ marginTop: 10 }}>
														Venue name
													</CustomText>
													<View style={styles.textInput}>
														<TextInput
															onChangeText={(text) => setVenueName(text)}
															placeholder="Venue Name"
															style={{ width: "100%" }}
														/>
													</View>
												</View>

												<View style={{ marginBottom: 8 }}>
													<CustomText style={{ marginTop: 10 }}>
														Venue address
													</CustomText>
													<View style={styles.textInput}>
														<TextInput
															onChangeText={(text) => setVenueAddress(text)}
															placeholder="Venue Address"
															style={{ width: "100%" }}
														/>
													</View>
												</View>

												<View style={{ marginBottom: 8 }}>
													<CustomText style={{ marginTop: 10 }}>
														Venue contact
													</CustomText>
													<View style={styles.textInput}>
														<TextInput
															onChangeText={(text) => setVenueContact(text)}
															placeholder="Venue Contact"
															style={{ width: "100%" }}
														/>
													</View>
												</View>

												<View style={{ marginBottom: 8 }}>
													<CustomText style={{ marginTop: 10 }}>
														Venue image
													</CustomText>
													<View style={styles.textInput}>
														<TextInput
															onChangeText={(text) => setVenueImage(text)}
															placeholder="Venue Image Link"
															style={{ width: "100%" }}
														/>
													</View>
												</View>

												<View style={{ marginBottom: 8 }}>
													<CustomText style={{ marginTop: 10 }}>
														Venue operating hours
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
																onChangeText={(text) =>
																	setVenueOperatingHours(text)
																}
																placeholder="Venue Operating Hours"
																style={{ width: "100%" }}
																multiline
															/>
														</View>
													</View>
												</View>

												<View style={{ marginBottom: 8 }}>
													<CustomText style={{ marginTop: 10 }}>
														Venue's latitude coordinates
													</CustomText>
													<View style={styles.textInput}>
														<TextInput
															onChangeText={(text) =>
																setVenueLatitude(parseFloat(text))
															}
															placeholder="Venues Latitude Coordinates"
															style={{ width: "100%" }}
														/>
													</View>
												</View>

												<View style={{ marginBottom: 8 }}>
													<CustomText style={{ marginTop: 10 }}>
														Venue's longitude coordinates
													</CustomText>
													<View style={styles.textInput}>
														<TextInput
															onChangeText={(text) =>
																setVenueLongitude(parseFloat(text))
															}
															placeholder="Venue's Longitude Coordinates"
															style={{ width: "100%" }}
														/>
													</View>
												</View>

												<Button
													title="Add Venue"
													filled
													onPress={handleAddVenue}
													style={{ marginTop: 20 }}
												/>
												<CustomCreateAlert
													visible={isCreateVisible}
													onClose={() => setIsCreateVisible(false)}
													title={CreateTitle}
													message={CreateMessage}
												/>
											</View>
										</ScrollView>
									</View>
								</Modal>
							</View>

							<View style={{ marginTop: 20, justifyContent: "center" }}>
								{venueData.length === 0 ? (
									<Text
										style={{ ...GlobalStyle.bodyFont, textAlign: "center" }}
									>
										No data available.
									</Text>
								) : (
									<Table
										borderStyle={{ borderWidth: 1, borderColor: COLORS.black }}
									>
										<Row
											data={["Venue name", "Address", "Contact", "Action"]}
											style={styles.head}
											textStyle={{
												textAlign: "center",
												...GlobalStyle.headerFont,
											}}
										/>
										<Rows
											data={venueData.map((venue) => [
												venue.venueName,
												venue.venueAddress,
												venue.venueContact,
												<Button
													title="View More"
													onPress={() => handleOpenModal(venue)}
													color={COLORS.blue}
													filled
													style={{
														marginTop: 10,
														marginBottom: 4,
														elevation: 2,
													}}
												/>,
											])}
											textStyle={{
												...GlobalStyle.bodyFont,
												textAlign: "center",
											}}
										/>
									</Table>
								)}
							</View>
							<Modal visible={modalVisible} animationType="slide">
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
										<TouchableOpacity onPress={handleCloseModal}>
											<Ionicons
												name="arrow-back"
												size={24}
												color={COLORS.black}
											/>
										</TouchableOpacity>
									</View>

									<ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
										<View style={{ marginHorizontal: 22 }}>
											<Text
												style={{
													fontSize: 18,
													...GlobalStyle.headerFont,
													marginTop: 22,
													marginBottom: 12,
												}}
											>
												Venue Details
											</Text>
											{selectedVenue ? (
												<View>
													<View style={{ marginBottom: 8 }}>
														<CustomText style={{ marginTop: 10 }}>
															Venue name
														</CustomText>
														<View style={styles.textInput}>
															<TextInput
																placeholder="venue name"
																value={selectedVenue.venueName}
																onChangeText={(text) =>
																	setSelectedVenue({
																		...selectedVenue,
																		venueName: text,
																	})
																}
																style={{ width: "100%" }}
															/>
														</View>
													</View>

													<View style={{ marginBottom: 8 }}>
														<CustomText style={{ marginTop: 10 }}>
															Venue address
														</CustomText>
														<View style={styles.textInput}>
															<TextInput
																placeholder="venue name"
																value={selectedVenue.venueAddress}
																onChangeText={(text) =>
																	setSelectedVenue({
																		...selectedVenue,
																		venueAddress: text,
																	})
																}
																style={{ width: "100%" }}
															/>
														</View>
													</View>

													<View style={{ marginBottom: 8 }}>
														<CustomText style={{ marginTop: 10 }}>
															Venue contact
														</CustomText>
														<View style={styles.textInput}>
															<TextInput
																placeholder="venue name"
																value={selectedVenue.venueContact}
																onChangeText={(text) =>
																	setSelectedVenue({
																		...selectedVenue,
																		venueContact: text,
																	})
																}
																style={{ width: "100%" }}
															/>
														</View>
													</View>

													<View style={{ marginBottom: 8 }}>
														<CustomText style={{ marginTop: 10 }}>
															Venue image
														</CustomText>
														<View style={styles.textInput}>
															<TextInput
																placeholder="venue name"
																value={selectedVenue.venueImage}
																onChangeText={(text) =>
																	setSelectedVenue({
																		...selectedVenue,
																		venueImage: text,
																	})
																}
																style={{ width: "100%" }}
															/>
														</View>
													</View>

													<View style={{ marginBottom: 8 }}>
														<CustomText style={{ marginTop: 10 }}>
															Venue operating hours
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
																	placeholder="venue name"
																	value={selectedVenue.venueOperatingHours}
																	onChangeText={(text) =>
																		setSelectedVenue({
																			...selectedVenue,
																			venueOperatingHours: text,
																		})
																	}
																	multiline
																	style={{ width: "100%" }}
																/>
															</View>
														</View>
													</View>
												</View>
											) : (
												<Text>No venue data available.</Text>
											)}
											<Button
												title="Edit venue"
												filled
												onPress={handleEditVenue}
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
							</Modal>
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
		borderWidth: 0,
		borderRadius: 12,
		alignItems: "center",
		justifyContent: "center",
	},
	head: {
		height: 44,
		backgroundColor: COLORS.foam,
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

export default ManageVenue;
