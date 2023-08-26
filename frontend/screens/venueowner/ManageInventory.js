import { Ionicons, MaterialIcons, Octicons } from "@expo/vector-icons";
import axios from "axios";
import React, { useEffect, useState } from "react";
import {
	Alert,
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

const ManageInventory = ({ navigation }) => {
	const { cookies } = useCookies();
	const [username, setUsername] = useState("");

	const [venueProfile, setVenueProfile] = useState([]);
	const [selectedVenue, setSelectedVenue] = useState(null);
	const [selectedVenueData, setSelectedVenueData] = useState([]);
	const [selectedVenueMenu, setSelectedVenueMenu] = useState([]);
	const [isModalVisible, setIsModalVisible] = useState(false);
	const [beerName, setBeerName] = useState("");
	const [beerDescription, setBeerDescription] = useState("");
	const [beerImage, setBeerImage] = useState("");
	const [beerCategory, setBeerCategory] = useState("");
	const beerCategories = ["Lager", "Stout", "Porter", "IPA", "Pale Ale"];
	const [abv, setAbv] = useState("");
	const [ibu, setIbu] = useState("");
	const [price, setPrice] = useState("");

	const [isEditVisible, setIsEditVisible] = useState(false);
	const [EditTitle, setEditTitle] = useState("");
	const [EditMessage, setEditMessage] = useState("");
	const [showInstructions, setShowInstructions] = useState(true);

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

	useEffect(() => {
		if (selectedVenueData && selectedVenueData.venueMenu) {
			axios
				.get("https://fresh-beer-near-me-6e244313be42.herokuapp.com/getVOVenueMenu", {
					params: {
						venueMenu: selectedVenueData.venueMenu,
					},
				})
				.then((response) => {
					setSelectedVenueMenu(response.data);
				})
				.catch((error) => {
					console.error("Error retrieving Venue Menu", error);
				});
		}
	}, [selectedVenueData]);

	const handleEdit = (beerID, beerName, abv, ibu, price) => {
		const data = {
			beerID: beerID,
			beerName: beerName,
			abv: abv,
			ibu: ibu,
			price: price,
		};

		axios
			.post("https://fresh-beer-near-me-6e244313be42.herokuapp.com/editVenueMenu", data)
			.then((response) => {
				if (response.data.success) {
					setEditTitle("Success");
					setEditMessage("Beer Item edited!");
				} else {
					const { message } = response.data;
					setEditTitle("Error");
					setEditMessage(message);
				}
				setIsEditVisible(true);
			})
			.catch((error) => {
				console.error(error);
			});
	};

	const toggleModal = () => {
		setIsModalVisible(!isModalVisible);
	};

	const addProduct = (
		beerName,
		beerLocation,
		beerDescription,
		beerImage,
		beerCategory,
		abv,
		ibu,
		price
	) => {
		const data = {
			beerName: beerName,
			beerLocation: beerLocation,
			beerDescription: beerDescription,
			beerImage: beerImage,
			beerCategory: beerCategory,
			abv: abv,
			ibu: ibu,
			price: price,
		};

		axios
			.post("https://fresh-beer-near-me-6e244313be42.herokuapp.com/addVenueMenu", data)
			.then((response) => {
				if (response.data.success) {
					// Alert.alert("Success!");
					setEditTitle("Success");
					setEditMessage("New product added!");
				} else {
					const { message } = response.data;
					// Alert.alert("Error!", message);
					setEditTitle("Error");
					setEditMessage(message);
				}
				setIsEditVisible(true);
			})
			.catch((error) => {
				console.error(error);
			});
	};

	const hideInstructions = () => {
		setShowInstructions(false);
	};

	return (
		<View style={{ flex: 1 }}>
			<SafeAreaView style={{ flex: 1, backgroundColor: COLORS.secondary }}>
				{/* Walkthrough instructions */}
				{showInstructions && (
					<View
						style={{
							backgroundColor: "rgba(0, 0, 0, 0.5)",
							position: "absolute",
							height: "100%",
							width: "100%",
							justifyContent: "center",
							alignItems: "center",
							zIndex: 1,
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
								Welcome
							</Text>
							<CustomText
								style={{
									alignSelf: "center",
									fontSize: 16,
									marginBottom: 20,
								}}
							>
								After selecting your venue, click on the words to start editing
							</CustomText>
							<TouchableOpacity
								style={{
									backgroundColor: COLORS.foam,
									padding: 10,
									borderRadius: 8,
									alignItems: "center",
									marginTop: 20,
								}}
								onPress={hideInstructions}
							>
								<Text style={{ ...GlobalStyle.headerFont, fontSize: 16 }}>
									OK
								</Text>
							</TouchableOpacity>
						</View>
					</View>
				)}

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
								Manage Inventory
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
								selectedVenueMenu.map((menuItem) => (
									<View
										key={menuItem.beerID}
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
												borderRadius: 5,
												backgroundColor: COLORS.white,
												elevation: 5,
												marginBottom: 15,
												padding: 20,
											}}
										>
											<View
												style={{ flexDirection: "row", alignItems: "center" }}
											>
												<Image
													source={{ uri: menuItem.beerImage }}
													style={{
														width: 60,
														height: 60,
														borderRadius: 80,
														backgroundColor: COLORS.grey,
														alignSelf: "flex-start",
													}}
													resizeMode="contain"
												/>
												<View>
													<TextInput
														style={{
															...GlobalStyle.headerFont,
															fontSize: 15,
															paddingHorizontal: 15,
														}}
														multiline
														value={menuItem.beerName}
														onChangeText={(text) => {
															setSelectedVenueMenu((prevMenu) =>
																prevMenu.map((item) =>
																	item.beerID === menuItem.beerID
																		? { ...item, beerName: text }
																		: item
																)
															);
														}}
													></TextInput>
													<View
														style={{
															flexDirection: "row",
															paddingHorizontal: 15,
														}}
													>
														<CustomText>ABV: </CustomText>
														<CustomText style={{ marginLeft: 10 }}>
															IBU:
														</CustomText>
														<CustomText style={{ marginLeft: 10 }}>
															Price:
														</CustomText>
													</View>
													<View style={{ flexDirection: "row" }}>
														{/* abv */}
														<TextInput
															style={{ marginLeft: 20 }}
															value={menuItem.abv.toString()}
															onChangeText={(text) => {
																setSelectedVenueMenu((prevMenu) =>
																	prevMenu.map((item) =>
																		item.beerID === menuItem.beerID
																			? { ...item, abv: text }
																			: item
																	)
																);
															}}
														></TextInput>
														{/* ibu */}
														<TextInput
															style={{ marginLeft: 20 }}
															value={menuItem.ibu.toString()}
															onChangeText={(text) => {
																setSelectedVenueMenu((prevMenu) =>
																	prevMenu.map((item) =>
																		item.beerID === menuItem.beerID
																			? { ...item, ibu: text }
																			: item
																	)
																);
															}}
														></TextInput>
														{/* price */}
														<TextInput
															style={{ marginLeft: 20 }}
															value={menuItem.price.toString()}
															onChangeText={(text) => {
																setSelectedVenueMenu((prevMenu) =>
																	prevMenu.map((item) =>
																		item.beerID === menuItem.beerID
																			? { ...item, price: text }
																			: item
																	)
																);
															}}
														></TextInput>
													</View>
												</View>
											</View>
											<View style={{ alignItems: "flex-end" }}>
												<Button
													title="Edit"
													filled
													style={{
														width: "25%",
														borderRadius: 20,
														borderColor: 0,
														elevation: 2,
														height: 40,
													}}
													onPress={() =>
														handleEdit(
															menuItem.beerID,
															menuItem.beerName,
															menuItem.abv,
															menuItem.ibu,
															menuItem.price
														)
													}
												/>
												<CustomEditAlert
													visible={isEditVisible}
													onClose={() => setIsEditVisible(false)}
													title={EditTitle}
													message={EditMessage}
												/>
											</View>
										</View>
									</View>
								))
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
							{selectedVenueData && (
								<Button
									title="Add New Product"
									onPress={toggleModal}
									color={COLORS.foam}
									filled
									style={{
										marginTop: 10,
										marginBottom: 4,
										elevation: 2,
									}}
								/>
							)}
							<Modal animationType="slide" transparent visible={isModalVisible}>
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
										<TouchableOpacity onPress={toggleModal}>
											<Ionicons
												name="arrow-back"
												size={24}
												color={COLORS.black}
											/>
										</TouchableOpacity>
									</View>

									<ScrollView>
										<View style={{ marginBottom: 8 }}>
											<View style={styles.textInput}>
												<TextInput
													placeholder="Beer name"
													value={beerName}
													onChangeText={setBeerName}
													placeholderTextColor={COLORS.black}
													style={{ width: "100%" }}
												/>
											</View>
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
												Beer Description:
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
													style={{ ...GlobalStyle.bodyFont }}
													value={beerDescription}
													onChangeText={setBeerDescription}
													placeholder="Write your beer description here"
													multiline
												></TextInput>
											</View>
										</View>

										<View style={{ marginBottom: 8 }}>
											<View style={styles.textInput}>
												<TextInput
													placeholder="Beer Image URL"
													value={beerImage}
													onChangeText={setBeerImage}
													placeholderTextColor={COLORS.black}
													style={{ width: "100%" }}
												/>
											</View>
										</View>

										<View style={{ marginTop: 8 }}>
											<CustomText>Beer category</CustomText>
											<SelectList
												data={beerCategories.map((category) => ({
													label: category,
													value: category,
												}))}
												value={beerCategory}
												setSelected={setBeerCategory}
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
											/>
										</View>

										<View
											style={{
												flexDirection: "row",
												justifyContent: "space-evenly",
												marginBottom: 8,
											}}
										>
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
													placeholder="ABV"
													value={abv}
													onChangeText={setAbv}
													placeholderTextColor={COLORS.black}
													style={{ width: "100%" }}
												/>
											</View>
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
													marginLeft: 12,
													backgroundColor: COLORS.grey,
												}}
											>
												<TextInput
													placeholder="IBU"
													value={ibu}
													onChangeText={setIbu}
													placeholderTextColor={COLORS.black}
													style={{ width: "100%" }}
												/>
											</View>
										</View>

										<View style={{ marginBottom: 8 }}>
											<View style={styles.textInput}>
												<TextInput
													placeholder="$ Beer Price"
													value={price}
													onChangeText={setPrice}
													placeholderTextColor={COLORS.black}
													style={{ width: "100%" }}
												/>
											</View>
										</View>

										<Button
											title="Add Product"
											onPress={() =>
												addProduct(
													beerName,
													selectedVenueData.venueID,
													beerDescription,
													beerImage,
													beerCategory,
													abv,
													ibu,
													price
												)
											}
											color={COLORS.foam}
											filled
											style={{
												marginTop: 10,
												marginBottom: 4,
												elevation: 2,
											}}
										/>
										<CustomEditAlert
											visible={isEditVisible}
											onClose={() => setIsEditVisible(false)}
											title={EditTitle}
											message={EditMessage}
										/>
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
		marginTop: 20,
		paddingVertical: 10,
		alignItems: "center",
		borderColor: COLORS.black,
		borderRadius: 20,
		width: "50%",
		alignSelf: "center",
	},
	label: {
		fontSize: 16,
		fontWeight: "bold",
		marginBottom: 5,
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

export default ManageInventory;
