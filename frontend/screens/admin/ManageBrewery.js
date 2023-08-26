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

// custom alert for successful brewery creation
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

const ManageBrewery = ({ navigation }) => {
	const [breweryData, setBreweryData] = useState("");
	const [selectedBrewery, setSelectedBrewery] = useState(null);
	const [editBreweryState, setEditBreweryState] = useState(false);
	const [modalVisible, setModalVisible] = useState(false);
	const [addModalVisible, setAddModalVisible] = useState(false);

	const [breweryName, setBreweryName] = useState("");
	const [breweryAddress, setBreweryAddress] = useState("");
	const [breweryContact, setBreweryContact] = useState("");
	const [breweryImage, setBreweryImage] = useState("");
	const [breweryOperatingHours, setBreweryOperatingHours] = useState("");
	const [breweryLatitude, setBreweryLatitude] = useState("");
	const [breweryLongitude, setBreweryLongitude] = useState("");

	const [isEditVisible, setIsEditVisible] = useState(false);
	const [EditTitle, setEditTitle] = useState("");
	const [EditMessage, setEditMessage] = useState("");

	const [isCreateVisible, setIsCreateVisible] = useState(false);
	const [CreateTitle, setCreateTitle] = useState("");
	const [CreateMessage, setCreateMessage] = useState("");

	const handleOpenModal = (brewery) => {
		setSelectedBrewery(brewery);
		setModalVisible(true);
	};

	const handleCloseModal = () => {
		setSelectedBrewery(null);
		setModalVisible(false);
	};

	const handleEditBrewery = () => {
		axios
			.post("https://fresh-beer-near-me-6e244313be42.herokuapp.com/editBrewery", { selectedBrewery })
			.then((response) => {
				if (response.data.success) {
					setEditTitle("Success");
					setEditMessage("Brewery edited!");
					setEditBreweryState(true);
				}
				setIsEditVisible(true);
			})
			.catch((error) => {
				console.error(error);
			});
	};

	const handleAddBrewery = () => {
		const data = {
			breweryName: breweryName,
			breweryAddress: breweryAddress,
			breweryContact: breweryContact,
			breweryImage: breweryImage,
			breweryOperatingHours: breweryOperatingHours,
			breweryLatitude: breweryLatitude,
			breweryLongitude: breweryLongitude,
		};

		axios
			.post("https://fresh-beer-near-me-6e244313be42.herokuapp.com/addBrewery", data)
			.then((response) => {
				if (response.data.success) {
					setCreateTitle("Success");
					setCreateMessage("New brewery data added!");
					setBreweryName("");
					setBreweryAddress("");
					setBreweryContact("");
					setBreweryImage("");
					setBreweryOperatingHours("");
					setBreweryLatitude("");
					setBreweryLongitude("");
				}
				setIsCreateVisible(true);
			})
			.catch((error) => {
				console.error("Error adding new brewery data", error);
			});
	};

	useEffect(() => {
		axios
			.get("https://fresh-beer-near-me-6e244313be42.herokuapp.com/getBrewery")
			.then((response) => {
				setBreweryData(response.data);
				setEditBreweryState(false);
			})
			.catch((error) => {
				console.error("Error retrieving brewery Data", error);
			});
	}, [editBreweryState]);

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
								Manage Brewery
							</Text>

							<View
								style={{
									flexDirection: "row",
									justifyContent: "flex-end",
									alignItems: "flex-end",
								}}
							>
								<Button
									title="Add Brewery"
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
								{/* popup for add brewery */}
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
													Add Brewery
												</Text>

												<View style={{ marginBottom: 8 }}>
													<CustomText style={{ marginTop: 10 }}>
														Brewery name
													</CustomText>
													<View style={styles.textInput}>
														<TextInput
															onChangeText={(text) => setBreweryName(text)}
															placeholder="Brewery Name"
															style={{ width: "100%" }}
														/>
													</View>
												</View>

												<View style={{ marginBottom: 8 }}>
													<CustomText style={{ marginTop: 10 }}>
														Brewery address
													</CustomText>
													<View style={styles.textInput}>
														<TextInput
															onChangeText={(text) => setBreweryAddress(text)}
															placeholder="Brewery Address"
															style={{ width: "100%" }}
														/>
													</View>
												</View>

												<View style={{ marginBottom: 8 }}>
													<CustomText style={{ marginTop: 10 }}>
														Brewery contact
													</CustomText>
													<View style={styles.textInput}>
														<TextInput
															onChangeText={(text) => setBreweryContact(text)}
															placeholder="Brewery Contact"
															style={{ width: "100%" }}
														/>
													</View>
												</View>

												<View style={{ marginBottom: 8 }}>
													<CustomText style={{ marginTop: 10 }}>
														Brewery image
													</CustomText>
													<View style={styles.textInput}>
														<TextInput
															onChangeText={(text) => setBreweryImage(text)}
															placeholder="Brewery Image Link"
															style={{ width: "100%" }}
														/>
													</View>
												</View>

												<View style={{ marginBottom: 8 }}>
													<CustomText style={{ marginTop: 10 }}>
														Brewery operating hours
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
																	setBreweryOperatingHours(text)
																}
																placeholder="Brewery Operating Hours"
																style={{ width: "100%" }}
																multiline
															/>
														</View>
													</View>
												</View>

												<View style={{ marginBottom: 8 }}>
													<CustomText style={{ marginTop: 10 }}>
														Brewery's latitude coordinates
													</CustomText>
													<View style={styles.textInput}>
														<TextInput
															onChangeText={(text) =>
																setBreweryLatitude(parseFloat(text))
															}
															placeholder="Brewerys Latitude Coordinates"
															style={{ width: "100%" }}
														/>
													</View>
												</View>

												<View style={{ marginBottom: 8 }}>
													<CustomText style={{ marginTop: 10 }}>
														Brewery's longitude coordinates
													</CustomText>
													<View style={styles.textInput}>
														<TextInput
															onChangeText={(text) =>
																setBreweryLongitude(parseFloat(text))
															}
															placeholder="Brewery's Longitude Coordinates"
															style={{ width: "100%" }}
														/>
													</View>
												</View>

												<Button
													title="Add Brewery"
													filled
													onPress={handleAddBrewery}
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
								{breweryData.length === 0 ? (
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
											data={["Brewery name", "Address", "Contact", "Action"]}
											style={styles.head}
											textStyle={{
												textAlign: "center",
												...GlobalStyle.headerFont,
											}}
										/>
										<Rows
											data={breweryData.map((brewery) => [
												brewery.breweryName,
												brewery.breweryAddress,
												brewery.breweryContact,
												<Button
													title="View More"
													onPress={() => handleOpenModal(brewery)}
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

							{/* popup for edit brewery */}
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
												Brewery Details
											</Text>
											{selectedBrewery ? (
												<View>
													<View style={{ marginBottom: 8 }}>
														<CustomText style={{ marginTop: 10 }}>
															Brewery name
														</CustomText>
														<View style={styles.textInput}>
															<TextInput
																placeholder="Brewery name"
																value={selectedBrewery.breweryName}
																onChangeText={(text) =>
																	setSelectedBrewery({
																		...selectedBrewery,
																		breweryName: text,
																	})
																}
																style={{ width: "100%" }}
															/>
														</View>
													</View>

													<View style={{ marginBottom: 8 }}>
														<CustomText style={{ marginTop: 10 }}>
															Brewery address
														</CustomText>
														<View style={styles.textInput}>
															<TextInput
																placeholder="Brewery name"
																value={selectedBrewery.breweryAddress}
																onChangeText={(text) =>
																	setSelectedBrewery({
																		...selectedBrewery,
																		breweryAddress: text,
																	})
																}
																style={{ width: "100%" }}
															/>
														</View>
													</View>

													<View style={{ marginBottom: 8 }}>
														<CustomText style={{ marginTop: 10 }}>
															Brewery contact
														</CustomText>
														<View style={styles.textInput}>
															<TextInput
																placeholder="Brewery name"
																value={selectedBrewery.breweryContact}
																onChangeText={(text) =>
																	setSelectedBrewery({
																		...selectedBrewery,
																		breweryContact: text,
																	})
																}
																style={{ width: "100%" }}
															/>
														</View>
													</View>

													<View style={{ marginBottom: 8 }}>
														<CustomText style={{ marginTop: 10 }}>
															Brewery image
														</CustomText>
														<View style={styles.textInput}>
															<TextInput
																placeholder="Brewery name"
																value={selectedBrewery.breweryImage}
																onChangeText={(text) =>
																	setSelectedBrewery({
																		...selectedBrewery,
																		breweryImage: text,
																	})
																}
																style={{ width: "100%" }}
															/>
														</View>
													</View>

													<View style={{ marginBottom: 8 }}>
														<CustomText style={{ marginTop: 10 }}>
															Brewery operating hours
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
																	placeholder="Brewery name"
																	value={selectedBrewery.breweryOperatingHours}
																	onChangeText={(text) =>
																		setSelectedBrewery({
																			...selectedBrewery,
																			breweryOperatingHours: text,
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
												<Text>No brewery data available.</Text>
											)}
											<Button
												title="Edit Brewery"
												filled
												onPress={handleEditBrewery}
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

export default ManageBrewery;
